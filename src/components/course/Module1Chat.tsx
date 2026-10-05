import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, Compass, AlertCircle, RefreshCw, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CourseM1State } from '../../types';

export interface Message {
  id: string;
  role: 'user' | 'guide';
  text: string;
}

export interface Module1ChatProps {
  courseState: CourseM1State;
  onStateUpdate: (newState: Partial<CourseM1State>) => void;
  externalTriggerMessage?: string | null;
  onClearExternalTrigger?: () => void;
  prePopulatedInput?: string | null;
  onClearPrePopulatedInput?: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onCompleteModule1?: () => void;
}

export function cleanMessageText(text: string): string {
  if (!text) return '';
  return text.replace(/<state_json>[\s\S]*?(<\/state_json>|$)/g, '').trim();
}

export function extractStateJson(text: string): Partial<CourseM1State> | null {
  if (!text) return null;
  const match = text.match(/<state_json>([\s\S]*?)<\/state_json>/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.warn('Failed to parse <state_json> payload:', e);
    }
  }
  return null;
}

export const INITIAL_GUIDE_MESSAGE: Message = {
  id: 'guide-intro',
  role: 'guide',
  text: `Welcome! I’m your onboarding guide for this course. Over the next five modules, we’re going to step you into the role of Captain—designing, testing, and running an AI crew customized to how you think and create. This course usually takes between 45-90 minutes, depending on how long you want to spend in each activity. You can do it all at once or take breaks and return whenever you want- it’s all up to you.

To kick things off: what’s your name, and what interests you about creating an AI crew?
<state_json>
{
  "currentSection": 1,
  "completedSections": [],
  "userProject": null,
  "selectedIntention": null,
  "selectedPath": null,
  "milestones": {
    "section_1_complete": false,
    "welcomeCompleted": false,
    "projectGrounded": false,
    "intentionSelected": false,
    "section_3_complete": false,
    "counterpartConfigured": false
  }
}
</state_json>`,
};

export const Module1Chat: React.FC<Module1ChatProps> = ({
  courseState,
  onStateUpdate,
  externalTriggerMessage,
  onClearExternalTrigger,
  prePopulatedInput,
  onClearPrePopulatedInput,
  messages,
  setMessages,
  onCompleteModule1,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const initialTextRef = useRef<string>('');
  const inputRef = useRef<string>('');

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // Check speech recognition support and clean up on unmount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
    }
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Toggle voice-to-text dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setInput((prev) => prev.trim());
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Capture whatever text already exists in the textarea, ensuring a trailing space
      initialTextRef.current = inputRef.current ? `${inputRef.current.trim()} ` : '';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Iterate through all results in the current session so pausing never erases prior speech
        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            const trimmed = text.trim();
            if (trimmed) {
              finalTranscript += `${trimmed} `;
            }
          } else {
            interimTranscript += text;
          }
        }

        // Seamlessly combine initial text, all finalized chunks, and any interim phrase
        const combined = `${initialTextRef.current}${finalTranscript}${interimTranscript}`.trimStart();
        setInput(combined);

        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`;
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If the browser paused due to silence but the learner is still in dictation mode:
        // Restart smoothly with existing text preserved in initialTextRef
        if (isListeningRef.current) {
          try {
            initialTextRef.current = inputRef.current ? `${inputRef.current.trim()} ` : '';
            recognition.start();
            return;
          } catch {
            // If restart fails, stop cleanly
          }
        }
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      isListeningRef.current = true;
      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle pre-populating the chat input from Canvas selections (e.g. clicking an intention)
  useEffect(() => {
    if (prePopulatedInput && prePopulatedInput.trim().length > 0) {
      setInput(prePopulatedInput);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`;
      }
      if (onClearPrePopulatedInput) {
        onClearPrePopulatedInput();
      }
    }
  }, [prePopulatedInput]);

  const lastProcessedTriggerRef = useRef<string | null>(null);

  // Handle external triggers from the Canvas (e.g. clicking an intention or sample prompt)
  useEffect(() => {
    if (externalTriggerMessage && externalTriggerMessage.trim().length > 0) {
      if (lastProcessedTriggerRef.current === externalTriggerMessage) {
        return;
      }
      lastProcessedTriggerRef.current = externalTriggerMessage;
      handleSendMessage(externalTriggerMessage);
      if (onClearExternalTrigger) {
        onClearExternalTrigger();
      }
    } else {
      lastProcessedTriggerRef.current = null;
    }
  }, [externalTriggerMessage]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);

    setError(null);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };

    const guideMsgId = `guide-${Date.now()}`;
    const newMessages = [...messages, userMsg];
    // Optimistically show user message and empty guide message for live stream
    setMessages([...newMessages, { id: guideMsgId, role: 'guide', text: '' }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/course/m1/chat?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          state: courseState,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response not available.');
      }

      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const payload = JSON.parse(trimmed.slice(6));
              if (payload.text) {
                accumulated += payload.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === guideMsgId ? { ...msg, text: accumulated } : msg
                  )
                );
              }
            } catch {
              accumulated += trimmed.slice(6);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === guideMsgId ? { ...msg, text: accumulated } : msg
                )
              );
            }
          }
        }
      }

      // Check remaining buffer
      if (buffer.trim().startsWith('data: ') && buffer.trim() !== 'data: [DONE]') {
        try {
          const payload = JSON.parse(buffer.trim().slice(6));
          if (payload.text) {
            accumulated += payload.text;
          }
        } catch {
          accumulated += buffer.trim().slice(6);
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === guideMsgId ? { ...msg, text: accumulated } : msg
        )
      );

      // Extract machine-readable state from complete streamed text
      let statePayload = extractStateJson(accumulated);

      const isPastedProfile =
        courseState.currentSection === 4 &&
        (text.includes('#') ||
          text.includes('Focus:') ||
          text.includes('Role:') ||
          text.includes('Foundation') ||
          text.includes('Specialist') ||
          text.length > 200);

      const isModelConcluding =
        courseState.currentSection === 4 &&
        (accumulated.toLowerCase().includes('conclude module 1') ||
          accumulated.toLowerCase().includes('complete module 1') ||
          accumulated.toLowerCase().includes('locked your foundation') ||
          accumulated.toLowerCase().includes('proceed to module 2'));

      if (isPastedProfile || isModelConcluding) {
        if (!statePayload) statePayload = {};
        statePayload.currentSection = 4;
        statePayload.milestones = {
          ...(statePayload.milestones || {}),
          counterpartConfigured: true,
          module_1_complete: true,
          section_3_complete: true,
          projectGrounded: true,
          section_1_complete: true,
        };
        const completed = new Set(statePayload.completedSections || courseState.completedSections || [1, 2, 3]);
        completed.add(4);
        statePayload.completedSections = Array.from(completed);
      }

      if (statePayload) {
        onStateUpdate(statePayload);
      }
    } catch (err: any) {
      console.error('Error communicating with Module 1 Guide:', err);
      setError(err?.message || 'Failed to reach the Course Guide. Please try again.');
      // Remove empty placeholder if nothing was streamed
      setMessages((prev) => prev.filter((msg) => msg.id !== guideMsgId || msg.text.length > 0));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const quickPrompts = [
    { label: "I'm ready for the overview", text: "I'm ready. Walk me through the core shift and what we'll build in Module 1." },
    { label: "My project is...", text: "Here is the active project I'm working on right now: " },
    { label: "Help me pick an intention", text: "Help me diagnose which of the 6 core intentions fits my project's current phase." },
    { label: "I want to configure my counterpart", text: "I'm ready to configure my first counterpart in Section 4." },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50/50">
      {/* Conversation Stream Header */}
      <div className="px-5 py-3 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#004364] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Sparkles className="w-4 h-4 text-[#CBA62C]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#004364]">
              Module 1 Course Guide
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {courseState.userProject && (
            <span
              title={courseState.userProject}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate max-w-[200px]"
            >
              <Compass className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{courseState.userProject}</span>
            </span>
          )}
          {courseState.selectedIntention && (
            <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              {courseState.selectedIntention}
            </span>
          )}
        </div>
      </div>

      {/* Message Bubbles Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {(() => {
          const lastGuideMsgIndex = messages.map((m) => m.role).lastIndexOf('guide');
          const isModule1Completed = Boolean(
            courseState.milestones?.module_1_complete ||
            (courseState as any).module_1_complete ||
            courseState.completedSections.includes(4)
          );

          return messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            // Filter out <state_json> tags before rendering bubbles
            const cleanContent = cleanMessageText(msg.text);

            if (!cleanContent) return null;

            const isLastGuideMsg = !isUser && idx === lastGuideMsgIndex;

            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                    isUser
                      ? 'bg-[#004364] text-white rounded-br-xs'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#004364] mb-2 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#CBA62C]" />
                      <span>Course Guide</span>
                    </div>
                  )}

                  <div
                    className={`prose prose-stone max-w-none text-xs sm:text-sm ${
                      isUser
                        ? 'text-white prose-invert prose-p:leading-relaxed prose-headings:text-white'
                        : 'text-stone-800 prose-p:leading-relaxed prose-headings:text-[#004364]'
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {cleanContent}
                    </ReactMarkdown>
                  </div>

                  {/* Section 4 Completion Button directly inside closing Guide message bubble */}
                  {isLastGuideMsg && isModule1Completed && onCompleteModule1 && (
                    <div className="mt-4 pt-3.5 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={onCompleteModule1}
                        className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span>Complete Module 1: Proceed to Module 2 ──►</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-xs p-4 flex items-center gap-2.5 text-stone-500 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#004364]" />
              <span className="text-xs font-medium">The Guide is formulating next steps...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs font-bold text-red-700 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
        {/* Visual Choreography Pill Badge: Introduce Yourself */}
        {(courseState.currentSection === 1 && !courseState.milestones.welcomeCompleted) && (
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#004364] text-white shadow-xs">
              <span>Introduce Yourself</span>
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              Tell the Guide about yourself and the projects you create
            </span>
          </div>
        )}

        {/* Section 3 Input Guide Text */}
        {courseState.currentSection === 3 && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-stone-600 font-medium">
              Describe your project and personal stakes...
            </span>
          </div>
        )}

        {/* Listening Status Indicator */}
        {isListening && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Listening... Speak into your microphone. Click the mic button again when done.</span>
          </div>
        )}

        <div className="flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#004364]/20 focus-within:border-[#004364] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              courseState.currentSection === 1 && !courseState.milestones.welcomeCompleted
                ? "Tell the Guide a bit about yourself and what creative projects you focus on..."
                : courseState.currentSection === 3
                ? "Describe your project and personal stakes..."
                : "Type your response to the Guide (Enter to send, Shift+Enter for newline)..."
            }
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden resize-none max-h-36 min-h-[36px]"
          />

          {/* Voice-to-Text Microphone Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            disabled={isLoading}
            className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                : 'text-stone-500 hover:text-[#004364] hover:bg-stone-200/70'
            } ${!hasSpeechSupport ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={
              !hasSpeechSupport
                ? 'Speech recognition is not supported in this browser'
                : isListening
                ? 'Stop voice recording'
                : 'Dictate message with voice'
            }
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-[#004364] hover:bg-[#00314a] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
