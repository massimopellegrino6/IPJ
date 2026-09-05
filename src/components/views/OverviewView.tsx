import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  Building2, 
  ChevronRight,
  Compass,
  ArrowRight,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { RatingBadge } from '../badges/RatingBadge';
import { ConfidenceBadge } from '../badges/ConfidenceBadge';
import { AgencyFitBadge } from '../badges/AgencyFitBadge';

interface OverviewViewProps {
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
  onNavigateToDecisions: () => void;
  onNavigateToOpportunities: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  properties,
  onSelectProperty,
  onNavigateToDecisions,
  onNavigateToOpportunities
}) => {
  // Find properties in the database to bind directly to the cards
  const propRoma18 = properties.find(p => p.id === 'prop_rm_roma_18') || properties[0];
  const propFrancia42 = properties.find(p => p.id === 'prop_rm_francia_42') || properties[1];
  const propNomentana221 = properties.find(p => p.id === 'prop_rm_nomentana_221') || properties[2];
  const propAppia245 = properties.find(p => p.id === 'prop_rm_appia_245') || properties[3];

  // Specific Decision Priorities required by specification
  const decisionPriorities = [
    {
      property: propRoma18,
      id: 'p1',
      title: 'Via Roma 18 — Roma',
      location: 'Prati / Centro Storico',
      ratingPrev: 82,
      ratingNow: 69,
      change: -13,
      reason: 'Market demand declining + time-on-market above expected range',
      signalType: 'HIGH PRIORITY REVIEW',
      priority: 'HIGH',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      recommendedAction: 'Riposizionamento strategico del prezzo (-9.5%) per arrestare l\'invecchiamento',
      actionScore: 88,
      confidence: 89,
      confidenceLevel: 'HIGH' as const,
      compatibleBuyers: 9
    },
    {
      property: propFrancia42,
      id: 'p2',
      title: 'Corso Francia 42 — Roma',
      location: 'Collina Fleming / Vigna Clara',
      ratingPrev: 67,
      ratingNow: 81,
      change: +14,
      reason: 'Asking price reduced by 8.4%',
      signalType: 'NEW OPPORTUNITY',
      priority: 'HIGH',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      recommendedAction: 'Screening immediato del bacino acquirenti locali per formulazione offerta tempestiva',
      actionScore: 92,
      confidence: 93,
      confidenceLevel: 'HIGH' as const,
      compatibleBuyers: 19
    },
    {
      property: propNomentana221,
      id: 'p3',
      title: 'Via Nomentana 221 — Roma',
      location: 'Trieste / Porta Pia',
      ratingPrev: 79,
      ratingNow: 81,
      change: +2,
      reason: '23 acquirenti attivi profilati nel CRM con disponibilità immediata',
      signalType: 'HIGH ORGANIZATIONAL FIT',
      priority: 'HIGH',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
      recommendedAction: 'Avvio anteprime esclusive per i 23 acquirenti verificati ad alto intento',
      actionScore: 95,
      confidence: 90,
      confidenceLevel: 'HIGH' as const,
      compatibleBuyers: 23,
      agencyFit: 94
    },
    {
      property: propAppia245,
      id: 'p4',
      title: 'Via Appia Nuova 245 — Roma',
      location: 'Appio Latino / San Giovanni',
      ratingPrev: 80,
      ratingNow: 84,
      change: +4,
      reason: 'Prezzo richiesto -7.7% sotto Valore Congruo (€378k) con 18 acquirenti profilati',
      signalType: 'HIGH OPPORTUNITY ASSET',
      priority: 'HIGH',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      recommendedAction: 'Presentazione comparativi notarili per chiusura mandato in esclusiva',
      actionScore: 91,
      confidence: 91,
      confidenceLevel: 'HIGH' as const,
      compatibleBuyers: 18,
      agencyFit: 94
    }
  ];

  // Market signals required by specification
  const marketSignals = [
    {
      id: 'sig_1',
      title: 'Domanda Trilocali Roma Nord',
      text: 'Demand for three-room apartments between €250k–€350k increased 18% in Roma Nord.',
      territory: 'Roma Nord (Fleming, Vigna Clara, Cassia)',
      trend: '+18%',
      isPositive: true,
      impact: 'Pressione rialzista sulla velocità di liquidità degli asset residenziali.'
    },
    {
      id: 'sig_2',
      title: 'Inventario Milano Centro',
      text: 'Inventory increased 11% in Milano Centro.',
      territory: 'Milano Centro (Duomo, Brera, Quadrilatero)',
      trend: '+11%',
      isPositive: false,
      impact: 'Maggiore concorrenza tra annunci attivi; possibile allungamento dei tempi di vendita.'
    },
    {
      id: 'sig_3',
      title: 'Liquidità Media Bologna',
      text: 'Average liquidity decreased in Bologna over the last 30 days.',
      territory: 'Bologna (Murri, Saragozza, Centro)',
      trend: '-14 gg',
      isPositive: false,
      impact: 'Minore rotazione degli immobili con prezzo superiore al Valore Congruo.'
    }
  ];

  // Rating distribution: 0-39 Critical, 40-59 Weak, 60-74 Neutral, 75-89 Strong, 90-100 Exceptional
  const ratingDistribution = [
    { range: '0–39', label: 'Critical', count: 1, pct: 4, color: 'bg-rose-500' },
    { range: '40–59', label: 'Weak', count: 2, pct: 8, color: 'bg-amber-500' },
    { range: '60–74', label: 'Neutral', count: 5, pct: 19, color: 'bg-slate-500' },
    { range: '75–89', label: 'Strong', count: 15, pct: 58, color: 'bg-cyan-500' },
    { range: '90–100', label: 'Exceptional', count: 3, pct: 11, color: 'bg-emerald-500' }
  ];

  // Portfolio rating trend history
  const portfolioTrend = [
    { month: 'Mar', rating: 71.4 },
    { month: 'Apr', rating: 72.8 },
    { month: 'Mag', rating: 73.5 },
    { month: 'Giu', rating: 74.2 },
    { month: 'Lug', rating: 75.1 },
    { month: 'Ago', rating: 76.0 }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Real Estate Decision Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Executive Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Priorità decisionali ad alto impatto, telemetria di mercato e stato analitico del portafoglio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToOpportunities}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5"
          >
            <span>Screening Opportunità</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={onNavigateToDecisions}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>Centro Decisionale (6 In Attesa)</span>
          </button>
        </div>
      </div>

      {/* 1. FASCIA SINTETICA (6 KPI con variazioni rispetto al periodo precedente) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Active Properties */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Active Properties</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-1.5">124</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+6.2% vs Q2</span>
          </div>
        </div>

        {/* Average Real Estate Rating */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Avg Rating</span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1.5">76.0</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+1.8 pt (Trend Positivo)</span>
          </div>
        </div>

        {/* High Opportunity Assets */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>High Opportunity</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-1.5">28</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+4 nuovi asset</span>
          </div>
        </div>

        {/* Strategic Reviews Required */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Reviews Required</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1.5">7</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-cyan-300">
            <ArrowDownRight className="w-3 h-3" />
            <span>-2 vs mese scorso</span>
          </div>
        </div>

        {/* Pending Decisions */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors ring-1 ring-emerald-500/20">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Pending Decisions</span>
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-1.5">6</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-amber-400">
            <span>Azione richiesta oggi</span>
          </div>
        </div>

        {/* Average Confidence */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Avg Confidence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-300 mt-1.5">88%</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+3.1% integrità dati</span>
          </div>
        </div>
      </div>

      {/* 2. DECISION PRIORITIES (L'area visivamente più rilevante dell'Overview) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Decision Priorities
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Cambiamenti di rating, segnali di mercato e decisioni che richiedono un intervento umano tempestivo.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Principio: <strong className="text-white">AI recommends. Human decides.</strong>
          </span>
        </div>

        {/* Priority Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisionPriorities.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Card Header: Title + Signal Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${item.badgeColor}`}>
                      {item.signalType}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-medium">
                      {item.location}
                    </div>
                  </div>

                  {/* Rating Badge with Delta */}
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Real Estate Rating</div>
                    <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                      <span className="text-xl font-mono font-extrabold text-white">
                        {item.ratingNow}
                      </span>
                      <span className={`text-xs font-mono font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.change >= 0 ? `+${item.change}` : item.change}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      (Precedente: {item.ratingPrev})
                    </span>
                  </div>
                </div>

                {/* Reason Explanation */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Motivo Variazione:</div>
                  <div className="text-slate-200 mt-0.5 font-medium leading-relaxed">
                    {item.reason}
                  </div>
                </div>

                {/* Recommended Action & Action Score */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                    Azione Raccomandata:
                  </div>
                  <div className="text-slate-300 font-medium leading-relaxed">
                    {item.recommendedAction}
                  </div>
                </div>
              </div>

              {/* Card Footer: Action Score, Confidence & CTA */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Action Score</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">{item.actionScore}/100</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Confidenza</span>
                    <span className="font-mono font-bold text-cyan-300 text-xs">{item.confidence}% ({item.confidenceLevel})</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectProperty(item.property)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Analizza</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MARKET SIGNALS (Identificazione automatica dei cambiamenti territoriali) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Market Signals
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Rilevamento Continuo Flussi OMI & Agenzie
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketSignals.map((sig) => (
            <div
              key={sig.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  {sig.territory}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  sig.isPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {sig.trend}
                </span>
              </div>
              <p className="text-xs font-semibold text-white leading-relaxed">
                "{sig.text}"
              </p>
              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 leading-normal">
                <span className="text-slate-400 font-medium">Impatto:</span> {sig.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PORTFOLIO RATING DISTRIBUTION & PORTFOLIO RATING TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Portfolio Rating Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">26 Asset Campione</span>
          </div>

          <div className="space-y-3 pt-1">
            {ratingDistribution.map((item) => (
              <div key={item.range} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300 w-16">{item.range}</span>
                    <span className="text-slate-400">{item.label}</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {item.count} asset ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Asset in fascia Solida/Eccellente: 69%</span>
            <span>Asset critici sotto soglia: 4%</span>
          </div>
        </div>

        {/* Portfolio Rating Trend */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Portfolio Rating Trend
              </h3>
              <p className="text-xs text-slate-400">Andamento temporale del rating medio di portafoglio</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+4.6 pt (6 Mesi)</span>
            </div>
          </div>

          {/* Trend Bars Visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {portfolioTrend.map((pt) => {
              const heightPct = ((pt.rating - 65) / (80 - 65)) * 100;
              return (
                <div key={pt.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {pt.rating}
                  </span>
                  <div className="w-full bg-slate-900 rounded-t-lg h-32 flex items-end p-1">
                    <div
                      className="w-full bg-emerald-500/80 group-hover:bg-emerald-400 rounded transition-all"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{pt.month}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Effetto Repricing: +2.1 pt</span>
            <span>Effetto Dismissione Asset Deboli: +2.5 pt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
