import React from 'react';
import { ShieldCheck, X, EyeOff, Database, Lock, Cpu } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-2xs animate-fadeIn font-sans text-left">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-xl hover:bg-stone-100 cursor-pointer"
          aria-label="Close privacy modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-stone-200 pb-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#649940]/15 flex items-center justify-center text-[#649940] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-[#004364] text-left">
              Your privacy matters.
            </h3>
            <p className="text-xs text-stone-500 text-left">
              Built with security and privacy at its core.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {/* Ephemeral by default */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#004364] text-left">
              <EyeOff className="w-4 h-4 text-[#649940] shrink-0" />
              <span className="text-left">Ephemeral by default</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed text-left">
              Build a complete crew member without signing in. The conversation exists only in your browser session and is gone when you leave — nothing is recorded, nothing is kept. Copy or download your crew and it's yours.
            </p>
          </div>

          {/* Storage by choice */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#004364] text-left">
              <Database className="w-4 h-4 text-[#649940] shrink-0" />
              <span className="text-left">Storage by choice</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed text-left">
              Signing in shares your name and email so your crew can be tied to your account. Your foundation and crew member records are then stored in an access-controlled database, visible only to you, and never shared, sold, or used to train AI models. Export them anytime. Delete them anytime — deletion is immediate and permanent, with no recovery and no copy retained.
            </p>
          </div>

          {/* Restricted access */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#004364] text-left">
              <Lock className="w-4 h-4 text-[#649940] shrink-0" />
              <span className="text-left">Restricted access</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed text-left">
              Security rules limit record access to your account alone. As with any operated service, authorized administrators retain technical access for maintenance, security, and support. Records are never read as a matter of course.
            </p>
          </div>

          {/* AI processing */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#004364] text-left">
              <Cpu className="w-4 h-4 text-[#649940] shrink-0" />
              <span className="text-left">AI processing</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed text-left">
              Your conversation is processed by Google's Gemini API to generate your configuration and is not used to train Google's models.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#004364] hover:bg-[#00314a] text-white font-bold text-sm transition-colors cursor-pointer shadow-2xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
