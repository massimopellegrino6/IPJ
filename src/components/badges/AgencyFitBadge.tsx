import React from 'react';
import { Target } from 'lucide-react';

interface AgencyFitBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const AgencyFitBadge: React.FC<AgencyFitBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  const getStyle = () => {
    if (score >= 90) return 'text-sky-300 border-sky-500/30 bg-sky-950/20';
    if (score >= 75) return 'text-indigo-300 border-indigo-500/30 bg-indigo-950/20';
    if (score >= 60) return 'text-slate-300 border-slate-700 bg-slate-800/40';
    return 'text-amber-300 border-amber-500/30 bg-amber-950/20';
  };

  if (size === 'lg') {
    return (
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
          <Target className="w-3 h-3 text-sky-400" />
          Agency Fit
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-2xl font-mono font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getStyle()}`}>
            {score >= 90 ? 'High Fit' : score >= 75 ? 'Strong Fit' : score >= 60 ? 'Moderate' : 'Low Fit'}
          </span>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-xs ${getStyle()}`}>
        <Target className="w-3 h-3 opacity-70" />
        <span className="font-bold">{score}</span>
        {showLabel && <span className="font-sans text-[10px] uppercase opacity-80">Fit</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-mono font-semibold ${getStyle()}`}>
      <Target className="w-3 h-3 text-sky-400" />
      <span>Fit {score}/100</span>
    </span>
  );
};
