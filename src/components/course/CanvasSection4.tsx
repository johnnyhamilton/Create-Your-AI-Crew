import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Check,
  Search,
  ClipboardPaste,
  Layers,
  ArrowRight,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { SAMPLE_CREW_GALLERY, CORE_INTENTIONS } from '../../data/sampleCrewGallery';
import { SampleCrewMember } from '../../types';

interface CanvasSection4Props {
  isCompleted: boolean;
  isModule1Done?: boolean;
  selectedPath: 'path_a' | 'path_b' | null;
  pastedProfile: string;
  activeSubItem?: string;
  onUpdatePastedProfile: (val: string) => void;
  onSelectPath: (path: 'path_a' | 'path_b') => void;
  onSendSampleToChat?: (member: SampleCrewMember) => void;
  onCompleteModule?: () => void;
  onReviewCrewProfile?: () => void;
  onBackToDashboard?: () => void;
  onBackToOverview?: () => void;
}

export const CanvasSection4: React.FC<CanvasSection4Props> = ({
  isCompleted,
  isModule1Done,
  selectedPath,
  pastedProfile,
  activeSubItem,
  onUpdatePastedProfile,
  onSelectPath,
  onSendSampleToChat,
  onCompleteModule,
  onReviewCrewProfile,
  onBackToDashboard,
  onBackToOverview,
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGallery = SAMPLE_CREW_GALLERY.filter((item) => {
    const matchesFilter =
      galleryFilter === 'all' ||
      item.intention.toLowerCase() === galleryFilter.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.intention.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-[#004364] tracking-tight">
          Lock Your Counterpart
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
          Choose how you wish to assemble your first counterpart.
        </p>
      </div>

      {/* "Why Foundation Matters" banner */}
      <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-xl space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Why Foundation Matters</span>
        </h4>
        <p className="text-xs text-sky-800/90 leading-relaxed">
          In Module 2, you&apos;ll put this specialist to work on your project. In Module 3, you&apos;ll add multi-crew handoffs. Alignment now prevents generic answers later.
        </p>
      </div>

      {/* Path A & Path B Cards */}
      <div className="space-y-3.5">
        {/* Path A Card: Paste an Aligned Profile */}
        <div
          onClick={() => onSelectPath('path_a')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedPath === 'path_a'
              ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 shadow-xs'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#004364]/10 text-[#004364] rounded-lg">
                <ClipboardPaste className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#004364]">
                Path A: Paste an Aligned Profile
              </h4>
            </div>
            {selectedPath === 'path_a' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> Profile Active
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            If your profile already has a specialist built for the project and intention you just chose, paste the markdown directly into the chat.
          </p>

          <div className="p-2.5 bg-stone-50 border border-dashed border-stone-300 rounded-lg flex items-center gap-2 text-stone-600 text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-[#004364] shrink-0" />
            <span className="font-medium">
              Paste your counterpart markdown directly into the chat &rarr;
            </span>
          </div>
        </div>

        {/* Path B Card: Create a New Crew Member */}
        <div
          onClick={() => onSelectPath('path_b')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedPath === 'path_b'
              ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 shadow-xs'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#004364]/10 text-[#004364] rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#004364]">
                Path B: Create a New Crew Member
              </h4>
            </div>
            {selectedPath === 'path_b' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                Builder Selected
              </span>
            )}
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Click &apos;My Crew&apos; in the top navigation bar to assemble a new counterpart. Your course progress is saved automatically. Return here anytime to paste your profile markdown into the chat.
          </p>
        </div>
      </div>

      {/* Expandable Drawer: 18 Sample Crew Members Gallery */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <button
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#CBA62C]" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-[#004364]">
                18 Sample Crew Gallery
              </span>
              <span className="text-[11px] text-stone-500 ml-2 font-medium">
                (Reference & Inspiration)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold">
            <span>{isGalleryOpen ? 'Collapse Gallery' : 'Explore Gallery'}</span>
            {isGalleryOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {isGalleryOpen && (
          <div className="p-4 border-t border-stone-200 space-y-4">
            {/* Filter Pills and Search */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crew members by name, role, or focus..."
                  className="w-full text-xs bg-transparent border-none focus:outline-hidden text-stone-800"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setGalleryFilter('all')}
                  className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                    galleryFilter === 'all'
                      ? 'bg-[#004364] text-white border-[#004364]'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  All (18)
                </button>
                {CORE_INTENTIONS.map((int) => (
                  <button
                    key={int.id}
                    onClick={() => setGalleryFilter(int.name)}
                    className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                      galleryFilter.toLowerCase() === int.name.toLowerCase()
                        ? 'bg-[#004364] text-white border-[#004364]'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {int.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Cards */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredGallery.map((member) => {
                return (
                  <div
                    key={member.id}
                    onClick={() => onSendSampleToChat && onSendSampleToChat(member)}
                    className="p-3 bg-stone-50/70 hover:bg-sky-50/50 border border-stone-200 hover:border-sky-300 rounded-xl space-y-2 text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#004364] group-hover:underline">
                          {member.name}
                        </span>
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full bg-stone-200 group-hover:bg-sky-100 text-stone-700 group-hover:text-sky-800 font-semibold transition-colors">
                          {member.intention}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-700 leading-relaxed">
                      {member.role}
                    </p>

                    <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200 flex flex-col gap-0.5">
                      <div>
                        <span className="font-semibold text-stone-700">Posture:</span>{' '}
                        {member.posture}
                      </div>
                      <div>
                        <span className="font-semibold text-stone-700">Protects:</span>{' '}
                        {member.protects}
                      </div>
                    </div>

                    {onSendSampleToChat && (
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendSampleToChat(member);
                          }}
                          className="text-[11px] text-[#004364] group-hover:text-[#002f47] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span className="underline">Discuss this counterpart with Guide</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lock Profile & Complete Module 1 Action */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 ${
                isCompleted ? 'text-emerald-600' : 'text-stone-400'
              }`}
            />
            <span className="text-xs font-semibold text-stone-800">
              {isModule1Done
                ? 'Module 1 Complete · Counterpart Foundation Locked'
                : isCompleted
                ? 'Counterpart Verified · Module 1 Ready to Conclude'
                : 'Configure or paste your profile to conclude Module 1'}
            </span>
          </div>
          {isCompleted && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Foundation Locked
            </span>
          )}
        </div>

        {/* If Module 1 has been concluded, show celebration card with action buttons */}
        {isModule1Done ? (
          <div className="pt-2 border-t border-emerald-200/80 space-y-3">
            <div className="bg-emerald-50/80 border border-emerald-200/90 p-3.5 rounded-xl space-y-2.5 text-left">
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <span>🎉 Module 1 Complete: Intention Locked!</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                You have moved beyond default AI mirrors and configured a specialized counterpart with clear operating boundaries.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-center gap-2 text-center">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-xs font-semibold text-amber-900">
                  Modules 2-5 will be available soon.
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onReviewCrewProfile || onCompleteModule}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span>View My Crew in Dashboard ──►</span>
              </button>
              <button
                type="button"
                onClick={onBackToOverview || onCompleteModule}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-stone-300 transition-all cursor-pointer shadow-2xs"
              >
                <span>Back to Course Overview</span>
              </button>
            </div>
          </div>
        ) : (
          /* Emerald Action Button when verified / ready to conclude */
          isCompleted && (
            <button
              type="button"
              onClick={onCompleteModule}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>Complete Module 1: Proceed to Module 2 ──►</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
