import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Layers,
  ChevronRight,
  CheckCircle2,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  Lock,
} from 'lucide-react';

export type SubItemType = 'video' | 'chat' | 'doc';

export interface SubNavigationItem {
  id: string;
  num: string;
  label: string;
  type: SubItemType;
}

export interface SectionItem {
  num: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems: SubNavigationItem[];
}

export const COURSE_M1_SECTIONS: SectionItem[] = [
  {
    num: 1,
    title: 'Grounding & The Core Shift',
    subtitle: 'Default Mirror vs Counterpart',
    icon: Sparkles,
    subItems: [
      { id: '1.1', num: '1.1', label: 'Welcome', type: 'video' },
      { id: '1.2', num: '1.2', label: 'Introduce Yourself', type: 'chat' },
    ],
  },
  {
    num: 2,
    title: 'Finding the Right Project',
    subtitle: 'Skin in the Game',
    icon: Compass,
    subItems: [
      { id: '2.1', num: '2.1', label: 'Screencast Demo', type: 'video' },
      { id: '2.2', num: '2.2', label: 'Follow Your Energy', type: 'video' },
    ],
  },
  {
    num: 3,
    title: '💬 Setting Your Intention',
    subtitle: 'Specialist Alignment',
    icon: BookOpen,
    subItems: [],
  },
  {
    num: 4,
    title: '💬 Lock Your Profile',
    subtitle: 'Counterpart Foundation',
    icon: Layers,
    subItems: [],
  },
];

export interface FutureModule {
  num: number;
  title: string;
  subtitle: string;
  sections: {
    id: string;
    label: string;
    type: SubItemType;
  }[];
}

export const FUTURE_MODULES: FutureModule[] = [
  {
    num: 2,
    title: 'Try Your First Crew Member',
    subtitle: 'First Mission Briefing & Testing',
    sections: [
      { id: '2.1', label: 'Orientation: First Mission Briefing', type: 'video' },
      { id: '2.2', label: 'Assign Counterpart Role & Run Test Prompt', type: 'chat' },
      { id: '2.3', label: 'Field Guide: Assessing Counterpart Fit', type: 'doc' },
      { id: '2.4', label: 'Tuning Voice & Behavioral Range', type: 'chat' },
    ],
  },
  {
    num: 3,
    title: 'Build Your Crew Lineup',
    subtitle: 'Specialist Architecture & Complements',
    sections: [
      { id: '3.1', label: 'Orientation: Specialist Crew Topography', type: 'video' },
      { id: '3.2', label: 'Crew Architecture Blueprint', type: 'doc' },
      { id: '3.3', label: 'Pairing Opposing & Complementary Counterparts', type: 'chat' },
      { id: '3.4', label: 'Locking Your 3-Specialist Core Team', type: 'doc' },
    ],
  },
  {
    num: 4,
    title: 'Run Multi-Agent Missions',
    subtitle: 'Handoff Protocols & Joint Operations',
    sections: [
      { id: '4.1', label: 'Orientation: Cross-Specialist Synthesis', type: 'video' },
      { id: '4.2', label: 'Setting Shared Project Grounding', type: 'doc' },
      { id: '4.3', label: 'Executing Handoffs in Dual-Pane Canvas', type: 'chat' },
      { id: '4.4', label: 'Mission Debrief & Quality Thresholds', type: 'doc' },
    ],
  },
  {
    num: 5,
    title: 'Master Your AI Crew',
    subtitle: 'Operating Rhythm & Captain Capstone',
    sections: [
      { id: '5.1', label: 'Orientation: Sustainable Captain Workflow', type: 'video' },
      { id: '5.2', label: 'Crew Maintenance & Continuous Evolution', type: 'doc' },
      { id: '5.3', label: 'Capstone Project Evaluation with Guide', type: 'chat' },
      { id: '5.4', label: 'Course Certification & Deployment Blueprint', type: 'doc' },
    ],
  },
];

interface Module1SidebarProps {
  currentSection: number;
  completedSections: number[];
  activeSubItem: string;
  isCollapsed: boolean;
  width?: number;
  onToggleCollapse: () => void;
  onSelectSection: (sectionNum: number) => void;
  onSelectSubItem: (subItemId: string) => void;
  onExitCourse: () => void;
}

export const Module1Sidebar: React.FC<Module1SidebarProps> = ({
  currentSection,
  completedSections,
  activeSubItem,
  isCollapsed,
  width,
  onToggleCollapse,
  onSelectSection,
  onSelectSubItem,
  onExitCourse,
}) => {
  const totalSections = COURSE_M1_SECTIONS.length;
  // Ensure progress accurately reflects all completed sections (minimum 1,2,3 for section 4, or full array when complete)
  const effectiveCompleted = Array.from(
    new Set([
      ...completedSections,
      ...(currentSection === 4 ? [1, 2, 3] : []),
      ...(currentSection === 3 ? [1, 2] : []),
      ...(currentSection === 2 ? [1] : []),
    ])
  );
  const completedCount = effectiveCompleted.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalSections) * 100));

  const renderSubItemIcon = (type: SubItemType, isActive: boolean) => {
    const iconClass = `w-3 h-3 shrink-0 ${isActive ? 'text-sky-600' : 'text-stone-400'}`;
    switch (type) {
      case 'video':
        return <Video className={iconClass} />;
      case 'chat':
        return <MessageSquare className={iconClass} />;
      case 'doc':
      default:
        return <FileText className={iconClass} />;
    }
  };

  if (isCollapsed) {
    return (
      <aside className="w-16 border-r border-stone-200 bg-white flex flex-col items-center py-3 justify-between shrink-0 select-none">
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="p-2 text-stone-500 hover:text-sky-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div className="w-8 h-[1px] bg-stone-200" />

          {/* Module 1 Section Buttons */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">M1</span>
            {COURSE_M1_SECTIONS.map((sec) => {
              const isCurrent = currentSection === sec.num;
              const isDone = effectiveCompleted.includes(sec.num);
              return (
                <button
                  key={sec.num}
                  onClick={() => onSelectSection(sec.num)}
                  title={`Section ${sec.num}: ${sec.title}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'bg-sky-600 text-white shadow-xs font-bold'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900 font-medium'
                  }`}
                >
                  {isDone && !isCurrent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="text-xs">{sec.num}</span>
                  )}
                  {isCurrent && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-sky-400 rounded-l-sm" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-8 h-[1px] bg-stone-200 my-1" />

          {/* Future Modules Indicators */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            {FUTURE_MODULES.map((mod) => (
              <div
                key={mod.num}
                title={`Module ${mod.num}: ${mod.title} (Coming Soon)`}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 bg-stone-50 border border-stone-200/60 select-none pointer-events-none cursor-not-allowed"
              >
                <div className="flex items-center justify-center relative">
                  <span className="text-[11px] font-semibold text-stone-400">M{mod.num}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onExitCourse}
          title="Exit Course to Dashboard"
          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={width ? { width: `${width}px` } : undefined}
      className={`${width ? '' : 'w-72 sm:w-80'} border-r border-stone-200 bg-white flex flex-col justify-between shrink-0 select-none overflow-y-auto`}
    >
      <div>
        {/* Top Header */}
        <div className="p-3.5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60 inline-block mb-1">
              Course 1 · Onboarding
            </span>
            <h2 className="text-sm font-bold text-stone-900 leading-tight">
              Module 1: Set Your Intention
            </h2>
          </div>
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar (Location/Informational = Sky Blue) */}
        <div className="px-3.5 py-2.5 bg-stone-50/70 border-b border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-stone-600 text-[11px]">Module Progress</span>
            <span className="font-bold text-sky-700 text-xs">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            {completedCount} of {totalSections} sections completed
          </span>
        </div>

        {/* Navigation Sections with Subsections */}
        <div className="p-2.5 space-y-2">
          <div className="px-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Active Module Sections
          </div>

          <nav className="space-y-2">
            {COURSE_M1_SECTIONS.map((sec) => {
              const isCurrent = currentSection === sec.num;
              const isDone = effectiveCompleted.includes(sec.num);

              return (
                <div
                  key={sec.num}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    isCurrent
                      ? 'border-sky-200 bg-white shadow-xs ring-1 ring-sky-100'
                      : 'border-stone-200/70 bg-white'
                  }`}
                >
                  {/* Main Section Header */}
                  <button
                    onClick={() => onSelectSection(sec.num)}
                    className={`w-full p-2 text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-sky-600 text-white shadow-xs font-semibold'
                        : isDone
                        ? 'bg-emerald-50/60 text-stone-800 hover:bg-emerald-100/50'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isDone ? (
                        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                      ) : sec.num !== 3 && sec.num !== 4 ? (
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-[11px] font-bold ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {sec.num}
                        </div>
                      ) : null}
                      <div className="truncate">
                        <p
                          className={`text-xs font-bold truncate ${
                            isCurrent ? 'text-white' : 'text-stone-800'
                          }`}
                        >
                          {sec.num === 3
                            ? '3. 💬 Setting Your Intention'
                            : sec.num === 4
                            ? '4. 💬 Lock Your Profile'
                            : `Section ${sec.num}: ${sec.title}`}
                        </p>
                      </div>
                    </div>

                    {sec.subItems && sec.subItems.length > 0 && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isCurrent ? 'text-white/90 rotate-90' : 'text-stone-400'
                        }`}
                      />
                    )}
                  </button>

                  {/* Clickable Subsections (Streamlined, Iconic, Compact) */}
                  {sec.subItems && sec.subItems.length > 0 && (
                    <div className="px-1.5 py-1 space-y-0.5 bg-stone-50/40 border-t border-stone-100">
                      {sec.subItems.map((sub) => {
                        const isActiveSub = activeSubItem === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => onSelectSubItem(sub.id)}
                            className={`w-full py-1 px-2 rounded-md text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isActiveSub
                                ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200 shadow-2xs'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 font-normal'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`text-[11px] font-mono shrink-0 ${
                                  isActiveSub ? 'text-sky-700 font-bold' : 'text-stone-400'
                                }`}
                              >
                                {sub.num}
                              </span>
                              {renderSubItemIcon(sub.type, isActiveSub)}
                              <span className="truncate text-[11px]">{sub.label}</span>
                            </div>
                            {isActiveSub && (
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Upcoming Modules (Modules 2, 3, 4, 5) - Visible, non-interactive with subtle Coming Soon badges */}
          <div className="pt-2">
            <div className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Upcoming Modules
            </div>

            <div className="space-y-1.5">
              {FUTURE_MODULES.map((mod) => (
                <div
                  key={mod.num}
                  className="rounded-xl border border-stone-200/80 bg-white/70 p-2 flex items-center justify-between gap-2 select-none pointer-events-none"
                  aria-disabled="true"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded bg-stone-100 text-stone-400 flex items-center justify-center shrink-0 text-[10px] font-bold border border-stone-200">
                      {mod.num}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-stone-600 truncate">
                        Module {mod.num}: {mod.title}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {mod.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Exit Link */}
      <div className="p-3 border-t border-stone-100 bg-white">
        <button
          onClick={onExitCourse}
          className="w-full py-2 px-3 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Course to Main App</span>
        </button>
      </div>
    </aside>
  );
};
