import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Send, ArrowRight, Sparkles, RefreshCw, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, FoundationRecord, SpecialistRecord } from '../types';
import { parseResponseMarkers } from '../utils/markerParser';

interface ChatStateProps {
  onRecordsReady: (foundation: FoundationRecord, specialist: SpecialistRecord) => void;
  user?: User | null;
  initialMode?: 'capture' | 'add_member';
  userFoundation?: FoundationRecord | null;
  crewMembers?: SpecialistRecord[];
}

export const ChatState: React.FC<ChatStateProps> = ({
  onRecordsReady,
  user,
  initialMode = 'capture',
  userFoundation,
  crewMembers = [],
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [parsedFoundation, setParsedFoundation] = useState<FoundationRecord | null>(null);
  const [parsedSpecialist, setParsedSpecialist] = useState<SpecialistRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitializedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const inputBeforeListeningRef = useRef<string>('');

  useEffect(() => {
    // Check if SpeechRecognition is available in browser
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const prefix = inputBeforeListeningRef.current;
        setInput(prefix ? `${prefix} ${transcript}` : transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleListening = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
    } else {
      inputBeforeListeningRef.current = input;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setSpeechError('Could not start microphone.');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Initial silent trigger on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const hasFoundation =
      userFoundation &&
      typeof userFoundation === 'object' &&
      Object.keys(userFoundation).length > 0;

    const effectiveMode = initialMode === 'add_member' && hasFoundation ? 'add_member' : 'capture';

    let initialTriggerText: string;

    if (effectiveMode === 'add_member' && userFoundation) {
      const personName = user?.displayName || userFoundation.personName || null;
      const existingCrew = (crewMembers || []).map((m) => ({
        name: m.name || '',
        focus: m.focus || '',
        role: m.role || '',
        intent: m.intent || m.focus || '',
      }));

      initialTriggerText = JSON.stringify({
        mode: 'add_member',
        personName,
        existingTraits: userFoundation,
        existingCrew,
      });
    } else {
      const personName = user?.displayName || null;
      initialTriggerText = JSON.stringify({
        mode: 'capture',
        personName,
      });
    }

    const initialTriggerMsg: Message = {
      id: 'trigger-0',
      role: 'user',
      text: initialTriggerText,
      isHiddenTrigger: true,
    };

    setMessages([initialTriggerMsg]);
    sendMessage([initialTriggerMsg]);
  }, []);

  const sendMessage = async (history: Message[]) => {
    setIsStreaming(true);
    setError(null);

    try {
      // Prepare payload with hidden messages included
      const apiMessages = history.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        let errBody = '';
        try {
          const errJson = await res.json();
          if (typeof errJson.error === 'string') {
            errBody = errJson.error;
          } else if (errJson.error?.message && typeof errJson.error.message === 'string') {
            errBody = errJson.error.message;
          } else if (typeof errJson.message === 'string') {
            errBody = errJson.message;
          }
        } catch (_) {
          errBody = await res.text();
        }

        if (!errBody || errBody.trim().startsWith('{') || errBody.trim().startsWith('[')) {
          errBody = 'Give me just a moment — lots of thinking happening. Try again in a few seconds.';
        }

        throw new Error(errBody);
      }

      const data = await res.json();
      const responseText = data.text || '';

      // Check for completion markers
      const parsed = parseResponseMarkers(responseText);

      const guideMsg: Message = {
        id: `guide-${Date.now()}`,
        role: 'guide',
        text: parsed.cleanText,
      };

      setMessages((prev) => [...prev, guideMsg]);

      if (parsed.hasMarkers && parsed.foundationRecord && parsed.specialistRecord) {
        setParsedFoundation(parsed.foundationRecord);
        setParsedSpecialist(parsed.specialistRecord);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Connection interrupted. Please try sending again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = (overrideText?: string) => {
    const textToSend = overrideText || input.trim();
    if (!textToSend || isStreaming) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!overrideText) setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    sendMessage(newHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea up to 7 visible lines (~188px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 188)}px`;
    }
  }, [input]);

  const visibleMessages = messages.filter((m) => !m.isHiddenTrigger);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto px-4 sm:px-6 font-sans">
      {/* Subtle Progress Hint */}
      <div className="py-3 px-4 mb-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-[#1B1B1B]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#649940] animate-pulse"></span>
          <span className="font-bold text-[#004364]">AI Guide</span>
          <span className="text-stone-300">•</span>
          <span>Configuring your custom crew</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-stone-500">
          <Sparkles className="w-3.5 h-3.5 text-[#CBA62C]" />
          <span>Session Ephemeral & Private</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
        {visibleMessages.length === 0 && isStreaming && (
          <div className="py-12 text-center text-stone-400 animate-pulse text-sm">
            Connecting with your AI Guide...
          </div>
        )}

        {visibleMessages.map((msg) => {
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="bg-stone-100 text-[#1B1B1B] px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] text-base leading-relaxed border border-stone-200">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full text-[#1B1B1B] text-base leading-relaxed space-y-3 pl-1 pr-4">
                  {msg.text ? (
                    <div className="markdown-content text-[#1B1B1B]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-4 rounded-xl border border-stone-200 bg-white shadow-xs">
                              <table className="w-full text-left text-sm border-collapse min-w-[500px]" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-stone-100 text-[#004364] font-medium border-b border-stone-200" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-4 py-3 font-semibold text-xs text-[#004364] uppercase tracking-wider border-r border-stone-200 last:border-r-0" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-4 py-3 text-[#1B1B1B] border-t border-r border-stone-200 last:border-r-0 align-top" {...props} />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr className="hover:bg-stone-50 transition-colors" {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-stone-400 text-sm py-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004364] animate-ping" />
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {error && (
          <div className="p-4 rounded-xl bg-[#881719]/10 border border-[#881719]/20 text-[#881719] text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => sendMessage(messages)}
              className="px-3 py-1 bg-[#881719] hover:bg-[#6c1214] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Completion Trigger Banner when records are parsed */}
      {parsedFoundation && parsedSpecialist && (
        <div className="my-4 p-5 rounded-2xl bg-stone-50 border border-[#649940]/40 text-[#1B1B1B] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-[#004364]">
              <Sparkles className="w-4 h-4 text-[#CBA62C]" />
              <span>Your AI Crew Foundation & Specialist Records Are Ready</span>
            </div>
            <p className="text-xs text-[#1B1B1B]/70 mt-1">
              Your conversation has captured your core traits and specialist profile.
            </p>
          </div>
          <button
            onClick={() => onRecordsReady(parsedFoundation, parsedSpecialist)}
            className="w-full sm:w-auto px-6 py-3 bg-[#649940] hover:bg-[#527d34] text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Generate my crew profiles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Text Input Area */}
      <div className="pb-6 pt-2">
        {speechError && (
          <div className="mb-2 text-xs text-[#881719] bg-[#881719]/10 px-3 py-1.5 rounded-lg border border-[#881719]/20 flex items-center justify-between">
            <span>{speechError}</span>
            <button onClick={() => setSpeechError(null)} className="text-xs font-semibold ml-2 hover:underline">Dismiss</button>
          </div>
        )}

        <div className="relative flex items-end bg-white border border-stone-300 rounded-2xl p-2.5 shadow-sm focus-within:border-[#004364] focus-within:ring-1 focus-within:ring-[#004364] transition-all">
          {isListening && (
            <div className="absolute -top-3 left-4 flex items-center gap-1.5 text-xs text-[#881719] font-medium bg-[#881719]/10 px-2.5 py-0.5 rounded-full border border-[#881719]/20 animate-pulse z-10">
              <span className="w-2 h-2 rounded-full bg-[#881719] animate-ping" />
              <span>Listening... Speak into your mic</span>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... Speak your response..." : "Type or speak your response..."}
            rows={1}
            disabled={isStreaming}
            className="w-full resize-none bg-transparent px-3 py-2 text-base text-[#1B1B1B] placeholder-stone-400 focus:outline-none min-h-[44px] max-h-[188px] leading-relaxed disabled:opacity-50 overflow-y-auto"
          />

          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isStreaming}
            className={`p-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 ml-1.5 border ${
              isListening
                ? 'bg-[#881719] hover:bg-[#6c1214] text-white border-[#881719] animate-pulse shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-[#004364] border-stone-200'
            }`}
            title={isListening ? 'Stop microphone' : 'Speak your response (Microphone)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 bg-[#004364] hover:bg-[#00314a] disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 ml-1.5"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Quick finalize hint if conversation is advanced */}
        {visibleMessages.length >= 4 && !parsedFoundation && !isStreaming && (
          <div className="mt-2.5 text-center">
            <button
              onClick={() => handleSend("I'm ready. Please finalize my Foundational Record and Specialist Record now.")}
              className="text-xs text-[#657590] hover:text-[#004364] underline decoration-dotted underline-offset-4 transition-colors cursor-pointer"
            >
              Ready to wrap up? Click here to generate your records.
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
