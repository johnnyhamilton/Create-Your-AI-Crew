import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const outDir = path.resolve('public/courses/Onboarding/M1');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// -------------------------------------------------------------
// 1. THE 6 CORE INTENTIONS
// -------------------------------------------------------------
function generateCoreIntentionsPdf() {
  const filePath = path.join(outDir, 'The-6-Core-Intentions.pdf');
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
    autoFirstPage: true,
  });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const primaryColor = '#0F172A';
  const subtitleColor = '#0284C7';
  const headingColor = '#0369A1';
  const textColor = '#334155';
  const boldColor = '#0F172A';

  // Header
  doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('THE 6 CORE INTENTIONS', { characterSpacing: 0.5 });
  doc.moveDown(0.3);
  doc.fontSize(13).font('Helvetica').fillColor(subtitleColor).text('Field Reference & Specialist Alignment Guide');
  doc.moveDown(0.8);

  doc.fontSize(10).font('Helvetica').fillColor(textColor).text(
    'When configuring your crew member counterpart, choose the intention that matches the specific phase of your workflow where you need more balance and support. Rather than forcing one assistant to do everything, match your counterpart to the phase of your work.',
    { lineGap: 3.5 }
  );
  doc.moveDown(1.2);

  const sections = [
    {
      num: '1. DISCOVERING',
      tagline: 'Exploring what already exists, scanning unfamiliar areas, and gathering landscape intelligence.',
      whenToUse: 'You are entering an unfamiliar domain, researching competitors, or mapping background context before developing your idea.',
      posture: 'It is precise when answering direct queries, expansive when mapping territory, and connects new concepts through frameworks you already understand.',
      protects: 'Prevent yourself from drowning in information overload or operating on blind assumptions.',
      samples: [
        {
          name: 'Landscape Scout',
          desc: 'It scans unfamiliar areas, maps key players, and surfaces emerging patterns before you start building.'
        },
        {
          name: 'Trend Hunter',
          desc: 'It explores cultural and technological shifts, identifying early signals and relevant case studies.'
        },
        {
          name: 'Research Partner',
          desc: 'It gathers grounded background context, source references, and real-world examples without overwhelming you.'
        }
      ]
    },
    {
      num: '2. IDEATING',
      tagline: 'Opening possibilities, riffing on early creative sparks, and exploring high-contrast angles.',
      whenToUse: 'You have a seed of an idea you want to expand, a blank page, or feel stuck in conventional thinking and need lateral perspectives.',
      posture: 'It builds upon partially-formed thoughts in a playful, generative, and unconstrained manner without rushing to conclusions.',
      protects: 'Prevent premature editing of your ideas so that fragile, high-potential ideas can flourish.',
      samples: [
        {
          name: 'Story Spark',
          desc: 'It riffs with you on your creative seeds, asking you questions to open lateral angles and provide novel storytelling hooks.'
        },
        {
          name: 'Angle Expander',
          desc: 'It generates multiple distinct vantage points for any single problem, challenge, or headline you bring to the moment.'
        },
        {
          name: 'Edge Explorer',
          desc: 'It pushes past obvious, safe ideas to explore provocative, high-contrast possibilities.'
        }
      ]
    },
    {
      num: '3. CLARIFYING',
      tagline: 'Untangling cognitive noise, distilling sprawling thoughts, and locking true signal.',
      whenToUse: 'You need to isolate your core heading when your head is swimming with ideas, notes, files, and discussions.',
      posture: 'It is deeply attentive and structured, holds the moment, and reduces volume while maintaining your core ideas.',
      protects: 'Prevent analysis paralysis and ensure you are building on a clear foundation.',
      samples: [
        {
          name: 'Signal Finder',
          desc: 'It takes your long-form voice notes or messy brainstorms and extracts core themes and underlying intent.'
        },
        {
          name: 'The Distiller',
          desc: 'It cuts your cognitive noise and condenses sprawling conversations into crisp, validated bullet points.'
        },
        {
          name: 'The Compass',
          desc: 'It restores focus when you feel overwhelmed, keeping you pointed directly at your true heading.'
        }
      ]
    },
    {
      num: '4. AMPLIFYING',
      tagline: 'Developing ideas/outlines into full-bodied structures and repeatable models.',
      whenToUse: 'You need a focused partner to help you expand your idea into a full draft in your authentic voice.',
      posture: 'It is expansive, disciplined, and rhythm-aware; fleshes out your arguments, provides grounded analogies, and crafts smooth narrative bridges.',
      protects: "Prevent writer's fatigue and keep long-form creation aligned with your natural style.",
      samples: [
        {
          name: 'The Draft Builder',
          desc: 'It turns your outline/idea into expansive first drafts in your authentic voice.'
        },
        {
          name: 'Framework Architect',
          desc: 'It structures your insights/ideas into visual models or methodologies.'
        },
        {
          name: 'Narrative Expander',
          desc: 'It fills out your sparse notes with vivid metaphors, grounded examples, and narrative bridges.'
        }
      ]
    },
    {
      num: '5. STRENGTHENING',
      tagline: 'Pressure-testing assumptions, spotting blind spots, and verifying rigor before delivering.',
      whenToUse: 'You have a completed draft, proposal, or talking points and need a tough, supportive review before presenting it to stakeholders.',
      posture: 'It brings incisiveness, analysis, and constructive skepticism by testing what must hold true for your idea to succeed.',
      protects: 'Guard yourself from public missteps, unvetted premises, and endless polishing loops.',
      samples: [
        {
          name: 'The Closer',
          desc: 'It cuts through scope creep and your overthinking by holding a firm line to help you finalize and deliver your thing.'
        },
        {
          name: 'Stress Tester',
          desc: 'It acts as a tough reviewer by identifying weak arguments, logical gaps, and unvetted claims.'
        },
        {
          name: 'Assumption Checker',
          desc: 'It uncovers invisible/assumed premises in your proposal and tests what must hold true for your plan to work.'
        }
      ]
    },
    {
      num: '6. PREPARING',
      tagline: 'Rehearsing high-stakes conversations, keynotes, and executive interactions in a safe sandbox.',
      whenToUse: 'You need clarity and confidence when you walk into a high-stakes moment such as a board review, client pitch, delicate negotiation, or team address.',
      posture: 'It roleplays real stakeholders; pushes back with realistic objections; and provides immediate feedback of your delivery and impact.',
      protects: 'Replace your anxiety with embodied confidence before you step into the room.',
      samples: [
        {
          name: 'Room Rehearsal',
          desc: 'It simulates real-time questions and pushback from skeptical stakeholders before your presentation.'
        },
        {
          name: 'Pitch Sparring Partner',
          desc: 'It roleplays an investor, executive, or client, giving immediate feedback on where your pitch stumbles.'
        },
        {
          name: 'Difficult Conversation Guide',
          desc: 'It helps you rehearse delicate feedback or sensitive negotiations in a psychologically safe space.'
        }
      ]
    }
  ];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    
    // Check if we need room or page break
    if (i > 0) {
      if (doc.y > 540) {
        doc.addPage();
      } else {
        doc.moveDown(1.2);
      }
    }

    doc.fontSize(14).font('Helvetica-Bold').fillColor(headingColor).text(s.num);
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text(s.tagline, { lineGap: 3 });
    doc.moveDown(0.6);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text('When to Use');
    doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(s.whenToUse, { lineGap: 2.5 });
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text('The Posture');
    doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(s.posture, { lineGap: 2.5 });
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text('What It Protects');
    doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(s.protects, { lineGap: 2.5 });
    doc.moveDown(0.6);

    doc.fontSize(10).font('Helvetica').fillColor(textColor).text('Sample Crew Members in this Intention');
    doc.moveDown(0.3);

    for (const sample of s.samples) {
      const leftIndent = doc.page.margins.left + 14;
      const bulletX = doc.page.margins.left + 5;
      
      doc.circle(bulletX, doc.y + 4, 1.8).fillColor(boldColor).fill();
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(boldColor).text(sample.name, leftIndent);
      doc.fontSize(9).font('Helvetica').fillColor(textColor).text(sample.desc, leftIndent, undefined, { lineGap: 2 });
      doc.moveDown(0.3);
    }
  }

  doc.end();
  return new Promise((resolve) => stream.on('finish', resolve));
}

// -------------------------------------------------------------
// 2. ONBOARDING YOUR AI CREW
// -------------------------------------------------------------
function generateOnboardingGuidePdf() {
  const filePath = path.join(outDir, 'Onboarding-Your-AI-Crew.pdf');
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
    autoFirstPage: true,
  });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const primaryColor = '#0F172A';
  const subtitleColor = '#0284C7';
  const headingColor = '#0369A1';
  const textColor = '#334155';
  const boldColor = '#0F172A';

  // Title
  doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('ONBOARDING YOUR AI CREW', { characterSpacing: 0.5 });
  doc.moveDown(0.3);
  doc.fontSize(13).font('Helvetica').fillColor(subtitleColor).text('Course Overview & Field Guide');
  doc.moveDown(0.8);

  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'Welcome to Create Your AI Crew. Over the next 45 to 90 minutes, you will step into the role of Captain—moving beyond default AI prompts to design, test, and orchestrate a customized crew of AI counterparts tuned to how you actually think and create.',
    { lineGap: 3 }
  );
  doc.moveDown(0.8);

  doc.fontSize(13).font('Helvetica-Bold').fillColor(headingColor).text('Expanding What Your Work Can Become');
  doc.moveDown(0.3);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'If you have ever sensed that AI could be more powerful, yet find it continually falling short of what you actually need, imagine having a crew of counterparts you designed yourself—each tuned to a different phase of your creative rhythm, ready to bring out your finest thinking.',
    { lineGap: 3 }
  );
  doc.moveDown(0.5);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'Imagine carrying that crew across any AI platform you choose, so you always have a trusted collaborator beside you that understands your context, protects your standards, and lets you effortlessly switch who is at the table as your work evolves.',
    { lineGap: 3 }
  );
  doc.moveDown(0.9);

  doc.fontSize(13).font('Helvetica-Bold').fillColor(headingColor).text('The 5-Module Arc');
  doc.moveDown(0.4);

  const modules = [
    {
      title: '1. Set Your Intention',
      desc: 'Ground a meaningful, active project where you have skin in the game. Clarify your heading and configure your first custom counterpart around one of six core intentions: Discovering, Ideating, Clarifying, Amplifying, Strengthening, or Preparing.'
    },
    {
      title: '2. Try Your First Crew Member',
      desc: 'Step into your preferred AI platform, run 10 to 20 substantive turns on your real deliverable, and practice active steering techniques to keep the exchange sharp and aligned with your goals. Refine the fit until it feels like a tailored outfit designed for your natural stride.'
    },
    {
      title: '3. Use Two Crew Members in One Chat',
      desc: 'Work naturally shifts gears as it matures. Map your personal 3-to-7-step workflow, identify a different phase calling for a different posture, and build your second crew member to complement the first. Bring both into a single conversation thread—calling on each counterpart by name as your project moves forward.'
    },
    {
      title: '4. Take Your Crew to Other AI Platforms',
      desc: 'Your thinking belongs to you across every tool you touch. Package an active continuity brief of your in-flight work and carry your crew profile across platforms—Claude, Gemini, ChatGPT, Microsoft Copilot, or FYI. Experience firsthand how different models bring complementary textures to your team.'
    },
    {
      title: "5. See the Framework & What's Next",
      desc: 'Step back to reveal the 5-phase Manifesting Framework (Focus → Hold the Moment → Spark → Riff → Manifest) that guided your progress. With your foundation established, choose your next steps freely across ongoing practice or advanced capability courses, backed by permanent ownership of your profiles.'
    }
  ];

  for (const m of modules) {
    if (doc.y > 660) doc.addPage();
    doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text(m.title);
    doc.fontSize(9).font('Helvetica').fillColor(textColor).text(m.desc, { lineGap: 2.5 });
    doc.moveDown(0.5);
  }

  // Page break for What you will walk away with & Operating principles
  if (doc.y > 500) doc.addPage();
  else doc.moveDown(0.8);

  doc.fontSize(13).font('Helvetica-Bold').fillColor(headingColor).text('What You Will Walk Away With');
  doc.moveDown(0.4);

  const takeaways = [
    {
      title: 'Two Tailored Crew Members',
      desc: 'Custom-built counterparts configured around your real projects, strengths, and communication style.'
    },
    {
      title: 'Single-Thread Multi-Crew Collaboration',
      desc: 'The practical capability to switch between different specialists within the same conversation without losing context or momentum.'
    },
    {
      title: 'True Multi-Platform Portability',
      desc: 'A universal setup you can bring directly into Claude, Gemini, ChatGPT, Microsoft Copilot, FYI, or almost any AI platform.'
    },
    {
      title: 'The Continuity Brief Habit',
      desc: 'A repeatable technique for packaging active project context and transferring it seamlessly between tools.'
    }
  ];

  for (const t of takeaways) {
    const leftIndent = doc.page.margins.left + 14;
    const bulletX = doc.page.margins.left + 5;
    doc.circle(bulletX, doc.y + 4, 1.8).fillColor(boldColor).fill();
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(boldColor).text(t.title, leftIndent);
    doc.fontSize(9).font('Helvetica').fillColor(textColor).text(t.desc, leftIndent, undefined, { lineGap: 2 });
    doc.moveDown(0.3);
  }

  doc.moveDown(0.8);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(headingColor).text('Operating Principles for Captains');
  doc.moveDown(0.4);

  const principles = [
    {
      title: '1. You are the Captain; Your Configuration Profiles Are the Crew',
      desc: 'The AI never directs your life or work. The initial spark, direction, discernment, and final validation always belong to you. Each AI crew member supports your ideas in ways that work best for you.'
    },
    {
      title: '2. Skin in the Game',
      desc: 'Counterparts only come alive when working on projects with real personal stakes and energy. Sterile or hypothetical exercises produce flat, generic outputs.'
    },
    {
      title: '3. The Pace Is Yours',
      desc: 'This course is deliberately unhurried. You can complete it in one continuous 45–90 minute session or pause and return whenever you want. Your conversational state and canvas artifacts persist across visits.'
    }
  ];

  for (const p of principles) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text(p.title);
    doc.fontSize(9).font('Helvetica').fillColor(textColor).text(p.desc, { lineGap: 2.5 });
    doc.moveDown(0.5);
  }

  doc.end();
  return new Promise((resolve) => stream.on('finish', resolve));
}

// -------------------------------------------------------------
// 3. WHAT IS AN AI CREW?
// -------------------------------------------------------------
function generateWhatIsAnAiCrewPdf() {
  const filePath = path.join(outDir, 'What-Is-An-AI-Crew.pdf');
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
    autoFirstPage: true,
  });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const primaryColor = '#0F172A';
  const subtitleColor = '#0284C7';
  const headingColor = '#0369A1';
  const textColor = '#334155';
  const boldColor = '#0F172A';

  // Title
  doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('WHAT IS AN AI CREW?', { characterSpacing: 0.5 });
  doc.moveDown(0.3);
  doc.fontSize(13).font('Helvetica').fillColor(subtitleColor).text('Moving from Default Mirrors to Configured Counterparts');
  doc.moveDown(0.8);

  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'Most people interact with artificial intelligence as an extractive search box, a task machine, or an agreeable mirror. Understanding the power of an AI Crew begins by understanding what it is not.',
    { lineGap: 3 }
  );
  doc.moveDown(0.8);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(headingColor).text('The Core Contrast: Default Mirror vs. Configured Counterpart');
  doc.moveDown(0.5);

  // Draw Table
  const tableTop = doc.y;
  const leftX = doc.page.margins.left;
  const colWidths = [85, 175, 244]; // Total = 504 (612 - 108)
  const headers = ['Dimension', 'The Default AI Mirror', 'The Configured Counterpart'];

  const rows = [
    [
      'Core Behavior',
      'Echoes your prompts and flatters your assumptions',
      'Understands your context while holding the productive gap needed to stretch your thinking'
    ],
    [
      'Posture',
      'Agreeable, sycophantic, and generic',
      'Tuned to a specific behavioral posture—bringing creative friction, structure, or lateral ideas'
    ],
    [
      'Scope',
      'A single generic assistant expected to handle everything from wild brainstorming to final proofreading',
      'An intentional ensemble of distinct specialists, each designed for a specific phase of your workflow'
    ],
    [
      'Portability',
      'Bound to a single vendor window; your context is trapped inside one proprietary silo',
      'Completely portable; travels seamlessly across Gemini Gems, Claude Projects, Custom GPTs, Copilot Agents, or FYI.'
    ]
  ];

  // Header background
  doc.rect(leftX, tableTop, 504, 24).fillColor('#4372B8').fill();
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
  let curX = leftX;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], curX + 6, tableTop + 7, { width: colWidths[i] - 12, ellipsis: true });
    curX += colWidths[i];
  }

  let curY = tableTop + 24;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const bgColor = r % 2 === 0 ? '#F3F6FA' : '#EBF1F7';

    // Calculate height needed
    const h1 = doc.heightOfString(row[0], { width: colWidths[0] - 12, fontSize: 8.5 });
    const h2 = doc.heightOfString(row[1], { width: colWidths[1] - 12, fontSize: 8.5 });
    const h3 = doc.heightOfString(row[2], { width: colWidths[2] - 12, fontSize: 8.5 });
    const rowHeight = Math.max(h1, h2, h3) + 14;

    doc.rect(leftX, curY, 504, rowHeight).fillColor(bgColor).fill();

    curX = leftX;
    // Cell 1
    doc.fillColor(boldColor).font('Helvetica-Bold').fontSize(8.5)
       .text(row[0], curX + 6, curY + 6, { width: colWidths[0] - 12 });
    curX += colWidths[0];

    // Cell 2
    doc.fillColor(textColor).font('Helvetica').fontSize(8.5)
       .text(row[1], curX + 6, curY + 6, { width: colWidths[1] - 12, lineGap: 2 });
    curX += colWidths[1];

    // Cell 3
    doc.fillColor(textColor).font('Helvetica').fontSize(8.5)
       .text(row[2], curX + 6, curY + 6, { width: colWidths[2] - 12, lineGap: 2 });

    curY += rowHeight;
  }

  doc.y = curY + 16;

  doc.fontSize(12).font('Helvetica-Bold').fillColor(headingColor).text('Why "Counterpart"?');
  doc.moveDown(0.3);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'A mirror leaves no room for you to explore and grow. If an AI tool agrees with every word you write, it provides no genuine support.',
    { lineGap: 2.5 }
  );
  doc.moveDown(0.4);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'A counterpart is intentionally designed to be different: it is aligned enough to honor your standards, understand your voice, and protect what matters to you, yet distinct enough to challenge, untangle, or structure your thoughts. That productive gap between Captain and Counterpart is where fresh sparks happen.',
    { lineGap: 2.5 }
  );
  doc.moveDown(0.8);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(headingColor).text('The Two Layers of an AI Crew Member');
  doc.moveDown(0.3);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text('Every configured counterpart in your crew is built from three structural layers:');
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text('1. The Foundation (Who You Are)');
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'Your cognitive style, perspective, authentic voice, and core values. Built once, the Foundation serves as the common bedrock shared by all of your crew members, ensuring they understand how your mind works without needing to be re-taught on every turn.',
    { lineGap: 2.5 }
  );
  doc.moveDown(0.6);

  // Page break for page 2
  doc.addPage();

  doc.fontSize(10).font('Helvetica-Bold').fillColor(boldColor).text('2. The Specialist Focus (The Job to Be Done)');
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'The specific behavioral posture assigned to that counterpart. A specialist does not try to be everything; it holds one dedicated intention (Discovering, Ideating, Clarifying, Amplifying, Strengthening, or Preparing) so its focus remains sharp.',
    { lineGap: 2.5 }
  );
  doc.moveDown(0.4);

  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text('It also has nuanced controls that shape how the counterpart collaborates with you:');
  doc.moveDown(0.3);

  const controls = [
    { label: 'Pace', text: 'Quality-seeking and reflective vs. Fast and efficient.' },
    { label: 'Granularity', text: 'Fine, meticulous detail vs. High-level big picture.' },
    { label: 'Rhythm', text: 'Structured frameworks vs. Free-flowing, organic exploration.' },
    { label: 'Response Length', text: 'Concise nudges vs. Expansive, comprehensive drafts.' }
  ];

  for (const c of controls) {
    const leftIndent = doc.page.margins.left + 14;
    const bulletX = doc.page.margins.left + 5;
    doc.circle(bulletX, doc.y + 4, 1.8).fillColor(boldColor).fill();
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(boldColor).text(c.label + ': ', leftIndent, undefined, { continued: true });
    doc.font('Helvetica').fillColor(textColor).text(c.text, { lineGap: 2 });
    doc.moveDown(0.25);
  }

  doc.moveDown(0.8);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(headingColor).text('The Wardrobe Metaphor: Clothes vs. Gear');
  doc.moveDown(0.3);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text('Think of default AI as a generic white t-shirt and blue jeans—one size fits nobody well.');
  doc.moveDown(0.3);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text('An AI Crew is a custom wardrobe tailored to your actual journey:');
  doc.moveDown(0.3);

  const wardrobe = [
    { label: 'Your Foundation', text: 'is the person wearing the clothes.' },
    { label: 'Your Crew Members', text: 'are the tailored outfits packed for specific environments—one suited for messy brainstorming, another for high-stakes executive review.' },
    { label: 'Your Crew Profile', text: 'is the wardrobe—keeping your configurations organized so you can change who is at the table whenever your workflow shifts.' }
  ];

  for (const w of wardrobe) {
    const leftIndent = doc.page.margins.left + 14;
    const bulletX = doc.page.margins.left + 5;
    doc.circle(bulletX, doc.y + 4, 1.8).fillColor(boldColor).fill();
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(boldColor).text(w.label + ' ', leftIndent, undefined, { continued: true });
    doc.font('Helvetica').fillColor(textColor).text(w.text, { lineGap: 2 });
    doc.moveDown(0.3);
  }

  doc.moveDown(0.8);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(headingColor).text('Stepping into the Role of Captain');
  doc.moveDown(0.3);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(
    'When you collaborate with an AI Crew, you never outsource your brain. You step firmly into the role of Captain:'
  );
  doc.moveDown(0.3);

  const captainRoles = [
    'You provide the original spark and set the project heading.',
    'You decide who sits at the table as the work evolves.',
    'You steer the conversation, call out drift, and hold the moment.',
    'You retain ultimate discernment over what ships and what needs revision.'
  ];

  for (const r of captainRoles) {
    const leftIndent = doc.page.margins.left + 14;
    const bulletX = doc.page.margins.left + 5;
    doc.circle(bulletX, doc.y + 4, 1.8).fillColor(boldColor).fill();
    doc.fontSize(9.5).font('Helvetica').fillColor(textColor).text(r, leftIndent, undefined, { lineGap: 2 });
    doc.moveDown(0.3);
  }

  doc.end();
  return new Promise((resolve) => stream.on('finish', resolve));
}

async function run() {
  console.log('Generating PDF 1: The-6-Core-Intentions.pdf...');
  await generateCoreIntentionsPdf();
  console.log('Generating PDF 2: Onboarding-Your-AI-Crew.pdf...');
  await generateOnboardingGuidePdf();
  console.log('Generating PDF 3: What-Is-An-AI-Crew.pdf...');
  await generateWhatIsAnAiCrewPdf();
  console.log('All PDFs generated successfully in ' + outDir);
}

run().catch(console.error);
