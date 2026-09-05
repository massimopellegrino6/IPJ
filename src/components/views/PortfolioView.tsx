import React, { useState } from 'react';
import { PropertyItem } from '../../types/intelligence';
import { RatingBadge } from '../badges/RatingBadge';
import { AgencyFitBadge } from '../badges/AgencyFitBadge';
import { 
  Sparkles, 
  Target, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2,
  PieChart,
  Activity,
  Layers,
  ShieldAlert,
  Clock,
  DollarSign,
  ChevronRight
} from 'lucide-react';

interface PortfolioViewProps {
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  properties,
  onSelectProperty
}) => {
  const [activeSegment, setActiveSegment] = useState<string>('ALL');

  // Segments required by Section 14
  const segments = [
    {
      id: 'HIGH_PERF',
      name: 'High Performance Assets',
      count: properties.filter(p => p.realEstateRating >= 80).length,
      totalValue: properties.filter(p => p.realEstateRating >= 80).reduce((acc, p) => acc + p.askingPrice, 0),
      recommendedAction: 'Massimizzazione del valore di realizzo con negoziazione ferma e matching prioritario con top acquirenti.',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'STABLE',
      name: 'Stable Assets',
      count: properties.filter(p => p.realEstateRating >= 70 && p.realEstateRating < 80).length,
      totalValue: properties.filter(p => p.realEstateRating >= 70 && p.realEstateRating < 80).reduce((acc, p) => acc + p.askingPrice, 0),
      recommendedAction: 'Mantenimento prezzo e spinta su canali di visibilità premium per chiusura entro il target di 45 giorni.',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'UNDERPERFORMING',
      name: 'Underperforming Assets',
      count: properties.filter(p => p.realEstateRating >= 60 && p.realEstateRating < 70).length,
      totalValue: properties.filter(p => p.realEstateRating >= 60 && p.realEstateRating < 70).reduce((acc, p) => acc + p.askingPrice, 0),
      recommendedAction: 'Riposizionamento prezzo (-5% a -9.5%) o intervento di valorizzazione per evitare accumulo di giorni sul mercato.',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'ILLIQUID',
      name: 'Illiquid Assets',
      count: properties.filter(p => p.realEstateRating < 60).length,
      totalValue: properties.filter(p => p.realEstateRating < 60).reduce((acc, p) => acc + p.askingPrice, 0),
      recommendedAction: 'Revisione strategica profonda del mandato, ristrutturazione o recesso per tutelare la reputazione e il tempo agenzia.',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }
  ];

  const filteredProperties = properties.filter(p => {
    if (activeSegment === 'HIGH_PERF') return p.realEstateRating >= 80;
    if (activeSegment === 'STABLE') return p.realEstateRating >= 70 && p.realEstateRating < 80;
    if (activeSegment === 'UNDERPERFORMING') return p.realEstateRating >= 60 && p.realEstateRating < 70;
    if (activeSegment === 'ILLIQUID') return p.realEstateRating < 60;
    return true;
  });

  const totalPortfolioValue = properties.reduce((acc, p) => acc + p.askingPrice, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Gestione Patrimoniale & Allocazione Strategica
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Portfolio Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            “Come sta performando il portafoglio? Dove sono i rischi? Quali asset richiedono azione?”
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Valore Totale Portafoglio: <strong className="text-white">€{(totalPortfolioValue / 1000000).toFixed(1)}M</strong>
        </div>
      </div>

      {/* 1. HEALTH STRIP (Richiesta da Section 14) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Portfolio Health Score */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Health Score</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">78 / 100</div>
          <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">Stato Ottimale</span>
        </div>

        {/* Average Real Estate Rating */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Avg Rating</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">76.0</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Top Tier Roma/MI</span>
        </div>

        {/* Rating Distribution */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Distribuzione</span>
          <div className="text-2xl font-mono font-extrabold text-cyan-300 mt-1">69%</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">In fascia Strong/Exc</span>
        </div>

        {/* Assets Requiring Action */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 ring-1 ring-amber-500/30">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Action Required</span>
          <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">7 Asset</div>
          <span className="text-[11px] font-mono text-amber-300 block mt-0.5">Revisione urgente</span>
        </div>

        {/* Total Portfolio Value */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Total Value</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">€14.2M</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">26 Asset Attivi</span>
        </div>

        {/* Average Time-on-Market */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Avg Time-on-Mkt</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">56 gg</div>
          <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">-24gg vs benchmark</span>
        </div>
      </div>

      {/* 2. PORTFOLIO SEGMENTS (High Performance, Stable, Underperforming, Illiquid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Portfolio Segments & Strategia di Intervento
          </h2>
          <span className="text-xs font-mono text-slate-400">Clicca su un segmento per filtrare</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {segments.map((seg) => {
            const isSelected = activeSegment === seg.id;
            return (
              <div
                key={seg.id}
                onClick={() => setActiveSegment(isSelected ? 'ALL' : seg.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${seg.badgeColor}`}>
                      {seg.name}
                    </span>
                    <span className="font-mono text-lg font-extrabold text-white">
                      {seg.count}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    Valore Totale: <strong className="text-white">€{(seg.totalValue / 1000).toLocaleString()}k</strong>
                  </div>

                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                    <strong className="text-emerald-400 font-medium">Azione Raccomandata:</strong> {seg.recommendedAction}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{isSelected ? 'Filtro applicato' : 'Filtra asset'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SEGMENTED PROPERTY LIST */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Immobili nel Segmento: {activeSegment === 'ALL' ? 'Tutti gli Asset (26)' : activeSegment}
            </h3>
            <p className="text-xs text-slate-400">Dettaglio operativo per allocazione risorse commerciali.</p>
          </div>
          {activeSegment !== 'ALL' && (
            <button
              onClick={() => setActiveSegment('ALL')}
              className="text-xs font-mono text-emerald-400 hover:underline"
            >
              Mostra Tutti
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => onSelectProperty(prop)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {prop.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {prop.microZone} • €{prop.askingPrice.toLocaleString()}
                  </div>
                </div>
                <RatingBadge score={prop.realEstateRating} classification={prop.ratingClassification} size="sm" />
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Agency Fit: <strong className="text-cyan-300">{prop.agencyFit.score}%</strong></span>
                <span>DOM: {prop.estimatedTimeToSaleDays} gg</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
