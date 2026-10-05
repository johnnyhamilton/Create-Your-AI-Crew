import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Compass, Layers } from 'lucide-react';

export type GuideType = 'overview' | 'what_is_crew';

interface CompanionGuideReaderProps {
  guide: GuideType;
  onClose: () => void;
  backLabel?: string;
}

export const CompanionGuideReader: React.FC<CompanionGuideReaderProps> = ({
  guide,
  onClose,
  backLabel = 'Back to Overview / Video',
}) => {
  const [overviewTab, setOverviewTab] = useState<'walk_away' | 'principles' | 'arc'>('walk_away');
  const [crewTab, setCrewTab] = useState<'shift' | 'wardrobe' | 'anatomy'>('shift');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pb-1 border-b border-slate-200">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          <span>← {backLabel}</span>
        </button>
      </div>

      {/* Guide Header */}
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {guide === 'overview' ? 'Course Overview' : 'What Is an AI Crew?'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {guide === 'overview'
            ? 'The 5-Module Arc, Operating Principles for Captains, and what you walk away with.'
            : 'Moving from Default Mirrors to Configured Counterparts for the work that matters to you.'}
        </p>
      </div>

      {/* Guide Content Card with 3 Horizontal Tabs */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-left">
        {guide === 'overview' ? (
          <div>
            {/* Horizontal Tabs for Course Overview */}
            <div className="flex border-b border-slate-200 gap-1 sm:gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setOverviewTab('walk_away')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  overviewTab === 'walk_away'
                    ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🎯 What You Walk Away With
              </button>
              <button
                onClick={() => setOverviewTab('principles')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  overviewTab === 'principles'
                    ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🧭 Captain&apos;s Principles
              </button>
              <button
                onClick={() => setOverviewTab('arc')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  overviewTab === 'arc'
                    ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🗺️ 5-Module Arc
              </button>
            </div>

            {/* Tab 1: What You Walk Away With */}
            {overviewTab === 'walk_away' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  By the end of this onboarding course, you will have completed and permanently own five core deliverables:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      num: '1',
                      title: 'Two Tailored Crew Members',
                      desc: 'Custom-built counterparts configured around your real projects, creative strengths, and authentic voice.',
                    },
                    {
                      num: '2',
                      title: 'Single-Chat Multi-Crew Collaboration',
                      desc: 'The practical capability to switch between different specialists within the same conversation without losing context or momentum.',
                    },
                    {
                      num: '3',
                      title: 'True Multi-Platform Portability',
                      desc: 'A universal markdown setup you can bring directly into Claude, Gemini, ChatGPT, Microsoft Copilot, FYI, or any AI platform.',
                    },
                    {
                      num: '4',
                      title: 'The Continuity Brief Habit',
                      desc: 'A repeatable technique for packaging active project context and transferring it seamlessly between tools as work shifts.',
                    },
                    {
                      num: '5',
                      title: 'Permanent Profile Ownership',
                      desc: 'Your Foundation, Crew Configurations, and project artifacts remain 100% yours to keep, export, and evolve indefinitely.',
                    },
                  ].map((item) => (
                    <div
                      key={item.num}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-left"
                    >
                      <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {item.num}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Captain's Principles */}
            {overviewTab === 'principles' && (
              <div className="space-y-5">
                <div className="space-y-4">
                  {[
                    {
                      title: '1. You Are the Captain; Your Profiles Are the Crew',
                      desc: 'The AI never directs your life or work. The initial spark, direction, discernment, and final validation always belong to you. Each AI crew member supports your ideas in ways that work best for you.',
                    },
                    {
                      title: '2. Skin in the Game',
                      desc: 'Counterparts only come alive when working on projects with real personal stakes and energy. Sterile or hypothetical exercises produce flat, generic outputs.',
                    },
                    {
                      title: '3. The Pace Is Yours (Unhurried Pace)',
                      desc: 'This course is deliberately unhurried. You can complete it in one continuous 45–90 minute session or pause and return whenever you want. Your conversational state and canvas artifacts persist across visits.',
                    },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Energy is the signal callout */}
                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">
                      Energy is the signal.
                    </span>
                    <span className="text-xs text-emerald-800 leading-relaxed block mt-0.5">
                      Follow where ideas flood in, you light up, and you get lost in the flow. That is where your AI crew delivers true leverage.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: 5-Module Arc */}
            {overviewTab === 'arc' && (
              <div className="space-y-3">
                {[
                  {
                    num: 'Module 1',
                    title: 'Set Your Intention',
                    desc: 'Ground a meaningful active project for the work that matters to you. Clarify your heading and configure your first custom counterpart around one of six core intentions.',
                  },
                  {
                    num: 'Module 2',
                    title: 'Try Your First Crew Member',
                    desc: 'Step into your preferred AI platform, run 10 to 20 substantive turns on your real deliverable, and practice active steering techniques to sharpen the fit.',
                  },
                  {
                    num: 'Module 3',
                    title: 'Use Two Crew Members in One Chat',
                    desc: 'Map your personal workflow, build your second crew member to complement the first, and orchestrate handoffs between both inside a single conversation thread.',
                  },
                  {
                    num: 'Module 4',
                    title: 'Take Your Crew to Other AI Platforms',
                    desc: 'Package an active continuity brief of your in-flight work and carry your crew profile across Claude, Gemini, ChatGPT, Microsoft Copilot, or FYI.',
                  },
                  {
                    num: 'Module 5',
                    title: "See the Framework & What's Next",
                    desc: 'Reveal the 5-phase Manifesting Framework (Focus → Hold the Moment → Spark → Riff → Manifest) that guided your progress, backed by permanent ownership.',
                  },
                ].map((mod) => (
                  <div
                    key={mod.num}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#004364]/10 text-[#004364] text-[11px] font-bold">
                        {mod.num}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {mod.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-1">
                      {mod.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Horizontal Tabs for What Is an AI Crew? */}
            <div className="flex border-b border-slate-200 gap-1 sm:gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setCrewTab('shift')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  crewTab === 'shift'
                    ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                ⚖️ The Shift
              </button>
              <button
                onClick={() => setCrewTab('wardrobe')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  crewTab === 'wardrobe'
                    ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🧥 Wardrobe & Principles
              </button>
              <button
                onClick={() => setCrewTab('anatomy')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  crewTab === 'anatomy'
                    ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🧬 Anatomy of a Profile
              </button>
            </div>

            {/* Tab 1: The Shift (High-contrast comparison rows) */}
            {crewTab === 'shift' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Moving from default AI mirrors that agree with everything you type, to configured counterparts tuned to hold the productive gap:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#004364] text-white">
                      <tr>
                        <th className="p-3 font-bold w-1/4">Dimension</th>
                        <th className="p-3 font-bold w-3/8">Default AI Assistant</th>
                        <th className="p-3 font-bold w-3/8">Your AI Crew</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        {
                          dimension: 'Behavioral Posture',
                          defaultAi: 'Echoes your prompts and flatters your assumptions with agreeable, sycophantic praise.',
                          aiCrew: 'Understands your context while holding the productive gap needed to stretch your thinking with calibrated creative friction.',
                        },
                        {
                          dimension: 'Scope',
                          defaultAi: 'A single generic assistant expected to handle everything from wild brainstorming to final proofreading.',
                          aiCrew: 'An intentional ensemble of distinct specialists, each designed for a specific phase of your workflow.',
                        },
                        {
                          dimension: 'Portability',
                          defaultAi: 'Bound to a single vendor window; your context is trapped inside one proprietary silo.',
                          aiCrew: 'Completely portable; travels seamlessly across Gemini Gems, Claude Projects, Custom GPTs, Copilot Agents, or FYI.',
                        },
                        {
                          dimension: 'Creative Dynamic',
                          defaultAi: 'Extractive search box and task machine; answers passively without understanding your standards.',
                          aiCrew: 'Active, collaborative counterpart council tuned to your authentic voice, values, and decision-making style.',
                        },
                      ].map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="p-3 font-bold text-slate-900 align-top">
                            {row.dimension}
                          </td>
                          <td className="p-3 text-slate-600 leading-relaxed align-top">
                            {row.defaultAi}
                          </td>
                          <td className="p-3 text-[#004364] font-medium leading-relaxed align-top bg-sky-50/30">
                            {row.aiCrew}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Wardrobe & Principles */}
            {crewTab === 'wardrobe' && (
              <div className="space-y-5">
                {/* Mirror Trap */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-700" />
                    <span>The Mirror Trap</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A mirror leaves no room for you to explore and grow. If an AI tool agrees with every word you write, it provides no genuine support. It flatters instead of sharpening. A counterpart is intentionally calibrated to be different: aligned enough to honor your standards, yet distinct enough to challenge, untangle, or structure your thoughts.
                  </p>
                </div>

                {/* The Wardrobe Metaphor */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    The Tailored Wardrobe Metaphor: Clothes vs. Gear
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Think of default AI as a generic white t-shirt and blue jeans—one size fits nobody well. An AI Crew is a custom wardrobe tailored to your actual journey:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-1">
                    <li>
                      <span className="font-bold text-[#004364]">• Your Foundation:</span> The person wearing the clothes (your authentic voice, core values, cognitive style).
                    </li>
                    <li>
                      <span className="font-bold text-[#004364]">• Your Crew Members:</span> The tailored outfits packed for specific environments—one suited for messy brainstorming, another for high-stakes executive review.
                    </li>
                    <li>
                      <span className="font-bold text-[#004364]">• Your Crew Profile:</span> The wardrobe—keeping your configurations organized so you can change who is at the table whenever your workflow shifts.
                    </li>
                  </ul>
                </div>

                {/* Callout */}
                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">
                      Rich context + focused intention = best fit.
                    </span>
                    <span className="text-xs text-emerald-800 leading-relaxed block mt-0.5">
                      When your counterpart has deep foundation context and one clear behavioral posture, every response hits the mark with minimal steering.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Anatomy of a Profile */}
            {crewTab === 'anatomy' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every configured counterpart in your crew is built from a disciplined two-layer architecture:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Layer 1 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                        Layer 1
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Foundation (Who You Are)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your cognitive style, perspective, authentic voice, and core values. Built once, the Foundation serves as the common bedrock shared by all of your crew members, ensuring they understand how your mind works without needing to be re-taught on every turn.
                    </p>
                  </div>

                  {/* Layer 2 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                        Layer 2
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Specialist Focus (The Job to Be Done)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The specific behavioral posture assigned to that counterpart. A specialist does not try to be everything; it holds one dedicated intention (Discovering, Ideating, Clarifying, Amplifying, Strengthening, or Preparing) so its focus remains sharp.
                    </p>
                  </div>
                </div>

                {/* Nuanced Controls */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Nuanced Behavioral Dials
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="font-bold text-slate-900">Pace:</span> Quality-seeking & reflective vs. Fast & efficient
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="font-bold text-slate-900">Granularity:</span> Fine meticulous detail vs. High-level big picture
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="font-bold text-slate-900">Rhythm:</span> Structured frameworks vs. Organic exploration
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="font-bold text-slate-900">Length:</span> Concise nudges vs. Expansive drafts
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
