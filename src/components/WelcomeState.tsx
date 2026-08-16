import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { PrivacyModal } from './PrivacyModal';

interface WelcomeStateProps {
  onStart: () => void;
  onSignIn: () => void;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({ onStart, onSignIn }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto text-center">
      {/* Privacy Tag with Gold Accent highlight */}
      <button
        type="button"
        onClick={() => setShowPrivacyModal(true)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-[#1B1B1B]/80 text-xs font-medium mb-8 border border-stone-200 transition-colors cursor-pointer"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#649940]" />
        <span>Ephemeral Browser Session • Private & Unstored</span>
        <Sparkles className="w-3 h-3 text-[#CBA62C] ml-0.5" />
      </button>

      {/* Main Title (Keeps display serif) */}
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#004364] leading-[1.15] mb-6">
        Create Your AI Crew
      </h1>

      {/* Subtitle / Description */}
      <p className="text-lg sm:text-xl text-[#1B1B1B]/80 leading-relaxed max-w-2xl mb-8 font-sans font-normal">
        You know what matters to you. Build the crew that helps you get there. An AI crew configured to fit you, your work, your voice, and how you think — ready to deploy on every AI platform you use.
      </p>

      {/* Ownership / Privacy Statement */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 max-w-xl text-left sm:text-center mb-10 text-sm text-[#1B1B1B]/80 leading-relaxed">
        <p className="font-medium text-[#004364] mb-1">
          Your privacy is built-in by design.{' '}
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="text-[#649940] hover:text-[#527d34] font-semibold underline inline-flex items-center gap-0.5 cursor-pointer ml-1"
          >
            <span>Explore more here.</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </p>
        You own everything here. This conversation isn't recorded or kept. Take your crew with you when you leave — nothing is stored.
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          onClick={onStart}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#004364] hover:bg-[#00314a] text-white font-medium text-base rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
        >
          <span>Build your crew</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Small time hint below button */}
        <p className="text-xs text-[#1B1B1B]/60 font-sans flex items-center gap-1.5 justify-center">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>Have a guided conversation to build your first crew member in about 30 minutes.</span>
        </p>

        {onSignIn && (
          <div className="pt-3 border-t border-stone-200/80 w-full text-center">
            <span className="text-xs text-stone-500 mr-2">Already have a saved crew?</span>
            <button
              onClick={onSignIn}
              className="text-xs font-semibold text-[#649940] hover:text-[#527d34] underline cursor-pointer"
            >
              Sign in to your dashboard
            </button>
          </div>
        )}
      </div>

      {/* Privacy Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};

