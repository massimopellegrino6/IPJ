import React from 'react';
import { ConfidenceLevel } from '../../types/intelligence';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
  level?: ConfidenceLevel;
  size?: 'sm' | 'md' | 'lg';
  showDetail?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  level,
  size = 'md',
  showDetail = false
}) => {
  const derivedLevel: ConfidenceLevel = level || (
    score >= 85 ? 'HIGH' :
    score >= 60 ? 'MEDIUM' :
    score >= 40 ? 'LOW' : 'LIMITED_EVIDENCE'
  );

  const config: Record<ConfidenceLevel, {
    label: string;
    badgeStyle: string;
    icon: React.ReactNode;
    textColor: string;
  }> = {
    HIGH: {
      label: 'HIGH',
      badgeStyle: 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40',
      icon: <ShieldCheck className="w-3 h-3 text-emerald-400" />,
      textColor: 'text-emerald-400'
    },
    MEDIUM: {
      label: 'MEDIUM',
      badgeStyle: 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30',
      icon: <ShieldCheck className="w-3 h-3 text-cyan-400" />,
      textColor: 'text-cyan-400'
    },
    LOW: {
      label: 'LOW',
      badgeStyle: 'bg-amber-950/30 text-amber-300 border-amber-500/40',
      icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
      textColor: 'text-amber-400'
    },
    LIMITED_EVIDENCE: {
      label: 'LIMITED EVIDENCE',
      badgeStyle: 'bg-rose-950/40 text-rose-300 border-rose-500/40 animate-pulse',
      icon: <ShieldAlert className="w-3 h-3 text-rose-400" />,
      textColor: 'text-rose-400'
    }
  };

  const current = config[derivedLevel];

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono ${current.badgeStyle}`}>
        {current.icon}
        <span>{score}%</span>
        <span className="font-sans font-medium text-[10px] tracking-wider">{current.label}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Model Confidence</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xl font-mono font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${current.badgeStyle}`}>
            {current.icon}
            {current.label}
          </span>
        </div>
        {showDetail && derivedLevel === 'LIMITED_EVIDENCE' && (
          <p className="text-[11px] text-rose-300 mt-1">
            Agency history is insufficient for a reliable personalized assessment.
          </p>
        )}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-mono font-medium ${current.badgeStyle}`}>
      {current.icon}
      <span>{score}%</span>
      <span className="font-sans font-semibold text-[10px] tracking-wider uppercase">{current.label}</span>
    </span>
  );
};
