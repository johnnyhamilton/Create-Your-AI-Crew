import React from 'react';
import { Bookmark, X, AlertTriangle } from 'lucide-react';

interface UnsavedCrewModalProps {
  isOpen: boolean;
  isSaving: boolean;
  saveError?: string | null;
  onSaveAndProceed: () => void;
  onCancel: () => void;
  onDiscardAndLeave?: () => void;
}

export const UnsavedCrewModal: React.FC<UnsavedCrewModalProps> = ({
  isOpen,
  isSaving,
  saveError,
  onSaveAndProceed,
  onCancel,
  onDiscardAndLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 relative">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#CBA62C]/15 flex items-center justify-center text-[#9E801D] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#004364]">
              Do you want to save this crew member?
            </h3>
            <p className="text-sm text-[#1B1B1B]/70 mt-1 leading-relaxed">
              You haven't saved this newly created crew member to your dashboard. If you navigate away now, this profile will be lost.
            </p>
          </div>
        </div>

        {saveError && (
          <div className="p-3 rounded-xl bg-[#881719]/10 border border-[#881719]/20 text-[#881719] text-xs">
            {saveError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {onDiscardAndLeave && (
              <button
                type="button"
                onClick={onDiscardAndLeave}
                disabled={isSaving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 text-[#881719] hover:bg-red-50 font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                No, don't save
              </button>
            )}

            <button
              type="button"
              onClick={onSaveAndProceed}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#649940] hover:bg-[#527d34] text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Yes, save crew</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
