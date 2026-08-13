import React, { useState } from 'react';
import { Sliders, Check } from 'lucide-react';

interface TuningValues {
  pace: number;
  granularity: number;
  rhythm: number;
  responseLength: number;
}

interface TuningDialsProps {
  initialValues?: Partial<TuningValues>;
  onConfirm: (values: TuningValues) => void;
  isSubmitted?: boolean;
}

interface DialConfig {
  key: keyof TuningValues;
  label: string;
  leftPole: string;
  rightPole: string;
}

const DIALS: DialConfig[] = [
  {
    key: 'pace',
    label: 'Pace',
    leftPole: 'Quality-seeking',
    rightPole: 'Fast & efficient',
  },
  {
    key: 'granularity',
    label: 'Granularity',
    leftPole: 'Fine detail',
    rightPole: 'Big picture',
  },
  {
    key: 'rhythm',
    label: 'Rhythm',
    leftPole: 'Structured',
    rightPole: 'Free-flowing',
  },
  {
    key: 'responseLength',
    label: 'Response Length',
    leftPole: 'Concise',
    rightPole: 'Expansive',
  },
];

export const TuningDials: React.FC<TuningDialsProps> = ({
  initialValues,
  onConfirm,
  isSubmitted = false,
}) => {
  const [values, setValues] = useState<TuningValues>({
    pace: initialValues?.pace ?? 3,
    granularity: initialValues?.granularity ?? 3,
    rhythm: initialValues?.rhythm ?? 3,
    responseLength: initialValues?.responseLength ?? 3,
  });

  const handleSelect = (key: keyof TuningValues, val: number) => {
    if (isSubmitted) return;
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleConfirm = () => {
    if (isSubmitted) return;
    onConfirm(values);
  };

  return (
    <div className="my-5 p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#004364]/10 flex items-center justify-center text-[#004364]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-base text-[#004364]">
              Interactive Crew Tuning
            </h4>
            <p className="text-xs text-[#1B1B1B]/70">
              Tap points (1–5) on each scale to adjust your specialist's behavior
            </p>
          </div>
        </div>
        {isSubmitted && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#649940] text-xs font-medium border border-[#649940]/30">
            <Check className="w-3.5 h-3.5" />
            Confirmed
          </span>
        )}
      </div>

      <div className="space-y-6">
        {DIALS.map((dial) => {
          const currentVal = values[dial.key];

          return (
            <div key={dial.key} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#1B1B1B] font-semibold">{dial.label}</span>
                <span className="text-[#004364] font-mono bg-[#004364]/10 px-2 py-0.5 rounded-md font-semibold">
                  Point {currentVal} of 5
                </span>
              </div>

              {/* Pole labels */}
              <div className="flex items-center justify-between text-xs text-[#1B1B1B]/70">
                <span>{dial.leftPole}</span>
                <span className="text-[10px] text-stone-400 font-mono">←→</span>
                <span>{dial.rightPole}</span>
              </div>

              {/* 5-Point Scale Control */}
              <div className="relative pt-1 pb-1">
                {/* Connecting track line */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-stone-200 -translate-y-1/2 rounded-full pointer-events-none" />

                <div className="relative flex items-center justify-between px-1">
                  {[1, 2, 3, 4, 5].map((point) => {
                    const isSelected = currentVal === point;
                    return (
                      <button
                        key={point}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelect(dial.key, point)}
                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-medium transition-all cursor-pointer disabled:cursor-default ${
                          isSelected
                            ? 'bg-[#004364] text-white ring-4 ring-[#004364]/20 scale-110 shadow-sm'
                            : 'bg-white border-2 border-stone-300 text-[#1B1B1B]/70 hover:border-[#004364] hover:text-[#004364]'
                        }`}
                        title={`${dial.label} level ${point}`}
                      >
                        {point}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="pt-2 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#649940] hover:bg-[#527d34] text-white font-medium text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm & Send Tuning ({`Pace ${values.pace}, Granularity ${values.granularity}, Rhythm ${values.rhythm}, Response Length ${values.responseLength}`})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export function parseTuningRecommendations(text: string): Partial<TuningValues> {
  const getVal = (regex: RegExp): number | undefined => {
    const match = text.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 5) return num;
    }
    return undefined;
  };

  const pace = getVal(/pace[:\s\-\(\=]+([1-5])/i);
  const granularity = getVal(/granularity[:\s\-\(\=]+([1-5])/i);
  const rhythm = getVal(/rhythm[:\s\-\(\=]+([1-5])/i);
  const responseLength = getVal(/(?:response\s*length|length)[:\s\-\(\=]+([1-5])/i);

  return { pace, granularity, rhythm, responseLength };
}

export function isTuningMessage(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  // Never match welcome messages or initial process overviews
  if (
    lower.includes('welcome') ||
    lower.includes('five areas build the foundation') ||
    lower.includes('about fifteen minutes') ||
    lower.includes('what should your crew call you')
  ) {
    if (!lower.includes('decision 4') && !lower.includes('decision four') && !lower.includes('quality-seeking')) {
      return false;
    }
  }

  const hasExplicitTuningHeader =
    lower.includes('decision 4') ||
    lower.includes('decision four') ||
    lower.includes('crew tuning') ||
    lower.includes('tuning dials') ||
    lower.includes('four dials') ||
    lower.includes('four settings');

  const dialKeywordsCount = [
    lower.includes('pace'),
    lower.includes('granularity'),
    lower.includes('rhythm'),
    lower.includes('response length') || lower.includes('concise') || lower.includes('expansive'),
    lower.includes('quality-seeking') || lower.includes('fast and efficient') || lower.includes('fast & efficient'),
    lower.includes('fine detail') || lower.includes('big picture'),
    lower.includes('structured') || lower.includes('free-flowing'),
  ].filter(Boolean).length;

  return (hasExplicitTuningHeader && dialKeywordsCount >= 2) || dialKeywordsCount >= 3;
}
