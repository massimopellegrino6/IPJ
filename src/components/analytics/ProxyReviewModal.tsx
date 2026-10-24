import React, { useState, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  Eye, 
  Activity, 
  ArrowRight, 
  Sliders, 
  ShieldCheck, 
  Sparkles,
  Info,
  Check,
  Building2
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { useDecisionStore } from '../../context/DecisionStoreContext';
import { ProxyMetricsInput, MarketResponseIndexResult } from '../../types/proxyTracking';
import { calculateMarketResponseIndex, getViaNomentanaDefaultProxyInput } from '../../backend/proxyTrackingEngine';

export interface ProxyReviewModalProps {
  property?: PropertyItem | null;
  onClose: () => void;
  onNavigateToSimulator?: () => void;
}

export const ProxyReviewModal: React.FC<ProxyReviewModalProps> = ({
  property,
  onClose,
  onNavigateToSimulator
}) => {
  const { confirmProxyCheckpoint, getLatestLogForProperty } = useDecisionStore();

  const isNomentana = !property || property.id === 'prop_rm_nomentana_221' || property.code === 'RM-NOM-221';
  const defaultNomentana = getViaNomentanaDefaultProxyInput();

  // Active property identification
  const propertyId = property?.id || defaultNomentana.propertyId;
  const propertyCode = property?.code || 'RM-NOM-221';
  const propertyTitle = property?.title || 'Via Nomentana 221 — Roma';
  const propertyZone = property?.microZone || 'Trieste / Porta Pia, Roma';
  const deliberatedPrice = property ? (property.askingPrice === 460000 ? 484000 : property.askingPrice) : 484000;

  // Editable empirical metrics state (default to specifications: Leads: 7, Visite: 4, CTR: +28%, Sentiment: 3 Fair / 1 High)
  const [actualLeads, setActualLeads] = useState<number>(defaultNomentana.actualLeads);
  const [targetLeads, setTargetLeads] = useState<number>(defaultNomentana.targetLeads);
  const [actualVisits, setActualVisits] = useState<number>(defaultNomentana.actualVisits);
  const [targetVisits, setTargetVisits] = useState<number>(defaultNomentana.targetVisits);
  const [ctrDeltaPct, setCtrDeltaPct] = useState<number>(defaultNomentana.ctrDeltaPct);

  // Buyer sentiment counters
  const [lowCount, setLowCount] = useState<number>(defaultNomentana.buyerFeedbackSummary.lowCount);
  const [fairCount, setFairCount] = useState<number>(defaultNomentana.buyerFeedbackSummary.fairCount);
  const [highCount, setHighCount] = useState<number>(defaultNomentana.buyerFeedbackSummary.highCount);

  const [isConfirmedSuccess, setIsConfirmedSuccess] = useState(false);

  // Current Input Package
  const currentInput: ProxyMetricsInput = useMemo(() => {
    return {
      propertyId,
      daysSinceDecision: 14,
      actualLeads,
      targetLeads,
      actualVisits,
      targetVisits,
      ctrDeltaPct,
      buyerFeedbackSummary: {
        lowCount,
        fairCount,
        highCount
      }
    };
  }, [propertyId, actualLeads, targetLeads, actualVisits, targetVisits, ctrDeltaPct, lowCount, fairCount, highCount]);

  // Live Deterministic Calculation of Market Response Index (MRI)
  const mriResult: MarketResponseIndexResult = useMemo(() => {
    return calculateMarketResponseIndex(currentInput);
  }, [currentInput]);

  const handleConfirm = () => {
    confirmProxyCheckpoint(propertyId, currentInput, mriResult);
    setIsConfirmedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleResetToSpec = () => {
    setActualLeads(7);
    setTargetLeads(8);
    setActualVisits(4);
    setTargetVisits(5);
    setCtrDeltaPct(28);
    setLowCount(0);
    setFairCount(3);
    setHighCount(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Stripe */}
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                Checkpoint T+14 (Giorno 14 di 14 raggiunto)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Modulo M08 · Product Thesis §10, §29
              </span>
            </div>
            
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Revisione Proxy Checkpoint: {propertyTitle}</span>
              <span className="text-xs font-mono text-slate-400 font-normal">({propertyCode})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Microzona: <strong className="text-slate-300">{propertyZone}</strong> · Prezzo Deliberato MCA: <strong className="text-emerald-400">€{deliberatedPrice.toLocaleString('it-IT')}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Success Banner */}
        {isConfirmedSuccess && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">Checkpoint T+14 Confermato con Successo!</h4>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                Stato aggiornato a <strong>AWAITING_FINAL_OUTCOME</strong>. Evento <code>PROXY_CHECKPOINT_CONFIRMED</code> salvato nell'Audit Trail.
              </p>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Info Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Finestra di Riconciliazione Empirica (14–21 Giorni)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Riconcilia i comportamenti di mercato registrati nelle prime 2 settimane rispetto alle attese del modello predittivo.
                La validazione dell'assorbimento sblocca l'immobile dallo stato di stasi e ne consolida la confidenza verso il rogito finale.
              </p>
            </div>
            <button
              onClick={handleResetToSpec}
              className="ml-auto text-[10px] font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer shrink-0 whitespace-nowrap transition-colors"
            >
              Ripristina Consuntivi Certificati
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Metric Adjustment Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Consuntivi Rilevati sul Campo (Input Intermedio)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Pesi Dimensionali M08</span>
              </div>

              {/* 1. VISITS METRIC */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">1. Visite sul Campo Effettuate</h4>
                      <span className="text-[10px] font-mono text-slate-400">Target atteso a 14gg: <strong>{targetVisits} visite</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Peso: 35% · Contributo: +{mriResult.dimensionalScores?.weightedVisits} pt
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActualVisits(Math.max(0, actualVisits - 1))}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-base text-white">
                      {actualVisits}
                    </span>
                    <button
                      onClick={() => setActualVisits(actualVisits + 1)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={actualVisits}
                    onChange={(e) => setActualVisits(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />

                  <div className="text-right text-[11px] font-mono text-slate-300 w-24">
                    Score: <strong>{mriResult.dimensionalScores?.sVisits}/100</strong>
                  </div>
                </div>
              </div>

              {/* 2. LEADS METRIC */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">2. Volume Leads Qualificati Acquisiti</h4>
                      <span className="text-[10px] font-mono text-slate-400">Target atteso a 14gg: <strong>{targetLeads} leads</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      Peso: 30% · Contributo: +{mriResult.dimensionalScores?.weightedLeads} pt
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActualLeads(Math.max(0, actualLeads - 1))}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-base text-white">
                      {actualLeads}
                    </span>
                    <button
                      onClick={() => setActualLeads(actualLeads + 1)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={actualLeads}
                    onChange={(e) => setActualLeads(Number(e.target.value))}
                    className="flex-1 accent-teal-500 cursor-pointer"
                  />

                  <div className="text-right text-[11px] font-mono text-slate-300 w-24">
                    Score: <strong>{mriResult.dimensionalScores?.sLeads}/100</strong>
                  </div>
                </div>
              </div>

              {/* 3. CTR METRIC */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">3. Dinamica CTR Annuncio Portali</h4>
                      <span className="text-[10px] font-mono text-slate-400">Benchmark microzona: <strong>+20%</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      Peso: 20% · Contributo: +{mriResult.dimensionalScores?.weightedCtr} pt
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCtrDeltaPct(Math.max(-50, ctrDeltaPct - 2))}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="w-14 text-center font-mono font-bold text-base text-cyan-300">
                      +{ctrDeltaPct}%
                    </span>
                    <button
                      onClick={() => setCtrDeltaPct(Math.min(100, ctrDeltaPct + 2))}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <input
                    type="range"
                    min="-20"
                    max="60"
                    step="1"
                    value={ctrDeltaPct}
                    onChange={(e) => setCtrDeltaPct(Number(e.target.value))}
                    className="flex-1 accent-cyan-500 cursor-pointer"
                  />

                  <div className="text-right text-[11px] font-mono text-slate-300 w-24">
                    Score: <strong>{mriResult.dimensionalScores?.sCtr}/100</strong>
                  </div>
                </div>
              </div>

              {/* 4. BUYER SENTIMENT */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">4. Sentiment Prezzo Buyer (Visite Concluse)</h4>
                      <span className="text-[10px] font-mono text-slate-400">Distribuzione feedback qualitativi registrati</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Peso: 15% · Contributo: +{mriResult.dimensionalScores?.weightedSentiment} pt
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {/* Low */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">Low (Prezzo Alto)</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setLowCount(Math.max(0, lowCount - 1))}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm text-white">{lowCount}</span>
                      <button
                        onClick={() => setLowCount(lowCount + 1)}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Fair */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 flex flex-col items-center">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Fair (Congruo)</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setFairCount(Math.max(0, fairCount - 1))}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm text-emerald-300">{fairCount}</span>
                      <button
                        onClick={() => setFairCount(fairCount + 1)}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* High */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 flex flex-col items-center">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">High (Favorevole)</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setHighCount(Math.max(0, highCount - 1))}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm text-cyan-300">{highCount}</span>
                      <button
                        onClick={() => setHighCount(highCount + 1)}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live MRI Score & Model Recalibration (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Calcolo Live Market Response Index
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Real-Time Engine</span>
              </div>

              {/* HERO MRI SCORE CARD */}
              <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/40 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Activity className="w-28 h-28 text-emerald-400" />
                </div>

                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Market Response Index (MRI)
                </span>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                    {mriResult.mriScore.toFixed(1)}
                  </span>
                  <span className="text-slate-400 font-mono text-sm">/ 100</span>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{mriResult.trajectoryStatus.replace('_', ' ')}</span>
                </div>

                {/* Mathematical Breakdown Bars */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span className="text-slate-400">Visite (35%):</span>
                    <span className="font-bold text-white">{mriResult.dimensionalScores?.weightedVisits} / 35.0 pt</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${(mriResult.dimensionalScores?.weightedVisits || 0) / 0.35}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span className="text-slate-400">Leads (30%):</span>
                    <span className="font-bold text-white">{mriResult.dimensionalScores?.weightedLeads} / 30.0 pt</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-400 transition-all duration-300"
                      style={{ width: `${(mriResult.dimensionalScores?.weightedLeads || 0) / 0.30}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span className="text-slate-400">CTR Portali (20%):</span>
                    <span className="font-bold text-white">{mriResult.dimensionalScores?.weightedCtr} / 20.0 pt</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-300"
                      style={{ width: `${(mriResult.dimensionalScores?.weightedCtr || 0) / 0.20}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span className="text-slate-400">Sentiment (15%):</span>
                    <span className="font-bold text-white">{mriResult.dimensionalScores?.weightedSentiment} / 15.0 pt</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${(mriResult.dimensionalScores?.weightedSentiment || 0) / 0.15}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* IMPACT ON DECISION MODEL BOX */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Ricalibrazione Modello Decisionale
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Boost Confidenza</span>
                    <span className="text-emerald-400 font-bold text-sm block">
                      +{mriResult.confidenceBoost > 0 ? (mriResult.confidenceBoost * 100).toFixed(0) : '0'}% pt
                    </span>
                    <span className="text-[9px] text-slate-400">90% → 98% (HIGH)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Action Score</span>
                    <span className="text-cyan-300 font-bold text-sm block">
                      {mriResult.actionScoreRecalibrated}/100
                    </span>
                    <span className="text-[9px] text-emerald-400">Non più in stasi</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
                  <strong className="text-white block mb-0.5">Rationale Esecutivo:</strong>
                  {mriResult.rationale}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono text-center sm:text-left">
            <span>Stato Target Post-Conferma: </span>
            <strong className="text-emerald-400">AWAITING_FINAL_OUTCOME</strong>
            <span className="block sm:inline sm:ml-2 text-slate-500">• Evento <code>PROXY_CHECKPOINT_CONFIRMED</code></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isConfirmedSuccess}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirmedSuccess}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Conferma Checkpoint & Avanza a Monitoraggio Offerte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
