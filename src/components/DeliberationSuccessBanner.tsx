import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

export interface DeliberationSuccessBannerProps {
  propertyCode?: string;
  propertyTitle?: string;
  scenarioText?: string;
  pendingCount?: number;
  onViewMonitoring: () => void;
}

export const DeliberationSuccessBanner: React.FC<DeliberationSuccessBannerProps> = ({
  propertyCode = 'RM-NOM-221',
  propertyTitle = 'Via Nomentana 221 (RM-NOM-221)',
  scenarioText = 'DELIBERATED · Scenario A (€484.000, +5.2%)',
  pendingCount = 5,
  onViewMonitoring
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-lg shadow-emerald-950/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="font-bold text-white flex items-center gap-2">
            <span>Delibera Eseguita: {propertyTitle}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold border border-emerald-500/40">
              {scenarioText}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            L'immobile è stato rimosso dall'elenco "Pending Decisions" (badge laterale aggiornato a {pendingCount}) e trasferito nella scheda <strong>"In Monitoraggio (T+14 Proxy)"</strong> all'interno di Analytics & Outcomes.
          </p>
        </div>
      </div>
      <button
        onClick={onViewMonitoring}
        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm shadow-emerald-500/20 hover:scale-[1.02]"
      >
        <span>Vedi in Monitoraggio (T+14 Proxy)</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
