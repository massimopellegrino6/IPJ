import React from 'react';
import { Zap } from 'lucide-react';

interface ActionScoreBadgeProps {
  score: number;
  isRecommended?: boolean;
}

export const ActionScoreBadge: React.FC<ActionScoreBadgeProps> = ({
  score,
  isRecommended = false
}) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
      isRecommended 
        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
        : 'bg-slate-800/80 border-slate-700 text-slate-300'
    }`}>
      <Zap className={`w-3.5 h-3.5 ${isRecommended ? 'text-emerald-400' : 'text-slate-400'}`} />
      <span>Action Score:</span>
      <span className="text-sm font-extrabold">{score}</span>
      {isRecommended && (
        <span className="ml-1 text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans tracking-wider">
          Best Option
        </span>
      )}
    </span>
  );
};
