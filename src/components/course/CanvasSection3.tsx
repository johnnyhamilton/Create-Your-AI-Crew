import React, { useState } from 'react';
import { CORE_INTENTIONS } from '../../data/sampleCrewGallery';
import { Sparkles, ChevronDown, ChevronUp, Shield } from 'lucide-react';

interface CanvasSection3Props {
  isCompleted: boolean;
  onProceedToSection4: () => void;
}

export const CanvasSection3: React.FC<CanvasSection3Props> = ({
  isCompleted,
  onProceedToSection4,
}) => {
  const [selectedIntentionId, setSelectedIntentionId] = useState<string | null>(null);

  const selectedIntention = CORE_INTENTIONS.find(
    (item) => item.id === selectedIntentionId
  );

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          The 6 Core Intentions
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          Explore the six behavioral postures to balance your current creative phase. Click any intention to preview its protective posture and detail.
        </p>
      </div>

      {/* Interactive 2-column grid of the 6 intentions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CORE_INTENTIONS.map((item, idx) => {
          const isSelected = selectedIntentionId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setSelectedIntentionId((prev) => (prev === item.id ? null : item.id))
              }
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-900 font-bold text-sm">
                  {idx + 1}. {item.name}
                </span>
                {isSelected ? (
                  <ChevronUp className="w-4 h-4 text-sky-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <span className="text-slate-600 text-xs leading-relaxed block">
                {item.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Inline Detail View beneath the grid */}
      {selectedIntention && (
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 text-left ${selectedIntention.color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedIntention.badgeColor}`}>
                {selectedIntention.name} Posture
              </span>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {selectedIntention.subtitle}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIntentionId(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm text-slate-800">
            <div>
              <span className="font-bold text-slate-900">Description & When to use: </span>
              <p className="mt-0.5 leading-relaxed">{selectedIntention.whenToUse}</p>
            </div>
            <div>
              <span className="font-bold text-slate-900">Protective Posture: </span>
              <p className="mt-0.5 leading-relaxed">{selectedIntention.posture}</p>
            </div>
            <div className="pt-2 border-t border-slate-200/80">
              <span className="font-bold text-slate-900">What it protects: </span>
              <span className="text-slate-700">{selectedIntention.protects}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Button: hidden until section_3_complete: true */}
      {isCompleted && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onProceedToSection4}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Section 4: Lock Your Profile ──►</span>
          </button>
        </div>
      )}
    </div>
  );
};
