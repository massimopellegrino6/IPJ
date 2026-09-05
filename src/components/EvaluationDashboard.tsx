import React from 'react';
import { EvaluationResult, PropertyData, MarketData } from '../types/proptech';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Scale, 
  Building,
  ArrowRight,
  Zap,
  MapPin,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface EvaluationDashboardProps {
  evaluation: EvaluationResult;
  property: PropertyData;
  market: MarketData | null;
  onOpenFeedbackModal: () => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  evaluation,
  property,
  market,
  onOpenFeedbackModal,
}) => {
  // Action badge styles matching Bento theme
  const actionStyles = {
    ACQUIRE_PRIORITY: {
      color: '#10b981',
      bgTag: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      label: 'ACQUIRE & FLASH-SALE',
    },
    ACQUIRE_STANDARD: {
      color: '#3b82f6',
      bgTag: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'STANDARD ACQUISITION',
    },
    RENEGOTIATE_PRICE: {
      color: '#f59e0b',
      bgTag: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'RENEGOTIATE ENTRY PRICE',
    },
    REJECT_UNFAVORABLE: {
      color: '#ef4444',
      bgTag: 'bg-rose-100 text-rose-800 border-rose-200',
      label: 'REJECT ASSET (HIGH RISK)',
    },
  }[evaluation.recommended_action];

  return (
    <div className="space-y-4 text-slate-900">
      {/* Primary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Bento Cell 1: Dynamic Asset Rating (4 cols on desktop) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Dynamic Asset Rating
            </div>

            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="text-6xl font-extrabold text-slate-900 leading-none font-mono tracking-tight">
                {evaluation.overall_rating}
              </div>
              <div 
                className="text-sm font-extrabold uppercase mt-2 tracking-wide"
                style={{ color: actionStyles.color }}
              >
                {actionStyles.label}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Market Fit: {evaluation.overall_rating >= 75 ? 'Optimized' : evaluation.overall_rating >= 55 ? 'Moderate' : 'Underperforming'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Confidence Score
              </span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                {evaluation.confidence_score}%
              </span>
            </div>

            {/* Confidence Bar Meter */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden my-2">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${evaluation.confidence_score}%`,
                  backgroundColor: evaluation.confidence_score >= 70 ? '#10b981' : evaluation.confidence_score >= 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>
                {evaluation.is_degraded 
                  ? `Degradato (${evaluation.degradation_penalties.length} segnali assenti)` 
                  : 'Basato su 16/16 indicatori verificati'}
              </span>
              {evaluation.is_degraded && (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Degradation
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bento Cell 2: Property Profile (Supabase: property_data) (8 cols on desktop) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Property Profile (Supabase: property_data)
              </span>
              <div className="flex gap-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {property.micro_zone}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Stato: {property.conservation_state}
                </span>
                {property.energy_class && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    APE: Cl. {property.energy_class}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {property.title}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {property.address}, {property.city} ({property.province}) • {property.square_meters} mq • {property.rooms} Locali • Piano {property.floor}/{property.total_floors} {property.has_elevator ? 'con ascensore' : 'senza ascensore'}
            </p>
          </div>

          {/* Quick Metrics Columns */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Asking Price (AVM)
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                € {property.asking_price.toLocaleString('it-IT')}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {evaluation.valuation.asking_price_sqm} €/mq
              </span>
            </div>

            <div className="border-x border-slate-100 px-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Suggested Target
              </div>
              <div className="text-lg font-bold text-emerald-600 font-mono">
                € {evaluation.valuation.suggested_target_price.toLocaleString('it-IT')}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                {evaluation.valuation.discount_recommended_pct > 0 
                  ? `Sconto: -${evaluation.valuation.discount_recommended_pct}%` 
                  : 'In linea con benchmark'}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Liquidity & DOM
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                {market?.median_days_on_market ? `${market.median_days_on_market} gg` : '120 gg (Est.)'}
              </div>
              <span className="text-[11px] text-slate-500">
                Score: {evaluation.sub_scores.liquidity_speed}/100
              </span>
            </div>
          </div>
        </div>

        {/* Bento Cell 3: Market Data & Graceful Degradation (6 cols on tablet/desktop) */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Market Data (Graceful Degradation)
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                Ref: {market?.reference_period || 'Macro-Stima'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Pressione della Domanda:</span>
                <span className="font-mono font-bold text-slate-900">
                  {market && market.demand_intensity_index !== null && market.demand_intensity_index !== undefined ? (
                    `${market.demand_intensity_index} / 100`
                  ) : (
                    <span className="text-amber-700 font-normal italic">[!] Dato Assente (Fallback 50)</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Prezzo Medio Microzona:</span>
                <span className="font-mono font-bold text-slate-900">
                  {market?.avg_price_sqm ? `€ ${market.avg_price_sqm} /mq` : '€ 3.000 /mq (Macro Benchmark)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Tasso di Assorbimento Mensile:</span>
                <span className="font-mono font-bold text-slate-900">
                  {market && market.monthly_absorption_rate !== null && market.monthly_absorption_rate !== undefined ? (
                    `${market.monthly_absorption_rate}%`
                  ) : (
                    <span className="text-amber-700 font-normal italic">[!] Dato Assente (-15 pts)</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 font-medium">Campione Comparabili Recenti:</span>
                <span className="font-mono font-bold text-slate-900">
                  {market && market.comparables_count !== null && market.comparables_count !== undefined ? (
                    `${market.comparables_count} compravendite`
                  ) : (
                    <span className="text-amber-700 font-normal italic">[!] 0 compravendite (-25 pts)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Degradation Callout Banner matching Bento Theme */}
          {evaluation.is_degraded ? (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Degradation Audit ({evaluation.degradation_penalties.length} penalità applicate)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Confidence ricalcolata a {evaluation.confidence_score}%. Attivate euristiche conservative con allargamento della forchetta di stima.
              </p>
            </div>
          ) : (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-medium text-emerald-800">
                Tutti i segnali primari sono regolarmente alimentati. Confidence massima (Full Data).
              </span>
            </div>
          )}
        </div>

        {/* Bento Cell 4: 4 Pillars of Dynamic Rating (6 cols on tablet/desktop) */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Algorithmic Pillar Breakdown
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Pesi Ponderati
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Qualità Fisica Intrinseca (35%)</span>
                  <span className="font-mono text-slate-900">{evaluation.sub_scores.intrinsic_quality} / 100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${evaluation.sub_scores.intrinsic_quality}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Dinamica e Pressione Mercato (25%)</span>
                  <span className="font-mono text-slate-900">{evaluation.sub_scores.market_momentum} / 100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${evaluation.sub_scores.market_momentum}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Competitività Prezzo vs Benchmark (25%)</span>
                  <span className="font-mono text-slate-900">{evaluation.sub_scores.price_competitiveness} / 100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${evaluation.sub_scores.price_competitiveness}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Velocità Smobilizzo e Liquidità (15%)</span>
                  <span className="font-mono text-slate-900">{evaluation.sub_scores.liquidity_speed} / 100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                    style={{ width: `${evaluation.sub_scores.liquidity_speed}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Formula: <code className="text-slate-700 font-mono text-[11px]">Σ(Pillar_i × Weight_i)</code></span>
            <span className="font-semibold text-slate-800">Deterministic Engine</span>
          </div>
        </div>

        {/* Bento Cell 5: Decision Support & Action Recommendation (12 cols) */}
        <div className="md:col-span-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6">
          {/* Left Column: Suggested Action & Valuation Corridor */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Decision Support: Suggested Action
              </div>
              <div className="text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <span>{evaluation.action_headline}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${actionStyles.bgTag}`}>
                  {evaluation.recommended_action}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {evaluation.executive_summary}
              </p>
            </div>

            {/* Range Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Min: € {evaluation.valuation.suggested_min_price.toLocaleString('it-IT')}</span>
                <span className="font-bold text-emerald-700">Target: € {evaluation.valuation.suggested_target_price.toLocaleString('it-IT')}</span>
                <span>Max: € {evaluation.valuation.suggested_max_price.toLocaleString('it-IT')}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full relative overflow-hidden">
                <div className="absolute inset-y-0 bg-emerald-200 rounded-full left-1/4 right-1/4" />
                <div className="absolute inset-y-0 w-2.5 bg-emerald-600 rounded-full left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-slate-200" />

          {/* Right Column: Buyer Personas Matching & Decision Log Trigger */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>A chi proporre (Target Buyer Profiles)</span>
                <span className="text-[10px] text-slate-500 font-mono">Affinità Profilo</span>
              </div>

              <div className="space-y-2">
                {evaluation.target_buyers.slice(0, 2).map((buyer) => (
                  <div key={buyer.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-slate-900">{buyer.name}</span>
                      <span className="font-mono font-extrabold text-emerald-700 text-[11px]">
                        {buyer.match_score}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {buyer.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Button triggering the Data Capture Loop */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Registra la decisione finale in <code className="text-slate-800 font-semibold font-mono">public.decision_log</code>
              </div>
              <button
                id="btn-trigger-agent-feedback"
                onClick={onOpenFeedbackModal}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Registra Decisione Agente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
