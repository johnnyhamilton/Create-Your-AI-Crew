import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-2xs animate-fadeIn font-sans">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004364]/10 text-[#004364] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade Your Crew</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#004364] font-serif tracking-tight">
            Your crew is ready to grow
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
            You've built your foundation, which is the part that takes real thought. Every crew member from here stands on it, and each one takes about ten minutes. Your foundation gets richer with each member you add, and your whole crew gets better with it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Option 1 */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <a
                href="https://buy.stripe.com/5kQ4gB1CJgVUd0cfO933W00"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#004364] hover:bg-[#00314a] text-white visited:text-white hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
              >
                Build your whole crew — $159
              </a>
              <p className="text-xs text-stone-600 leading-relaxed">
                One month of full access. Build as many crew members as you want. Your profiles are yours to keep, forever.
              </p>
            </div>
          </div>

          {/* Option 2 */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <a
                href="https://buy.stripe.com/14A14pa9f5dc7FS45r33W01"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#649940] hover:bg-[#527d34] text-white visited:text-white hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
              >
                Keep your crew current — $199/year
              </a>
              <p className="text-xs text-stone-600 leading-relaxed">
                Everything above, plus your crew stays saved and evolves as your projects, roles, and the AI platforms themselves change.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer hover:underline"
          >
            Not now — back to my crew.
          </button>
        </div>
      </div>
    </div>
  );
};
