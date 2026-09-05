import React from 'react';
import { RatingClassification } from '../../types/intelligence';

interface RatingBadgeProps {
  score: number;
  classification?: RatingClassification;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  score,
  classification,
  size = 'md',
  showLabel = true
}) => {
  // Classification logic if not explicitly provided
  const derivedClass: RatingClassification = classification || (
    score >= 90 ? 'EXCEPTIONAL' :
    score >= 75 ? 'STRONG' :
    score >= 60 ? 'NEUTRAL' :
    score >= 40 ? 'WEAK' : 'CRITICAL'
  );

  // Palette: Dark slate institutional fintech aesthetics with precise colored accents
  const tierConfig: Record<RatingClassification, {
    border: string;
    bg: string;
    text: string;
    pillBg: string;
    pillText: string;
    label: string;
  }> = {
    EXCEPTIONAL: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20 text-emerald-400',
      text: 'text-emerald-400',
      pillBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      pillText: 'text-emerald-300',
      label: 'EXCEPTIONAL'
    },
    STRONG: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20 text-cyan-300',
      text: 'text-cyan-300',
      pillBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      pillText: 'text-cyan-300',
      label: 'STRONG'
    },
    NEUTRAL: {
      border: 'border-slate-600/40',
      bg: 'bg-slate-800/40 text-slate-300',
      text: 'text-slate-200',
      pillBg: 'bg-slate-800 text-slate-400 border-slate-700',
      pillText: 'text-slate-400',
      label: 'NEUTRAL'
    },
    WEAK: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20 text-amber-300',
      text: 'text-amber-300',
      pillBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      pillText: 'text-amber-300',
      label: 'WEAK'
    },
    CRITICAL: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20 text-rose-400',
      text: 'text-rose-400',
      pillBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      pillText: 'text-rose-300',
      label: 'CRITICAL'
    }
  };

  const config = tierConfig[derivedClass];

  if (size === 'hero') {
    return (
      <div className="flex items-center gap-4">
        <div className={`flex items-baseline px-4 py-2 rounded-xl border ${config.border} bg-slate-900 shadow-sm`}>
          <span className="text-4xl font-bold tracking-tight text-white font-mono">{score}</span>
          <span className="text-sm font-medium text-slate-400 ml-1">/100</span>
        </div>
        {showLabel && (
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Real Estate Rating</span>
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 mt-0.5 rounded border ${config.pillBg} uppercase tracking-wider`}>
              {config.label}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`flex items-baseline px-3 py-1 rounded-lg border ${config.border} bg-slate-900`}>
          <span className="text-xl font-bold text-white font-mono">{score}</span>
          <span className="text-xs text-slate-400 ml-0.5">/100</span>
        </div>
        {showLabel && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${config.pillBg} tracking-wide`}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${config.border} ${config.bg} font-mono text-xs font-bold`}>
        <span>{score}</span>
        {showLabel && <span className="text-[10px] uppercase font-sans font-medium tracking-wide opacity-90">{config.label}</span>}
      </span>
    );
  }

  // Standard 'md'
  return (
    <div className="inline-flex items-center gap-2">
      <div className={`px-2.5 py-0.5 rounded border ${config.border} bg-slate-900 font-mono text-sm font-bold text-white`}>
        {score}
      </div>
      {showLabel && (
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${config.pillBg}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};
