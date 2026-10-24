import React, { useState, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldAlert, 
  Trophy, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Sparkles, 
  Coins, 
  Check, 
  FileCheck2, 
  ShieldCheck, 
  RotateCcw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { PropertyItem } from '../types/intelligence';
import { useDecisionStore } from '../context/DecisionStoreContext';
import { FinalMandateOutcome, OperativeEffortSnapshot } from '../types/decision';
import { calculateOperativeEffort, reconcileFinalOutcome } from '../backend/engine';

interface FinalOutcomeModalProps {
  property: PropertyItem;
  onClose: () => void;
}

export const FinalOutcomeModal: React.FC<FinalOutcomeModalProps> = ({
  property,
  onClose
}) => {
  const { 
    getLatestLogForProperty, 
    finalizeDecisionOutcome,
    fastForwardToFinalOutcome
  } = useDecisionStore();

  const currentLog = getLatestLogForProperty(property.id);
  const recommendedPrice = currentLog?.recommendationIssued.recommendedPrice || property.estimatedFairValue || 400000;
  const appliedPrice = currentLog?.observedHumanDecision.appliedPrice || property.askingPrice || 420000;

  // Selected Outcome
  const [outcomeType, setOutcomeType] = useState<FinalMandateOutcome>(
    currentLog?.finalOutcomeReconciliation?.outcomeType || 
    (currentLog?.outcomeTracking.finalOutcome?.closed ? 'CLOSED_SALE_WON' : 'CLOSED_SALE_WON')
  );

  // Sale Price (for CLOSED_SALE_WON)
  const [salePrice, setSalePrice] = useState<number>(
    currentLog?.finalOutcomeReconciliation?.salePriceActual || 
    currentLog?.outcomeTracking.finalOutcome?.salePrice || 
    appliedPrice
  );

  // Total Days on Market
  const [totalDom, setTotalDom] = useState<number>(
    currentLog?.finalOutcomeReconciliation?.totalDaysOnMarket || 
    currentLog?.outcomeTracking.finalOutcome?.daysOnMarketTotal || 
    Math.max(45, property.estimatedTimeToSaleDays || 60)
  );

  // Effort Metrics
  const [leadHours, setLeadHours] = useState<number>(
    currentLog?.finalOutcomeReconciliation?.effort.avgLeadResponseHours ?? 16
  );
  const [conductedVisits, setConductedVisits] = useState<number>(
    currentLog?.finalOutcomeReconciliation?.effort.conductedVisitsCount ?? 8
  );
  const [requestedVisits, setRequestedVisits] = useState<number>(
    currentLog?.finalOutcomeReconciliation?.effort.requestedVisitsCount ?? 9
  );
  const [marketingDelivered, setMarketingDelivered] = useState<number>(
    currentLog?.finalOutcomeReconciliation?.effort.marketingBudgetDeliveredEur ?? 450
  );
  const [marketingCommitted, setMarketingCommitted] = useState<number>(
    currentLog?.finalOutcomeReconciliation?.effort.marketingBudgetCommittedEur ?? 500
  );

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Real-time calculation of Effort & Attribution
  const liveEffortSnapshot: OperativeEffortSnapshot = useMemo(() => {
    return calculateOperativeEffort({
      avgLeadResponseHours: leadHours,
      conductedVisitsCount: conductedVisits,
      requestedVisitsCount: requestedVisits,
      marketingBudgetDeliveredEur: marketingDelivered,
      marketingBudgetCommittedEur: marketingCommitted
    });
  }, [leadHours, conductedVisits, requestedVisits, marketingDelivered, marketingCommitted]);

  const liveAttribution = useMemo(() => {
    return reconcileFinalOutcome({
      initialPriceRecommended: recommendedPrice,
      appliedPrice,
      finalOutcome: outcomeType,
      finalSalePrice: outcomeType === 'CLOSED_SALE_WON' ? salePrice : undefined,
      totalDom,
      effort: liveEffortSnapshot
    });
  }, [recommendedPrice, appliedPrice, outcomeType, salePrice, totalDom, liveEffortSnapshot]);

  // Realization rate
  const realizationRate = useMemo(() => {
    if (outcomeType !== 'CLOSED_SALE_WON' || !salePrice || recommendedPrice <= 0) return null;
    return (salePrice / recommendedPrice) * 100;
  }, [outcomeType, salePrice, recommendedPrice]);

  const deltaVsRecommendedEur = useMemo(() => {
    if (outcomeType !== 'CLOSED_SALE_WON' || !salePrice) return 0;
    return salePrice - recommendedPrice;
  }, [outcomeType, salePrice, recommendedPrice]);

  // Quick Preset Handlers
  const applyPreset = (preset: 'HIGH_EFFORT' | 'LOW_INERTIA' | 'STANDARD_MODERATE') => {
    if (preset === 'HIGH_EFFORT') {
      setLeadHours(12);
      setConductedVisits(10);
      setRequestedVisits(10);
      setMarketingDelivered(500);
      setMarketingCommitted(500);
    } else if (preset === 'LOW_INERTIA') {
      setLeadHours(72);
      setConductedVisits(1);
      setRequestedVisits(8);
      setMarketingDelivered(60);
      setMarketingCommitted(500);
    } else {
      setLeadHours(32);
      setConductedVisits(6);
      setRequestedVisits(8);
      setMarketingDelivered(350);
      setMarketingCommitted(500);
    }
  };

  const handleConfirmFinalOutcome = () => {
    setIsSubmitting(true);
    try {
      finalizeDecisionOutcome(property.id, {
        outcomeType,
        finalPrice: outcomeType === 'CLOSED_SALE_WON' ? salePrice : undefined,
        totalDom,
        effortMetrics: {
          avgLeadResponseHours: leadHours,
          conductedVisitsCount: conductedVisits,
          requestedVisitsCount: requestedVisits,
          marketingBudgetDeliveredEur: marketingDelivered,
          marketingBudgetCommittedEur: marketingCommitted
        }
      });
      setConfirmed(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error('Errore durante la finalizzazione esito:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cockpit Header Banner */}
        <div className="px-6 py-4 border-b border-slate-800 bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Decision Loop Step 3
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {property.code} • {property.microZone}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Final Outcome Tracking & Effort-Adjusted Attribution</span>
            </h2>
            <p className="text-xs text-slate-400">
              {property.title} — Segregazione causale tra World Model (regole oggettive) e Decision Model (operatività agenzia).
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Reference KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 border-b border-slate-800 text-xs">
          <div className="p-3 bg-slate-950">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Prezzo Iniziale Raccomandato:</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">
              €{recommendedPrice.toLocaleString('it-IT')}
            </span>
          </div>
          <div className="p-3 bg-slate-950">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Prezzo Applicato (Giorno 0):</span>
            <span className="text-white font-bold font-mono text-sm">
              €{appliedPrice.toLocaleString('it-IT')}
            </span>
          </div>
          <div className="p-3 bg-slate-950">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Scostamento Deliberato:</span>
            <span className={`font-bold font-mono text-sm ${appliedPrice > recommendedPrice ? 'text-amber-400' : 'text-slate-300'}`}>
              {appliedPrice >= recommendedPrice ? '+' : ''}€{(appliedPrice - recommendedPrice).toLocaleString('it-IT')}
            </span>
          </div>
          <div className="p-3 bg-slate-950">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Stato Ciclo Attuale:</span>
            <span className="text-cyan-400 font-bold font-mono text-xs flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentLog?.lifecycleStatus || 'IN_MONITORAGGIO'}</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* SEZIONE 1: SELEZIONE ESITO FINALE MANDATO */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center justify-between">
              <span>1. Esito Consuntivo Mandato (Giorno 60–90/180)</span>
              <span className="text-[10px] text-slate-500 lowercase">seleziona l'esito reale registrato</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* CLOSED_SALE_WON */}
              <button
                type="button"
                onClick={() => setOutcomeType('CLOSED_SALE_WON')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  outcomeType === 'CLOSED_SALE_WON'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {outcomeType === 'CLOSED_SALE_WON' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rogito Perfezionato</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Vendita conclusa con successo</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 mt-2">CLOSED_SALE_WON</span>
              </button>

              {/* MANDATE_EXPIRED_LOST */}
              <button
                type="button"
                onClick={() => setOutcomeType('MANDATE_EXPIRED_LOST')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  outcomeType === 'MANDATE_EXPIRED_LOST'
                    ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  {outcomeType === 'MANDATE_EXPIRED_LOST' && (
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Incarico Scaduto</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Termine decorso senza offerta</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-400 mt-2">MANDATE_EXPIRED_LOST</span>
              </button>

              {/* SELLER_REVOKED_LOST */}
              <button
                type="button"
                onClick={() => setOutcomeType('SELLER_REVOKED_LOST')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  outcomeType === 'SELLER_REVOKED_LOST'
                    ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  {outcomeType === 'SELLER_REVOKED_LOST' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mandato Revocato</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Recesso anticipato venditore</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-amber-400 mt-2">SELLER_REVOKED_LOST</span>
              </button>

              {/* PRICE_WITHDRAWN */}
              <button
                type="button"
                onClick={() => setOutcomeType('PRICE_WITHDRAWN')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  outcomeType === 'PRICE_WITHDRAWN'
                    ? 'bg-slate-800/80 border-slate-500 shadow-md shadow-slate-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-700 text-slate-300">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  {outcomeType === 'PRICE_WITHDRAWN' && (
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Ritiro dal Mercato</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sospensione / cambio piani</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-2">PRICE_WITHDRAWN</span>
              </button>
            </div>

            {/* In caso di ROGITO: Input Prezzo Effettivo e Giorni di Mercato Totali */}
            {outcomeType === 'CLOSED_SALE_WON' ? (
              <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1.5 font-semibold">
                    Prezzo Effettivo di Rogito (€):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">€</span>
                    <input
                      type="number"
                      value={salePrice}
                      step="5000"
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      Delta vs Stima AI: <strong className={deltaVsRecommendedEur >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {deltaVsRecommendedEur >= 0 ? '+' : ''}€{deltaVsRecommendedEur.toLocaleString('it-IT')}
                      </strong>
                    </span>
                    {realizationRate && (
                      <span className="font-mono text-cyan-400 font-bold">
                        Realization: {realizationRate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1.5 font-semibold">
                    Giorni Totali sul Mercato (DOM):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="15"
                      max="180"
                      value={totalDom}
                      onChange={(e) => setTotalDom(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <span className="w-16 px-2 py-1.5 rounded bg-slate-950 border border-slate-700 font-mono text-white text-xs text-center font-bold">
                      {totalDom} gg
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Velocità di assorbimento: {totalDom <= 45 ? 'Rapida (< 45gg)' : totalDom <= 90 ? 'Standard (45-90gg)' : 'Prolungata (> 90gg)'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Giorni di permanenza totale prima dell'interruzione / decadenza:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="30"
                    max="210"
                    value={totalDom}
                    onChange={(e) => setTotalDom(Number(e.target.value))}
                    className="w-36 accent-rose-500 cursor-pointer"
                  />
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-white text-xs font-bold">
                    {totalDom} gg
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SEZIONE 2: MISURAZIONE OPERATIVE EFFORT CRM */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Misurazione Diligenza Operativa CRM (Effort Score)</span>
              </label>

              {/* 1-Click Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Preset:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('HIGH_EFFORT')}
                  className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold cursor-pointer transition-all"
                >
                  Alto Sforzo (&ge; 0.70)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('LOW_INERTIA')}
                  className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-bold cursor-pointer transition-all"
                >
                  Inerzia Agenzia (&lt; 0.40)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('STANDARD_MODERATE')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer transition-all"
                >
                  Moderato (0.4-0.7)
                </button>
              </div>
            </div>

            {/* Tuner Sliders */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              {/* Metric 1: Riscontro Lead */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    1. Tempo Medio Riscontro Contatti Lead:
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    {leadHours} ore ({leadHours <= 24 ? 'Punteggio 1.0 • Peso 35%' : leadHours <= 48 ? 'Punteggio 0.6 • Peso 35%' : 'Punteggio 0.2 • Peso 35%'})
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="96"
                  step="2"
                  value={leadHours}
                  onChange={(e) => setLeadHours(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>&le; 24h (Reattivo 1.0)</span>
                  <span>24-48h (Accettabile 0.6)</span>
                  <span>&gt; 48h (Negligenza 0.2)</span>
                </div>
              </div>

              {/* Metric 2: Visite Svolte / Richieste */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    2. Visite Effettuate su Richieste Appuntamento:
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    {conductedVisits} / {requestedVisits} visite ({Math.min(100, Math.round((conductedVisits / Math.max(1, requestedVisits)) * 100))}% • Peso 40%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Visite Condotte:</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={conductedVisits}
                      onChange={(e) => setConductedVisits(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Richieste a CRM:</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={requestedVisits}
                      onChange={(e) => setRequestedVisits(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Metric 3: Budget Marketing */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    3. Budget Marketing Erogato / Pattuito:
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    €{marketingDelivered} / €{marketingCommitted} ({Math.min(100, Math.round((marketingDelivered / Math.max(1, marketingCommitted)) * 100))}% • Peso 25%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Budget Erogato (€):</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={marketingDelivered}
                      onChange={(e) => setMarketingDelivered(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Budget Pattuito (€):</label>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={marketingCommitted}
                      onChange={(e) => setMarketingCommitted(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Resulting Combined Effort Index */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Indice Sintetico Operative Effort:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-mono font-bold text-white">
                      {liveEffortSnapshot.calculatedEffortScore.toFixed(2)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      liveEffortSnapshot.effortClassification === 'HIGH_EFFORT'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : liveEffortSnapshot.effortClassification === 'LOW_INERTIA'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {liveEffortSnapshot.effortClassification}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <span>Formula Ponderata Product Thesis:</span>
                  <div className="text-[10px] font-mono text-slate-500">
                    35% Lead + 40% Visite + 25% Spesa Portali
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 3: CARD DI SEGREGAZIONE & ATTRIBUZIONE CAUSALITA' */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Responso Motore di Attribuzione e Segregazione World Model</span>
            </label>

            <div className={`p-4 rounded-xl border transition-all ${
              liveAttribution.biasCategory === 'ORGANIZATIONAL_INERTIA_BIAS'
                ? 'bg-rose-950/30 border-rose-500/70'
                : liveAttribution.biasCategory === 'WORLD_MODEL_RECALIBRATION'
                ? 'bg-amber-950/30 border-amber-500/70'
                : liveAttribution.biasCategory === 'HUMAN_EXPERTISE_SURPLUS'
                ? 'bg-cyan-950/30 border-cyan-500/70'
                : 'bg-emerald-950/30 border-emerald-500/70'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wide border ${
                    liveAttribution.biasCategory === 'ORGANIZATIONAL_INERTIA_BIAS'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : liveAttribution.biasCategory === 'WORLD_MODEL_RECALIBRATION'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : liveAttribution.biasCategory === 'HUMAN_EXPERTISE_SURPLUS'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  }`}>
                    {liveAttribution.biasCategory}
                  </span>

                  {liveAttribution.worldModelSterilized ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/80 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>World Model Sterilizzato</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/80 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>World Model Attivo</span>
                    </span>
                  )}
                </div>

                {realizationRate && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Realization Rate:</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {realizationRate.toFixed(1)}% {realizationRate >= 100 ? '(A premio)' : '(A sconto)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Detailed Explanation */}
              <div className="mt-3 space-y-2 text-xs">
                <p className="text-slate-200 leading-relaxed">
                  <strong className="text-white">Causalità Oggettiva: </strong>
                  {liveAttribution.explanation}
                </p>

                {/* Sterilization Logic Box */}
                {liveAttribution.worldModelSterilized && (
                  <div className="p-2.5 rounded-lg bg-rose-900/30 border border-rose-500/40 text-[11px] text-rose-200">
                    <strong>Protezione Integrità Algoritmica: </strong>
                    Poiché l'immobile non si è venduto in presenza di inerzia agenziale (Effort {liveEffortSnapshot.calculatedEffortScore} &lt; 0.40), le curve di elasticità e i valori OMI/Fair Value territoriali NON subiscono ribasso, prevenendo l'inquinamento dei dati storici.
                  </div>
                )}

                {liveAttribution.biasCategory === 'WORLD_MODEL_RECALIBRATION' && (
                  <div className="p-2.5 rounded-lg bg-amber-900/30 border border-amber-500/40 text-[11px] text-amber-200">
                    <strong>Convalida Empirica Rigetto di Mercato: </strong>
                    Con un effort diligente ({liveEffortSnapshot.calculatedEffortScore} &ge; 0.70), il mancato assorbimento attesta una reale resistenza della domanda. Il World Model applica un aggiustamento elastico di {liveAttribution.decisionModelUpdate.pricingElasticityAdjustment * 100}%.
                  </div>
                )}

                {liveAttribution.biasCategory === 'HUMAN_EXPERTISE_SURPLUS' && (
                  <div className="p-2.5 rounded-lg bg-cyan-900/30 border border-cyan-500/40 text-[11px] text-cyan-200">
                    <strong>Premio di Negoziazione Agente: </strong>
                    Vendita chiusa a +{(((salePrice - recommendedPrice) / recommendedPrice) * 100).toFixed(1)}% rispetto alla raccomandazione algoritmica. Le caratteristiche dell'acquirente vengono registrate come feature surplus.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            Annulla
          </button>

          <button
            type="button"
            disabled={isSubmitting || confirmed}
            onClick={handleConfirmFinalOutcome}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
              confirmed
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/50'
            }`}
          >
            {confirmed ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Esito Archiviato con Successo!</span>
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Registrazione in corso...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4 text-slate-950" />
                <span>Convalida Esito & Archivia Incarico</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
