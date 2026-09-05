import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft,
  DollarSign, 
  Zap, 
  Sliders, 
  Layers, 
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Activity,
  History,
  Check,
  XCircle,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { PropertyItem, DimensionBreakdown, SubDimension, ActionScenario } from '../../types/intelligence';
import { RatingBadge } from '../badges/RatingBadge';
import { ConfidenceBadge } from '../badges/ConfidenceBadge';
import { AgencyFitBadge } from '../badges/AgencyFitBadge';
import { ActionScoreBadge } from '../badges/ActionScoreBadge';

interface PropertyIntelligenceViewProps {
  property: PropertyItem;
  allProperties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
  onOpenExplainability: (dimensionKey: string, subDimension?: SubDimension) => void;
  onOpenDecisionModal: (scenario: ActionScenario) => void;
  onBack: () => void;
}

export const PropertyIntelligenceView: React.FC<PropertyIntelligenceViewProps> = ({
  property,
  allProperties,
  onSelectProperty,
  onOpenExplainability,
  onOpenDecisionModal,
  onBack
}) => {
  const actionScenarios = property.actionScenarios ?? [];
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    actionScenarios.find(s => s.isRecommended)?.id || actionScenarios[0]?.id || ''
  );

  // Decline reason micro-modal state
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState<string>('Vincoli del proprietario');
  const [declineSuccessToast, setDeclineSuccessToast] = useState(false);

  const selectedScenario = actionScenarios.find(s => s.id === selectedScenarioId) || actionScenarios[0];

  const handleQuickAccept = () => {
    if (selectedScenario) onOpenDecisionModal(selectedScenario);
  };

  const handleQuickModify = () => {
    if (selectedScenario) onOpenDecisionModal(selectedScenario);
  };

  const handleConfirmDecline = () => {
    setIsDeclineModalOpen(false);
    setDeclineSuccessToast(true);
    setTimeout(() => setDeclineSuccessToast(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Torna al Database Immobili</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>ID Immobile: <strong className="text-slate-200">{property.code}</strong></span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">
            {property.status === 'Active' ? 'Attivo' : property.status === 'Review Required' ? 'Revisione Richiesta' : property.status}
          </span>
        </div>
      </div>

      {/* Decline Feedback Toast */}
      {declineSuccessToast && (
        <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-amber-400" />
          <span>Decisione demo registrata nel log temporaneo. Motivo: "{declineReason}".</span>
        </div>
      )}

      {/* Graceful Degradation Banner if applicable */}
      {property.isDegraded && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-300">
              Degradazione Controllata Attiva — Avviso Dati Limitati
            </h4>
            <p className="text-xs text-rose-200/90 mt-1">
              {property.degradationNote || 'Transazioni di mercato e volume di comparabili storici al di sotto della soglia di significatività statistica. Confidenza ridotta a tutela delle decisioni fiduciarie.'}
            </p>
          </div>
        </div>
      )}

      {/* 1. OVERVIEW IMMOBILE */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
              <span>{property.city}</span>
              <span>•</span>
              <span>{property.microZone}</span>
              <span>•</span>
              <span>{property.propertyType === 'Apartment' ? 'Appartamento' : property.propertyType === 'Penthouse' ? 'Attico' : property.propertyType}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {property.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{property.address}, {property.city} ({property.province}) — Microzona: {property.microZone}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:text-right">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Prezzo Richiesto</span>
              <div className="text-2xl font-mono font-extrabold text-white mt-0.5">
                €{property.askingPrice.toLocaleString()}
              </div>
              <span className="text-xs font-mono text-slate-400">
                €{property.pricePerSqm.toLocaleString()} / m²
              </span>
            </div>

            <div className="pl-4 border-l border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Valore Congruo Stimato</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-0.5">
                €{property.estimatedFairValue.toLocaleString()}
              </div>
              <span className={`text-xs font-mono font-bold ${property.priceDifferencePct < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {property.priceDifferencePct > 0 ? `+${property.priceDifferencePct}%` : `${property.priceDifferencePct}% vs Congruo`}
              </span>
            </div>
          </div>
        </div>

        {/* Structural Specs Bar */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Superficie</span>
            <span className="font-mono font-bold text-white text-sm mt-0.5 block">{property.squareMeters} m²</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Distribuzione</span>
            <span className="font-mono font-bold text-white text-sm mt-0.5 block">{property.rooms} Locali ({property.bathrooms} Bagni)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Piano</span>
            <span className="font-mono font-bold text-white text-sm mt-0.5 block">Piano {property.floor} / {property.totalFloors} {property.hasElevator ? '(Ascensore)' : '(No Asc.)'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Classe Energetica</span>
            <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">{property.energyClass}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Aggiornamento Dati</span>
            <span className="font-mono font-bold text-slate-200 text-sm mt-0.5 block">{property.dataFreshnessDays} giorni fa</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Livello Priorità</span>
            <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block uppercase">{property.priority}</span>
          </div>
        </div>
      </div>

      {/* 2. REAL ESTATE RATING (AREA CENTRALE & STRIP ECONOMICA SEPARATA) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
              Rating Centrale Deterministico
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Real Estate Rating & Confidenza Fiduciaria
            </h2>
            <p className="text-xs text-slate-400">
              Valutazione multicriterio indipendente della qualità intrinseca dell'immobile nel contesto di mercato.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Modello di Calibrazione: <strong className="text-white">v0.1</strong></span>
          </div>
        </div>

        {/* Hero Rating Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Main Rating */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 md:col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Real Estate Rating
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-mono font-extrabold text-white">
                {property.realEstateRating}
              </span>
              <span className="text-xl font-mono text-slate-400">/ 100</span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase">
                {property.ratingClassification}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400 pt-2 flex items-center gap-2">
              <span>Rating Trend:</span>
              <span className={`font-bold ${property.ratingTrend30d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {property.ratingTrend30d >= 0 ? `+${property.ratingTrend30d}` : property.ratingTrend30d} (ultimi 30 giorni)
              </span>
            </div>
          </div>

          {/* Rating Confidence */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 md:col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Rating Confidence & Evidenze
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-mono font-extrabold text-cyan-300">
                {property.ratingConfidence}%
              </span>
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold uppercase">
                {property.ratingConfidenceLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-2 font-mono">
              Scenario demo costruito su 10 fonti notarili e catastali simulate.
            </p>
          </div>
        </div>

        {/* Separate Economic & Liquidity Strip (Tutti i valori separati dal Rating!) */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-2">
            Metriche di Mercato, Congruità Economica & Liquidità (Valori Separati dal Rating)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">Estimated Fair Value</span>
              <span className="text-emerald-400 font-bold text-sm mt-0.5 block">€{property.estimatedFairValue.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">Asking Price</span>
              <span className="text-white font-bold text-sm mt-0.5 block">€{property.askingPrice.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">Scostamento (Difference)</span>
              <span className={`font-bold text-sm mt-0.5 block ${property.priceDifferencePct < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {property.priceDifferencePct > 0 ? `+${property.priceDifferencePct}%` : `${property.priceDifferencePct}%`}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">Sale Probability (90d)</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{property.estimatedSaleProbability90d}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">Estimated Time-to-Sale</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{property.estimatedTimeToSaleDays} giorni</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RATING BREAKDOWN (7 DIMENSIONI ISTITUZIONALI - Senza pesi arbitrari) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Rating Breakdown — 7 Dimensioni
            </h2>
            <p className="text-xs text-slate-400">
              Valutazione multicriterio qualitativa-quantitativa. Clicca su ciascuna dimensione per il pannello di spiegabilità con evidenze collegate.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Metodologia in validazione empirica (No pesi statici black-box)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.dimensions.map((dim) => {
            const benchmark = Math.round(
              dim.subDimensions.reduce((total, sub) => total + sub.benchmark, 0) /
              Math.max(1, dim.subDimensions.length)
            );

            return (
            <div
              key={dim.key}
              onClick={() => onOpenExplainability(dim.key, dim.subDimensions[0])}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {dim.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-mono font-bold text-white">
                      {dim.score}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/100</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>

                {/* Score Benchmark Bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dim.score >= 85 ? 'bg-emerald-400' :
                        dim.score >= 70 ? 'bg-cyan-400' :
                        dim.score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Benchmark Microzona: {benchmark}</span>
                    <span className={dim.score >= benchmark ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {dim.score >= benchmark ? `+${dim.score - benchmark} pt vs media` : `${dim.score - benchmark} pt vs media`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Dimensions Pills */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                {dim.subDimensions.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenExplainability(dim.key, sub);
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
                  >
                    <span>{sub.name}: </span>
                    <strong className="text-white">{sub.score}</strong>
                  </button>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* 4. EVIDENCE & COMPARABLES */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Evidence & Comparabili Simulati
            </h3>
            <p className="text-xs text-slate-400">
              Dataset dimostrativo di rogiti e annunci concorrenti nella microzona per simulare l’ancoraggio del Valore Congruo.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-300 font-semibold">Fonte simulata: Agenzia delle Entrate / OMI</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase text-emerald-400 font-bold font-mono">Atto Notarile Concluso</div>
            <div className="font-bold text-white">Via Macedonia 38 (Rogito Giugno 2026)</div>
            <div className="text-sm font-mono font-bold text-white mt-1">€385.000 (€4.180/m²)</div>
            <div className="text-[11px] text-slate-400">88 m² • Piano 2 • Ristrutturato • DOM 36gg</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase text-emerald-400 font-bold font-mono">Atto Notarile Concluso</div>
            <div className="font-bold text-white">Via Latina 112 (Rogito Maggio 2026)</div>
            <div className="text-sm font-mono font-bold text-white mt-1">€360.000 (€3.913/m²)</div>
            <div className="text-[11px] text-slate-400">92 m² • Piano 3 • Buono Stato • DOM 48gg</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase text-amber-400 font-bold font-mono">Annuncio Concorrente Attivo</div>
            <div className="font-bold text-white">Largo Colli Albani 8</div>
            <div className="text-sm font-mono font-bold text-white mt-1">€355.000 (€3.858/m²)</div>
            <div className="text-[11px] text-slate-400">90 m² • Piano 4 • Da Ristrutturare • DOM 84gg</div>
          </div>
        </div>
      </div>

      {/* 5. RATING HISTORY */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Rating History & Eventi Rilevati
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Cronologia Modello</span>
        </div>

        <div className="space-y-3">
          {property.ratingHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-semibold text-[11px] w-20">{item.date}</span>
                <div>
                  <span className="text-white font-medium">{item.event}</span>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Categoria: {item.eventCategory}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="text-white font-bold text-sm">Rating: {item.rating}</span>
                {item.impact !== 0 && (
                  <span className={`text-xs font-bold ${item.impact > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.impact > 0 ? `+${item.impact}` : item.impact} pt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AGENCY FIT (SEPARATO DAL RATING) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1">
              Sinergia Organizzativa & CRM
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Agency Fit: {property.agencyFit.score} / 100
            </h2>
            <p className="text-xs text-slate-400">
              Misura la sinergia specifica tra l'immobile e la base clienti / track record della TUA agenzia.
            </p>
          </div>
          <AgencyFitBadge score={property.agencyFit.score} size="md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Compatible Active Buyers</span>
            <div className="text-2xl font-mono font-bold text-white">{property.agencyFit.compatibleActiveBuyers} Acquirenti</div>
            <p className="text-[11px] text-cyan-300 font-mono">{property.agencyFit.highIntentBuyers} High Intent (Pronti al rogito)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Performance su casi simili</span>
            <div className="text-2xl font-mono font-bold text-emerald-400">{property.agencyFit.historicalPerformanceSimilarPct > 0 ? '+' : ''}{property.agencyFit.historicalPerformanceSimilarPct}%</div>
            <p className="text-[11px] text-slate-400 font-mono">Expertise Territoriale: {property.agencyFit.territoryExpertise}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Velocità di Liquidità Stimata</span>
            <div className="text-2xl font-mono font-bold text-cyan-300">{property.estimatedTimeToSaleDays} Giorni</div>
            <p className="text-[11px] text-slate-400 font-mono">Storico casi simili: {property.agencyFit.historicalTimeToSaleDays} gg</p>
          </div>
        </div>

        {/* Matching Buyer Clusters */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-white">Cluster di Acquirenti Compatibili Identificati:</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {property.agencyFit.matchingBuyerClusters?.map((cluster, i) => (
              <div key={i} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                <span className="font-semibold text-white">{cluster.profile}</span>
                <span className="font-mono text-cyan-300">({cluster.count} acquirenti)</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Budget medio: €{cluster.avgBudget.toLocaleString()}</span>
              </div>
            )) || (
              <div className="text-xs text-slate-400">University / Embassy Professionals (15) • High Net Worth Families (8)</div>
            )}
          </div>
        </div>
      </div>

      {/* 7. SCENARIO ANALYSIS (PRE-DECISION) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
              Ottimizzazione Predittiva
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Scenario Analysis (Pre-Decision)
            </h2>
            <p className="text-xs text-slate-400">
              Obiettivo di Ottimizzazione: Bilanciare probabilità di vendita, prezzo atteso e tempo di vendita.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Richiesta attuale: <strong className="text-white">€{property.askingPrice.toLocaleString()}</strong>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionScenarios.map((scen) => {
            const isSelected = scen.id === selectedScenarioId;
            const isValueLoss = scen.targetPrice < property.estimatedFairValue * 0.92;

            return (
              <div
                key={scen.id}
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">
                      {scen.label}
                    </span>
                    {scen.isRecommended && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                        CONSIGLIATO
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-extrabold text-white">
                      €{scen.targetPrice.toLocaleString()}
                    </span>
                    <span className={`text-xs font-mono font-bold ${scen.priceDeltaPct < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {scen.priceDeltaPct === 0 ? 'Invariato' : `${scen.priceDeltaPct}%`}
                    </span>
                  </div>

                  {isValueLoss && (
                    <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Warning: Potenziale perdita di valore economico rispetto alla congruità.</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {scen.rationale}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Probabilità Vendita 90gg:</span>
                    <span className="font-bold text-white">{scen.saleProbability90d}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tempo Stimato di Vendita:</span>
                    <span className="font-bold text-white">{scen.expectedTimeToSaleDays} giorni</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 font-sans font-semibold">Action Score:</span>
                    <ActionScoreBadge score={scen.actionScore} isRecommended={scen.isRecommended} />
                  </div>
                </div>
              </div>
            );
          })}
          {actionScenarios.length === 0 && (
            <div className="md:col-span-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 text-sm text-amber-200">
              Action Score non disponibile in questo scenario demo: servono dati operativi sufficienti per generare alternative attendibili.
            </div>
          )}
        </div>
      </div>

      {/* 8. HUMAN DECISION (AI recommends. Human decides.) */}
      {selectedScenario && (
      <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Human Decision Execution
            </h3>
            <p className="text-xs text-slate-400">
              Principio cardine del sistema: <strong className="text-emerald-400">AI recommends → Human decides → System learns.</strong>
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Scenario Selezionato: <strong className="text-white">{selectedScenario.label}</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-white">
              Azione Proposta: {selectedScenario.label} a €{selectedScenario.targetPrice.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Action Score: {selectedScenario.actionScore}/100 • Probabilità: {selectedScenario.saleProbability90d}% • Target: {selectedScenario.expectedTimeToSaleDays}gg
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAccept}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>ACCEPT (Accetta)</span>
            </button>

            <button
              onClick={handleQuickModify}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-cyan-300" />
              <span>MODIFY (Modifica)</span>
            </button>

            <button
              onClick={() => setIsDeclineModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>DECLINE (Rifiuta)</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Decline Feedback Micro-Modal */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Rifiuta Raccomandazione</h3>
              <button onClick={() => setIsDeclineModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Perché ritieni non opportuno applicare questa raccomandazione? Questa motivazione alimenta il modello di apprendimento closed-loop.
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Vincoli del proprietario',
                'Giudizio professionale agente',
                'Strategia alternativa pianificata',
                'Nuove informazioni non ancora a sistema',
                'Altro'
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    declineReason === reason ? 'bg-slate-900 border-emerald-500/60 text-white' : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={declineReason === reason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="accent-emerald-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsDeclineModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmDecline}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
              >
                Registra Rifiuto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
