import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { CAPTURE_ENGINE, GENERATE_ENGINE } from "./src/constants/engines.js";

const ADMIN_EMAIL = "johnny@2itedsol.com";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy GoogleGenAI getter to prevent crash on startup if GEMINI_API_KEY is not set immediately
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const FRIENDLY_RATE_LIMIT_MSG =
  "Give me just a moment — lots of thinking happening. Try again in a few seconds.";

function parseRetryDelayMs(err: any): number | null {
  try {
    if (err?.retryDelay) {
      if (typeof err.retryDelay === "number") return err.retryDelay;
      if (typeof err.retryDelay === "string") {
        const match = err.retryDelay.match(/([\d.]+)\s*s?/i);
        if (match) return parseFloat(match[1]) * 1000;
      }
    }

    const details =
      err?.errorDetails || err?.details || err?.response?.data?.error?.details;
    if (Array.isArray(details)) {
      for (const item of details) {
        if (item?.retryDelay) {
          if (typeof item.retryDelay === "string") {
            const match = item.retryDelay.match(/([\d.]+)\s*s?/i);
            if (match) return parseFloat(match[1]) * 1000;
          }
          if (item.retryDelay?.seconds) {
            return Number(item.retryDelay.seconds) * 1000;
          }
        }
      }
    }

    const errString =
      typeof err === "string" ? err : JSON.stringify(err, Object.getOwnPropertyNames(err));
    const delayMatch =
      errString.match(/retryDelay["']?\s*:\s*["']?([\d.]+)\s*s?/i) ||
      errString.match(/retry_delay["']?\s*:\s*["']?([\d.]+)\s*s?/i);
    if (delayMatch) {
      const sec = parseFloat(delayMatch[1]);
      if (!isNaN(sec) && sec > 0) return sec * 1000;
    }
  } catch (_) {
    // Ignore parse errors
  }
  return null;
}

function is429Error(err: any): boolean {
  if (!err) return false;
  if (err.status === 429 || err.statusCode === 429 || err.code === 429) return true;
  if (err.status === "RESOURCE_EXHAUSTED" || err.code === "RESOURCE_EXHAUSTED") return true;
  const msg = String(err.message || err.error || err);
  if (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("rate limit")
  ) {
    return true;
  }
  return false;
}

async function callWith429Retry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (is429Error(err)) {
      console.warn("429 Rate limit encountered. Attempting single retry...");
      console.error("FULL 429 Error Body:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      const parsedDelay = parseRetryDelayMs(err);
      const delayMs = parsedDelay ? Math.min(parsedDelay, 3000) : 3000;
      console.log(`Waiting ${delayMs}ms before retrying Gemini API call...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      try {
        return await fn();
      } catch (retryErr: any) {
        console.error("Retry after 429 failed:", retryErr);
        console.error("FULL Retry Error Body:", JSON.stringify(retryErr, Object.getOwnPropertyNames(retryErr), 2));
        throw new Error(FRIENDLY_RATE_LIMIT_MSG);
      }
    }
    throw err;
  }
}

// Chat endpoint for multi-turn conversation
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages payload" });
    }

    const ai = getGenAI();

    const KICKOFF_TEXT = JSON.stringify({ mode: 'capture', personName: null });

    // Filter out messages with empty or whitespace-only text
    let rawMessages: Array<{ role: string; text: string }> = messages.filter(
      (m: any) => m && typeof m.text === 'string' && m.text.trim().length > 0
    );

    // Check if the first message is the hidden kickoff JSON user turn
    const hasKickoffFirst =
      rawMessages.length > 0 &&
      (rawMessages[0].role === 'user' || rawMessages[0].role === 'human') &&
      rawMessages[0].text.includes('mode');

    if (!hasKickoffFirst) {
      rawMessages.unshift({
        role: 'user',
        text: KICKOFF_TEXT,
      });
    }

    // Map messages to Gemini contents with strict user/model alternation
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of rawMessages) {
      const mappedRole: 'user' | 'model' =
        msg.role === 'guide' || msg.role === 'model' ? 'model' : 'user';

      if (contents.length === 0) {
        // First turn must always be user
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }],
        });
      } else {
        const lastTurn = contents[contents.length - 1];
        if (lastTurn.role === mappedRole) {
          // Merge text if role matches previous to enforce strict alternation
          lastTurn.parts[0].text += `\n${msg.text}`;
        } else {
          contents.push({
            role: mappedRole,
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    const response = await callWith429Retry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: CAPTURE_ENGINE,
        },
      })
    );

    res.json({ text: response.text || "" });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    console.error("FULL Gemini API Error Body:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

    let errorMessage = err?.message || String(err) || "Internal server error";

    if (
      is429Error(err) ||
      errorMessage === FRIENDLY_RATE_LIMIT_MSG ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.includes("429")
    ) {
      errorMessage = FRIENDLY_RATE_LIMIT_MSG;
      return res.status(429).json({ error: errorMessage });
    }

    if (errorMessage.trim().startsWith("{") || errorMessage.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(errorMessage);
        errorMessage =
          parsed.error?.message ||
          parsed.error ||
          parsed.message ||
          "An unexpected error occurred. Please try again.";
      } catch (_) {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
    }

    res.status(500).json({ error: errorMessage });
  }
});

// Generation endpoint for generating crew profile markdown
app.post("/api/generate", async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload) {
      return res.status(400).json({ error: "Missing generation payload" });
    }

    const ai = getGenAI();
    const promptString = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

    const response = await callWith429Retry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptString,
        config: {
          systemInstruction: GENERATE_ENGINE,
        },
      })
    );

    res.json({ profile: response.text || "" });
  } catch (err: any) {
    console.error("Error in /api/generate:", err);
    console.error("FULL Gemini API Error Body:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

    let errorMessage = err?.message || String(err) || "Failed to generate crew profile";

    if (
      is429Error(err) ||
      errorMessage === FRIENDLY_RATE_LIMIT_MSG ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.includes("429")
    ) {
      errorMessage = FRIENDLY_RATE_LIMIT_MSG;
      return res.status(429).json({ error: errorMessage });
    }

    if (errorMessage.trim().startsWith("{") || errorMessage.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(errorMessage);
        errorMessage =
          parsed.error?.message ||
          parsed.error ||
          parsed.message ||
          "An unexpected error occurred. Please try again.";
      } catch (_) {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
    }

    res.status(500).json({ error: errorMessage });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.setHeader('Surrogate-Control', 'no-store');
        }
      },
    }));
    app.get("*", (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Configure Your AI Crew server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
