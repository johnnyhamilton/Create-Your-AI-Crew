import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Compass,
  FileCode,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import {
  FoundationRecord,
  SpecialistRecord,
  PlatformTarget,
  PlatformOption,
  GenerationPayload
} from '../types';

interface DeliveryStateProps {
  foundationRecord: FoundationRecord;
  specialistRecord: SpecialistRecord;
  onReset: () => void;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    id: 'fyi_persona',
    label: 'FYI',
    description: 'Optimized for FYI custom persona rules & voice settings',
  },
  {
    id: 'gemini_gem',
    label: 'Gemini Gem',
    description: 'Formatted for Google Gemini Gems System Instructions',
  },
  {
    id: 'claude_project',
    label: 'Claude Project',
    description: 'Custom instructions for Anthropic Claude Projects & Artifacts',
  },
  {
    id: 'chatgpt_project',
    label: 'ChatGPT Project',
    description: 'Custom GPT instructions, memory & behavioral guidelines',
  },
  {
    id: 'copilot_agent',
    label: 'Copilot Agent',
    description: 'System rules and action guidance for Microsoft Copilot',
  },
  {
    id: 'generic_session',
    label: 'Portable (works anywhere)',
    description: 'Universal kick-off prompt suitable for any AI conversation',
  },
];

export const DeliveryState: React.FC<DeliveryStateProps> = ({
  foundationRecord,
  specialistRecord,
  onReset,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTarget | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'records'>('profile');
  const [isRecordsExpanded, setIsRecordsExpanded] = useState(false);

  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedRecords, setCopiedRecords] = useState(false);

  const handleGenerate = async (platform: PlatformTarget) => {
    setSelectedPlatform(platform);
    setIsGenerating(true);
    setError(null);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const payload: GenerationPayload = {
      generationDate: dateStr,
      artifactType: 'crew_profile',
      traitsAlreadyInstalled: false,
      platformTarget: platform,
      defaultMember: 'ask',
      traits: foundationRecord,
      crew: [specialistRecord],
    };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      if (!res.ok) {
        let errBody = '';
        try {
          const errJson = await res.json();
          if (typeof errJson.error === 'string') {
            errBody = errJson.error;
          } else if (errJson.error?.message && typeof errJson.error.message === 'string') {
            errBody = errJson.error.message;
          } else if (typeof errJson.message === 'string') {
            errBody = errJson.message;
          }
        } catch (_) {
          errBody = await res.text();
        }

        if (!errBody || errBody.trim().startsWith('{') || errBody.trim().startsWith('[')) {
          errBody = 'Give me just a moment — lots of thinking happening. Try again in a few seconds.';
        }

        throw new Error(errBody);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to generate crew profile');
      }

      setGeneratedProfile(data.profile || '');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to assemble crew profile. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const fullRecordsJson = JSON.stringify(
    {
      traits: foundationRecord,
      crew: [specialistRecord],
    },
    null,
    2
  );

  const handleCopy = (text: string, type: 'profile' | 'records') => {
    navigator.clipboard.writeText(text);
    if (type === 'profile') {
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 2000);
    } else {
      setCopiedRecords(true);
      setTimeout(() => setCopiedRecords(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Step 3a: Select platform target question
  if (!selectedPlatform || isGenerating) {
    return (
      <div className="min-h-[80vh] max-w-3xl mx-auto px-4 py-12 flex flex-col justify-center items-center font-sans">
        {!isGenerating ? (
          <div className="w-full space-y-8 text-center animate-fadeIn">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#004364] bg-[#004364]/10 px-3 py-1 rounded-full">
                Final Step
              </span>
              <h2 className="text-3xl sm:text-4xl text-[#004364] font-bold mt-4 mb-2">
                Where will your crew live first?
              </h2>
              <p className="text-sm text-[#1B1B1B]/80 max-w-lg mx-auto">
                Select your primary AI platform. We will format your crew instructions and deployment guidelines specifically for it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-left">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleGenerate(opt.id)}
                  className="p-4 rounded-xl bg-white border border-stone-200 hover:border-[#004364] hover:bg-stone-50 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <div>
                    <div className="font-bold text-[#1B1B1B] group-hover:text-[#004364] transition-colors mb-1 text-base">
                      {opt.label}
                    </div>
                    <div className="text-xs text-[#1B1B1B]/70 leading-relaxed">
                      {opt.description}
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-medium text-[#004364] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Select</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-[#881719]/10 border border-[#881719]/20 text-[#881719] text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          /* Loading State */
          <div className="py-20 text-center space-y-6 animate-pulse">
            <div className="inline-flex p-4 rounded-2xl bg-[#004364]/10 text-[#004364]">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-2xl text-[#004364] font-bold">
                Assembling your crew...
              </h3>
              <p className="text-sm text-[#1B1B1B]/70 mt-2">
                Formatting your Foundational Traits and Specialist Directives into a deployable profile.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 3b: View Generated Crew Profile & Ingredients
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs text-[#649940] font-bold tracking-wide uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#CBA62C]" />
            <span>Crew Ready for Deployment</span>
          </span>
          <h2 className="text-2xl sm:text-3xl text-[#004364] font-bold mt-1">
            {specialistRecord.role || 'Your Specialist AI Member'}
          </h2>
        </div>
        <button
          onClick={() => setSelectedPlatform(null)}
          className="inline-flex items-center gap-1.5 text-xs text-[#1B1B1B]/70 hover:text-[#004364] border border-stone-200 px-3 py-1.5 rounded-lg bg-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Platform ({PLATFORM_OPTIONS.find((p) => p.id === selectedPlatform)?.label})</span>
        </button>
      </div>

      {/* Tabs / Card Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-[#004364] text-[#004364]'
              : 'border-transparent text-[#1B1B1B]/60 hover:text-[#1B1B1B]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Your Crew Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'records'
              ? 'border-[#004364] text-[#004364]'
              : 'border-transparent text-[#1B1B1B]/60 hover:text-[#1B1B1B]'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Your Records</span>
        </button>
      </div>

      {/* Tab 1: Your Crew Profile */}
      {activeTab === 'profile' && generatedProfile && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs relative">
            {/* Card Action Buttons */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
              <span className="text-xs text-[#1B1B1B]/60 font-mono">
                crew-profile.md
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedProfile, 'profile')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs text-[#1B1B1B] font-medium transition-colors cursor-pointer"
                >
                  {copiedProfile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#649940]" />
                      <span className="text-[#649940]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      generatedProfile,
                      'crew-profile.md',
                      'text/markdown'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#004364] hover:bg-[#00314a] text-xs text-white font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            {/* Markdown Display */}
            <div className="prose prose-stone max-w-none text-[#1B1B1B] font-sans leading-relaxed text-base space-y-4 markdown-content">
              <ReactMarkdown>{generatedProfile}</ReactMarkdown>
            </div>
          </div>

          {/* Under profile guidance line */}
          <p className="text-sm text-center text-[#1B1B1B]/80 font-medium pt-2">
            Install this in your AI platform's instructions, or paste it into any conversation and say Begin.
          </p>
        </div>
      )}

      {/* Tab 2: Your Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Header & Ingredients label */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
              <div>
                <h3 className="text-lg text-[#004364] font-bold">Your Records</h3>
                <p className="text-xs text-[#1B1B1B]/70 mt-0.5">
                  the ingredients — keep these to rebuild or grow your crew later
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(fullRecordsJson, 'records')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs text-[#1B1B1B] font-medium transition-colors cursor-pointer"
                >
                  {copiedRecords ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#649940]" />
                      <span className="text-[#649940]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      fullRecordsJson,
                      'crew-records.json',
                      'application/json'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#649940] hover:bg-[#527d34] text-xs text-white font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            {/* Collapsible toggle */}
            <button
              onClick={() => setIsRecordsExpanded(!isRecordsExpanded)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1B1B1B] font-medium cursor-pointer hover:bg-stone-100 transition-colors"
            >
              <span>View Raw Foundation & Specialist JSON Records</span>
              {isRecordsExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#1B1B1B]/70" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#1B1B1B]/70" />
              )}
            </button>

            {/* Collapsed or Expanded JSON */}
            {isRecordsExpanded && (
              <pre className="mt-4 p-4 rounded-xl bg-[#1C1917] text-[#E7E5E4] text-xs font-mono overflow-x-auto leading-relaxed border border-[#332F2B]">
                <code>{fullRecordsJson}</code>
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Quiet final line */}
      <div className="pt-8 text-center space-y-3">
        <p className="text-xs text-[#1B1B1B]/60 italic font-sans">
          "Nothing was saved here. Your crew leaves with you."
        </p>

        <div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-[#657590] hover:text-[#004364] underline decoration-dotted underline-offset-4 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Configure another crew member</span>
          </button>
        </div>
      </div>
    </div>
  );
};
