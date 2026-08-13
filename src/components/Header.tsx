import React from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';

interface HeaderProps {
  appState: 'welcome' | 'chat' | 'delivery';
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ appState, onReset }) => {
  return (
    <header className="w-full border-b border-stone-200 bg-white/95 backdrop-blur-xs sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-sans text-lg font-bold text-[#004364] tracking-tight">
            Create Your AI Crew
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#1B1B1B]/70 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#649940]" />
            <span>Ephemeral Session</span>
          </div>

          {appState !== 'welcome' && (
            <button
              onClick={onReset}
              className="text-xs text-[#1B1B1B]/70 hover:text-[#004364] inline-flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-stone-100"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Fresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
