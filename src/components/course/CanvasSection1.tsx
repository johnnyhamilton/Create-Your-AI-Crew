import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { CompanionGuideReader, GuideType } from './CompanionGuideReader';

interface CanvasSection1Props {
  isCompleted: boolean;
  phase: 'watching' | 'conversation';
  onContinueToIntroduce: () => void;
  onRewatch?: () => void;
  onProceedToSection2: () => void;
  onReaderToggle?: (isOpen: boolean) => void;
}

export const CanvasSection1: React.FC<CanvasSection1Props> = ({
  isCompleted,
  phase,
  onContinueToIntroduce,
  onProceedToSection2,
  onReaderToggle,
}) => {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);

  const handleOpenGuide = (guide: GuideType) => {
    setActiveGuide(guide);
    onReaderToggle?.(true);
  };

  const handleCloseGuide = () => {
    setActiveGuide(null);
    onReaderToggle?.(false);
  };

  if (activeGuide) {
    return (
      <CompanionGuideReader
        guide={activeGuide}
        onClose={handleCloseGuide}
        backLabel="Back to Overview / Video"
      />
    );
  }

  // Phase 1: Dedicated Watching Mode (responsive two-column desktop, stacked mobile)
  if (phase === 'watching') {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#004364] tracking-tight">
            What Is an AI Crew?
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1.5 max-w-3xl leading-relaxed">
            Moving from default AI mirrors that flatter whatever you type, to configured counterparts tuned to hold the productive gap.
          </p>
        </div>

        {/* Responsive Two-Column Layout (Desktop Side-by-Side, Stacks Vertically on Mobile) */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
          {/* Left Column: 9:16 portrait Welcome Video (max-width 300px, framed so Johnny is not cropped) */}
          <div className="w-full lg:w-[300px] shrink-0 flex flex-col items-center mx-auto lg:mx-0">
            <div className="w-full max-w-[300px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-900 relative">
              <iframe
                src="https://www.youtube-nocookie.com/embed/WUIX4d4aMUg?rel=0&modestbranding=1&playsinline=1&cc_load_policy=0&hl=en&cc_lang_pref=off"
                title="Module 1 Orientation: What Is an AI Crew?"
                className="w-full h-full object-contain"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right Column: Companion resources & prominent continue button */}
          <div className="flex-1 space-y-6 w-full">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm sm:text-base font-bold text-[#004364] mb-2">
                The Shift from Tool to Counterpart
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Most people treat AI like an advanced search bar or an agreeable copy editor. An AI Crew is fundamentally different: a curated council of specialized creative partners built around the specific intentions of your work—divergent brainstorming, critical scrutiny, structural drafting, or pitch rehearsal.
              </p>
            </div>

            {/* Companion Resource Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#004364]" />
                <span>Companion Guides (Interactive Reader)</span>
              </h4>

              {/* Guide 1 */}
              <button
                onClick={() => handleOpenGuide('overview')}
                className="w-full p-4 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#004364] rounded-xl flex items-start justify-between gap-3 text-left transition-all shadow-xs group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-sky-50 text-[#004364] rounded-lg group-hover:bg-[#004364] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#004364] group-hover:underline">
                      Course Overview
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-snug">
                      The 5-Module Arc, Operating Principles for Captains, and what you walk away with.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-md shrink-0 mt-1 group-hover:bg-[#004364] group-hover:text-white transition-colors">
                  Open Reader 📖
                </span>
              </button>

              {/* Guide 2 */}
              <button
                onClick={() => handleOpenGuide('what_is_crew')}
                className="w-full p-4 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#004364] rounded-xl flex items-start justify-between gap-3 text-left transition-all shadow-xs group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-sky-50 text-[#004364] rounded-lg group-hover:bg-[#004364] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#004364] group-hover:underline">
                      What Is an AI Crew?
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-snug">
                      The Default Mirror vs. Configured Counterpart comparison table and the wardrobe metaphor.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-md shrink-0 mt-1 group-hover:bg-[#004364] group-hover:text-white transition-colors">
                  Open Reader 📖
                </span>
              </button>
            </div>

            {/* Prominent Action Button: Continue to Introduce Yourself */}
            <div className="pt-2">
              <button
                onClick={onContinueToIntroduce}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer group"
              >
                <span>Continue to Introduce Yourself</span>
                <ChevronRight className="w-5 h-5 text-white/90 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-xs text-stone-400 mt-2">
                Opens the Guide conversation where you step into the Captain&apos;s seat
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Conversation Mode (35% Canvas companion)
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-xl font-bold text-[#004364] tracking-tight">
          What Is an AI Crew?
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
          Moving from default AI mirrors that agree with everything you type, to configured counterparts tuned to hold the productive gap.
        </p>
      </div>

      {/* Resource Buttons */}
      <div className="space-y-2.5 pt-1 border-t border-stone-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Companion Guides (Interactive Reader)
        </h4>

        {/* Button 1 */}
        <button
          onClick={() => handleOpenGuide('overview')}
          className="w-full p-3 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#004364] rounded-xl flex items-start justify-between gap-3 text-left transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-50 text-[#004364] rounded-lg group-hover:bg-[#004364] group-hover:text-white transition-colors shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#004364] group-hover:underline">
                Course Overview
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                The 5-Module Arc, Operating Principles for Captains, and outcomes.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md shrink-0 mt-1 group-hover:bg-[#004364] group-hover:text-white transition-colors">
            Reader 📖
          </span>
        </button>

        {/* Button 2 */}
        <button
          onClick={() => handleOpenGuide('what_is_crew')}
          className="w-full p-3 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#004364] rounded-xl flex items-start justify-between gap-3 text-left transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-50 text-[#004364] rounded-lg group-hover:bg-[#004364] group-hover:text-white transition-colors shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#004364] group-hover:underline">
                What Is an AI Crew?
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                The Default Mirror vs. Configured Counterpart comparison table.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md shrink-0 mt-1 group-hover:bg-[#004364] group-hover:text-white transition-colors">
            Reader 📖
          </span>
        </button>
      </div>

      {/* Completion Status & Illuminated Action Bar */}
      {isCompleted ? (
        <div className="p-4 sm:p-5 bg-white text-stone-900 rounded-2xl shadow-xs border border-emerald-200 space-y-3 transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Section 1 Complete · Grounding Locked
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Take your time reading through the Guide’s response. When you are ready to explore and choose your project in Watching Mode:
          </p>
          <button
            onClick={onProceedToSection2}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <span>Continue to Section 2: Finding the Right Project</span>
            <ChevronRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div
          title="Chat with your Guide to lock your grounding..."
          className="p-3 bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-xl flex items-center justify-between transition-colors cursor-default select-none"
        >
          <div
            title="Chat with your Guide to lock your grounding..."
            className="flex items-center gap-2 min-w-0 w-full"
          >
            <CheckCircle2 className="w-4 h-4 text-stone-400 shrink-0" />
            <span
              title="Chat with your Guide to lock your grounding..."
              className="text-xs font-medium text-stone-600 whitespace-normal break-words leading-relaxed"
            >
              Chat with your Guide to lock your grounding...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
