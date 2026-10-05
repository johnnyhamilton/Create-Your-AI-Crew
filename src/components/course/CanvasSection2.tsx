import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, ChevronRight, Video, Maximize2, X } from 'lucide-react';

interface CanvasSection2Props {
  isCompleted: boolean;
  onProceedToSection3: () => void;
  userProject?: string;
  activeTab?: 'screencast' | 'energy';
  onTabChange?: (tab: 'screencast' | 'energy') => void;
}

export const CanvasSection2: React.FC<CanvasSection2Props> = ({
  isCompleted,
  onProceedToSection3,
  userProject,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'screencast' | 'energy'>('screencast');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => Boolean(isCompleted));
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const currentTab = controlledTab !== undefined ? controlledTab : internalTab;

  const handleTabSelect = (tab: 'screencast' | 'energy') => {
    setIsUnlocked(true);
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // Detect when user clicks into an iframe (play video)
  useEffect(() => {
    const handleBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') {
        setIsUnlocked(true);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const callouts = [
    {
      id: 'A',
      title: 'Load the Crew Profile',
    },
    {
      id: 'B',
      title: 'Bring the Raw Idea',
    },
    {
      id: 'C',
      title: 'Work with One Crew Member to Riff & Clarify',
    },
    {
      id: 'D',
      title: 'Pivot to Another Crew Member to Make a Draft',
    },
    {
      id: 'E',
      title: 'Copy to Word to Refine and Finalize',
    },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden w-full max-w-5xl mx-auto">
      {/* Scrollable upper content area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#004364] tracking-tight">
            Section 2: Finding the Right Project
          </h2>
        </div>

        {userProject && (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Your Grounded Project:</span> {userProject}
            </div>
          </div>
        )}

        {/* Desktop Responsive Layout (Side-by-Side on Desktop, Stacked on Mobile) */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left Column: Video embed container constrained dynamically */}
          <div
            onClick={() => setIsUnlocked(true)}
            onMouseDown={() => setIsUnlocked(true)}
            className="flex-1 min-h-0 flex items-center justify-center p-2 w-full lg:w-auto lg:shrink-0 cursor-pointer"
          >
            <div className="relative group w-auto mx-auto">
              {/* Floating Expand Video Button in the upper-right corner */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUnlocked(true);
                  setIsLightboxOpen(true);
                }}
                className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900/85 hover:bg-stone-900 text-white text-xs font-semibold backdrop-blur-xs shadow-md border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Expand video to full lightbox view"
              >
                <Maximize2 className="w-3.5 h-3.5 text-stone-200" />
                <span>Expand Video</span>
              </button>

              {currentTab === 'screencast' ? (
                <iframe
                  src="https://www.youtube.com/embed/-kk27SaqqBA?cc_load_policy=0&cc_lang_pref=off&hl=en&rel=0"
                  title="Screencast Demo: Setting Your Project"
                  className="h-[52vh] md:h-[58vh] lg:h-[62vh] max-h-[640px] w-auto aspect-[9/16] object-contain rounded-2xl shadow-md border border-stone-200 bg-stone-900 mx-auto transition-all"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <iframe
                  src="https://www.youtube.com/embed/YaTMHjsDaIE?cc_load_policy=0&cc_lang_pref=off&hl=en&iv_load_policy=3&rel=0"
                  title="Trail Walk: Follow Your Energy"
                  className="h-[52vh] md:h-[58vh] lg:h-[62vh] max-h-[640px] w-auto aspect-[9/16] object-contain rounded-2xl shadow-md border border-stone-200 bg-stone-900 mx-auto transition-all"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>

          {/* Right Column: Tab switchers at the top, directly above workflow steps / companion card */}
          <div className="flex-1 space-y-4 w-full text-left">
            {/* Top Tab Switcher placed directly above workflow steps */}
            <div className="flex items-center gap-2 p-1 bg-stone-200/80 rounded-xl w-full sm:w-fit">
              <button
                type="button"
                onClick={() => handleTabSelect('screencast')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  currentTab === 'screencast'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Video className={`w-4 h-4 ${currentTab === 'screencast' ? 'text-white' : 'text-stone-500'}`} />
                <span>1. Screencast Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSelect('energy')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  currentTab === 'energy'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Video className={`w-4 h-4 ${currentTab === 'energy' ? 'text-white' : 'text-stone-500'}`} />
                <span>2. Follow Your Energy</span>
              </button>
            </div>

            {currentTab === 'screencast' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Screencast Workflow Steps
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    My intention here is to take a raw story idea, develop it, translate it into a formal script format, and polish it to completion. Notice how two distinct crew members make this possible: the first specialist expands the raw spark, while the second specialist shapes it into a predetermined, disciplined structure.
                  </p>
                </div>

                <div className="space-y-2">
                  {callouts.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200 shadow-xs rounded-xl p-3 flex items-center gap-3"
                    >
                      <span className="bg-sky-100 text-sky-800 font-bold w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {c.id}
                      </span>
                      <span className="text-slate-800 font-medium text-xs">
                        {c.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-5 text-left">
                {/* Header */}
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">
                    Choosing Your Project
                  </h3>
                </div>

                {/* Part 1: Direction */}
                <div className="space-y-1">
                  <h4 className="text-sky-700 font-semibold text-sm uppercase tracking-wide">
                    Follow your energy
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Choose a project that actually matters to you.
                  </p>
                </div>

                {/* Part 2: Signals */}
                <div className="space-y-2">
                  <h4 className="text-sky-700 font-semibold text-sm uppercase tracking-wide">
                    Look for these signals
                  </h4>
                  <ul className="text-slate-800 text-sm space-y-1.5 pl-0.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                      <span>Ideas flood in</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                      <span>You light up</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                      <span>You get lost in the flow</span>
                    </li>
                  </ul>
                </div>

                {/* Elevate "Your energy is the signal" as primary takeaway banner */}
                <div className="pt-1">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-sm text-center py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs">
                    <span>⚡ Your energy is the signal.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-xs py-3 px-4 border-t border-slate-200 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Next: Ground Your Heading
          </p>
          <p className="text-xs text-stone-600 mt-0.5">
            Step into Conversation Mode to define your project and choose your Core Intention.
          </p>
        </div>

        <button
          onClick={onProceedToSection3}
          disabled={!isUnlocked}
          className={`w-full sm:w-auto px-6 py-3 font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 transition-all shrink-0 ${
            isUnlocked
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm pointer-events-auto cursor-pointer group'
              : 'bg-slate-100 text-slate-400 border border-slate-200 pointer-events-none'
          }`}
        >
          <span>Ready to Choose Your Project: Continue to Conversation</span>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isUnlocked ? 'text-white/90 group-hover:translate-x-1' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Fullscreen / Lightbox Modal for Video */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Expanded video player"
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header Bar at top */}
          <div
            className="w-full max-w-4xl flex items-center justify-between pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-sm sm:text-base">
                {currentTab === 'screencast'
                  ? '1. Screencast Demo: Setting Your Project'
                  : '2. Trail Walk: Follow Your Energy'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Close video lightbox"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>

          {/* Video Container inside Lightbox */}
          <div
            className="relative w-auto max-w-full h-[80vh] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            {currentTab === 'screencast' ? (
              <iframe
                src="https://www.youtube.com/embed/-kk27SaqqBA?autoplay=1&cc_load_policy=0&cc_lang_pref=off&hl=en&rel=0"
                title="Screencast Demo: Setting Your Project"
                className="w-full h-full object-contain"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src="https://www.youtube.com/embed/YaTMHjsDaIE?autoplay=1&cc_load_policy=0&cc_lang_pref=off&hl=en&iv_load_policy=3&rel=0"
                title="Trail Walk: Follow Your Energy"
                className="w-full h-full object-contain"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
