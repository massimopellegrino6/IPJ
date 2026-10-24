import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Compass,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  BrainCircuit,
  ArrowRight,
  Filter,
  AlertTriangle,
  FileText,
  Eye,
  Sliders,
  Award,
  Zap,
  Target,
  Check,
  Building2,
  CheckCircle
} from 'lucide-react';
import { 
  MOCK_NORTH_STAR_METRICS, 
  MOCK_FORMAL_DECISION_LOGS 
} from '../../data/mockIntelligenceDatabase';
import { useDecisionStore } from '../../context/DecisionStoreContext';
import { calculateMarketResponseIndex } from '../../backend/proxyTrackingEngine';
import { ProxyMetricsInput } from '../../types/proxyTracking';

interface AnalyticsViewProps {
  initialTab?: 'NORTH_STAR' | 'TWO_STAGE_OUTCOMES' | 'EFFORT_ATTRIBUTION' | 'MODEL_SEGREGATION';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ initialTab = 'NORTH_STAR' }) => {
  const { decisionLogs, formalDecisionLogs, openProxyReviewModal, confirmProxyCheckpoint } = useDecisionStore();
  const [activeTab, setActiveTab] = useState<'NORTH_STAR' | 'TWO_STAGE_OUTCOMES' | 'EFFORT_ATTRIBUTION' | 'MODEL_SEGREGATION'>(initialTab);

  // Sync activeTab with initialTab prop when navigated externally
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [selectedEventId, setSelectedEventId] = useState<string>(formalDecisionLogs[0]?.event_id || 'evt_nomentana_mca_2026');

  // Quando si apre l'Audit Log, seleziona in automatico l'evento più recente
  useEffect(() => {
    if (formalDecisionLogs && formalDecisionLogs.length > 0) {
      setSelectedEventId(formalDecisionLogs[0].event_id);
    }
  }, [formalDecisionLogs]);

  const nomentanaLog = decisionLogs.find(l => l.decisionContext.propertyId === 'prop_rm_nomentana_221');
  const isNomentanaConfirmed = nomentanaLog?.status === 'AWAITING_FINAL_OUTCOME' || 
                              nomentanaLog?.outcomeTracking?.proxyStatus === 'PROXY_CONFIRMED' ||
                              nomentanaLog?.behavioralSignals?.some(s => s.signalType === 'PROXY_CHECKPOINT_CONFIRMED');

  const selectedLog = formalDecisionLogs.find(l => l.event_id === selectedEventId) || formalDecisionLogs[0];

  // Modulo M08 Checkpoint T+14 Interactive State
  const [m08ActualLeads, setM08ActualLeads] = useState<number>(7);
  const [m08TargetLeads, setM08TargetLeads] = useState<number>(8);
  const [m08ActualVisits, setM08ActualVisits] = useState<number>(4);
  const [m08TargetVisits, setM08TargetVisits] = useState<number>(5);
  const [m08CtrDeltaPct, setM08CtrDeltaPct] = useState<number>(28);
  const [m08FairCount, setM08FairCount] = useState<number>(3);
  const [m08HighCount, setM08HighCount] = useState<number>(1);
  const [m08LowCount, setM08LowCount] = useState<number>(0);
  const [isM08Success, setIsM08Success] = useState<boolean>(false);

  const m08Input: ProxyMetricsInput = useMemo(() => ({
    propertyId: 'prop_rm_nomentana_221',
    daysSinceDecision: 14,
    actualLeads: m08ActualLeads,
    targetLeads: m08TargetLeads,
    actualVisits: m08ActualVisits,
    targetVisits: m08TargetVisits,
    ctrDeltaPct: m08CtrDeltaPct,
    buyerFeedbackSummary: {
      lowCount: m08LowCount,
      fairCount: m08FairCount,
      highCount: m08HighCount
    }
  }), [m08ActualLeads, m08TargetLeads, m08ActualVisits, m08TargetVisits, m08CtrDeltaPct, m08LowCount, m08FairCount, m08HighCount]);

  const m08Result = useMemo(() => calculateMarketResponseIndex(m08Input), [m08Input]);

  const handleConfirmM08Checkpoint = () => {
    confirmProxyCheckpoint('prop_rm_nomentana_221', m08Input, m08Result);
    setIsM08Success(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Misurazione di Efficacia & Apprendimento Closed-Loop (v1.0)
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Analytics & Outcome Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Valutazione empirica a doppio stadio temporale (Proxy a 14–21gg e Final a 90–240gg), filtro disattenzione operativa e segregazione Anti-Bias dei modelli.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <span>Double-Loop Architecture · Formal v1.0</span>
        </div>
      </div>

      {/* 1. NORTH STAR FRAMEWORK (Section 8) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                North Star Framework: Δ Performance vs Baseline Pre-Adozione
              </h2>
              <p className="text-xs text-slate-400">
                Impatto misurabile del Decision Engine sulla velocità di realizzo, conservazione del prezzo e conversione dei mandati.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
            Sezione 8 Specifica v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          {/* 8.1 Compressione Temporale (ΔTTS) */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase text-slate-400 font-semibold font-sans flex items-center justify-between">
              <span>8.1 Indice Compressione Temporale (ΔTTS)</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-300">
                {MOCK_NORTH_STAR_METRICS.deltaTTSPct}%
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                (Accelerazione)
              </span>
            </div>
            <div className="text-xs text-slate-300 font-sans leading-relaxed">
              Tempo medio reale: <strong className="text-white">{MOCK_NORTH_STAR_METRICS.ttsRealAvgDays} gg</strong> vs <span className="text-slate-400">{MOCK_NORTH_STAR_METRICS.ttsBenchmarkAvgDays} gg benchmark</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              Formula: ((TTS_reale - TTS_benchmark) / TTS_benchmark) × 100
            </div>
          </div>

          {/* 8.2 Realization Rate (RR) */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase text-slate-400 font-semibold font-sans flex items-center justify-between">
              <span>8.2 Realization Rate di Mandato (RR)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">
                {MOCK_NORTH_STAR_METRICS.realizationRate}
              </span>
              <span className="text-xs text-slate-400">
                / 1.00 target
              </span>
            </div>
            <div className="text-xs text-slate-300 font-sans leading-relaxed">
              Preservazione valore: <strong className="text-emerald-400">98.4%</strong> del prezzo consigliato all'acquisizione.
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              Formula: Prezzo Finale Transato / Prezzo Raccomandato
            </div>
          </div>

          {/* 8.3 Mandate Conversion Rate */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase text-slate-400 font-semibold font-sans flex items-center justify-between">
              <span>8.3 Conversione Incarichi (ΔConversion)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-300">
                {MOCK_NORTH_STAR_METRICS.mandateConversionPct}%
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                (+{MOCK_NORTH_STAR_METRICS.mandateConversionDeltaPct}%)
              </span>
            </div>
            <div className="text-xs text-slate-300 font-sans leading-relaxed">
              Incarichi chiusi senza scadenza o revoca vs <span className="text-slate-400">{MOCK_NORTH_STAR_METRICS.baselineConversionPct}% baseline</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              Riduzione decadenza mandati fermi a mercato.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('NORTH_STAR')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'NORTH_STAR' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Decision Log v1.0 & Telemetria</span>
        </button>

        <button
          onClick={() => setActiveTab('TWO_STAGE_OUTCOMES')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TWO_STAGE_OUTCOMES' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Tracciamento a Due Stadi (14-21gg / 90-240gg)</span>
        </button>

        <button
          onClick={() => setActiveTab('EFFORT_ATTRIBUTION')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'EFFORT_ATTRIBUTION' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Filtro Disattenzione Operativa (Effort-Adjusted)</span>
        </button>

        <button
          onClick={() => setActiveTab('MODEL_SEGREGATION')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'MODEL_SEGREGATION' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Segregazione World Model & Anti-Bias</span>
        </button>
      </div>

      {/* TAB 1: DECISION LOG v1.0 DRILL-DOWN (Section 5.4) */}
      {activeTab === 'NORTH_STAR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center justify-between">
              <span>Eventi Registrati in Database (Audit Log v1.0)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                {formalDecisionLogs.length} Delibere
              </span>
            </div>
            {formalDecisionLogs.map((event) => {
              const isSelected = event.event_id === selectedEventId;
              const displayTitle = event.property_title || event.decision_context.property_title;
              const displayDecisionType = event.decision_type || event.observed_human_decision.event_type;
              const appliedPrice = event.applied_price || event.observed_human_decision.applied_price;
              const confidenceVal = event.confidence || Math.round(event.rating_snapshot.confidence * 100);

              return (
                <div
                  key={event.event_id}
                  onClick={() => setSelectedEventId(event.event_id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-bold">
                      {event.event_id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {event.timestamp.split('T')[0]}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {displayTitle}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Decisione:</span>
                    <span className="text-emerald-400 font-bold">
                      {displayDecisionType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Prezzo: <strong className="text-white font-mono">€{appliedPrice.toLocaleString()}</strong></span>
                    <span className="text-cyan-300 font-mono">Confidenza {confidenceVal}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event Details (Full Section 5.4 JSON View & Visual Cards) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    Evento Decisionale Selezionato
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {selectedLog.property_title || selectedLog.decision_context.property_title} ({selectedLog.event_id})
                  </h3>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[10px]">Obiettivo:</span>
                  <span className="text-emerald-400 font-bold">{selectedLog.decision_context.objective}</span>
                </div>
              </div>

              {/* Observed Fact vs Inferred Motivation (Section 5.1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Level 1: Observed Fact */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Livello 1 — Observed Fact (Fatto Certo)</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {selectedLog.decision_type || selectedLog.observed_human_decision.event_type}
                  </div>
                  <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                    <div>Prezzo Applicato: <strong className="text-white">€{(selectedLog.applied_price || selectedLog.observed_human_decision.applied_price).toLocaleString()}</strong></div>
                    <div>Consiglio Algoritmo: <strong className="text-slate-400">€{selectedLog.recommendation_issued.recommended_price.toLocaleString()}</strong></div>
                    <div>Target DOM: <strong className="text-cyan-300">{selectedLog.target_dom || selectedLog.recommendation_issued.expected_time_to_sale_days || 48} giorni</strong></div>
                    <div>Confidenza Modello: <strong className="text-emerald-400">{selectedLog.confidence || Math.round(selectedLog.rating_snapshot.confidence * 100)}% (HIGH)</strong></div>
                    <div>Delta Rilevato: <strong className={selectedLog.observed_human_decision.delta_vs_recommendation > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {selectedLog.observed_human_decision.delta_vs_recommendation > 0 ? `+€${selectedLog.observed_human_decision.delta_vs_recommendation.toLocaleString()}` : '€0'}
                    </strong></div>
                  </div>
                </div>

                {/* Level 2 & 3: Inferred Motivation */}
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Livello 2 — Motivazione Inferita (Bayesiana)</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-300">
                    {selectedLog.inferred_motivation.primary_category} · {selectedLog.inferred_motivation.sub_category}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>Confidenza Inferenza:</span>
                    <span className="font-bold text-emerald-400">{Math.round(selectedLog.inferred_motivation.confidence_score * 100)}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Stato: <strong className="text-white">{selectedLog.inferred_motivation.status}</strong> ({selectedLog.inferred_motivation.bayesianUpdatesCount} aggiornamenti Bayesiani)
                  </div>
                </div>
              </div>

              {/* Behavioral Signals 48h (Level 3) */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Livello 3 — Segnali Comportamentali Tracciati (Finestra 48h)
                </div>
                <div className="space-y-1.5">
                  {selectedLog.behavioral_signals_48h.map((sig, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80 text-xs font-mono">
                      <span className="text-slate-300">{sig.signal}</span>
                      <span className="text-slate-500 text-[10px]">{sig.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON Accordion preview matching Section 5.4 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center justify-between">
                  <span>Payload Formale JSON (Sezione 5.4)</span>
                  <span className="text-emerald-400">Validato</span>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TWO-STAGE OUTCOMES (Section 6) */}
      {activeTab === 'TWO_STAGE_OUTCOMES' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Risoluzione del Ritardo Temporale: Tracciamento Esiti a Due Stadi
              </h3>
              <p className="text-xs text-slate-400">
                Poiché il rogito richiede 90–240 giorni, il sistema chiude il feedback immediato tramite Proxy Outcomes a 14–21 giorni.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-300 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-bold">
              Sezione 6 Specifica v1.0
            </span>
          </div>

          {/* Active Monitoring T+14 Proxy Assets (via Deliberated Flow) */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  In Monitoraggio (T+14 Proxy): Checkpoint Precoce Attivo
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Finestra 14–21gg Aperta
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset 1: Via Nomentana 221 (Deliberato con Scenario A) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Via Nomentana 221 — Roma</span>
                      <span className="text-[10px] font-mono text-slate-500">(RM-NOM-221)</span>
                    </h4>
                    <div className="text-[10px] text-slate-400 font-mono">Trieste / Porta Pia · Deliberato Scenario A</div>
                  </div>
                  {isNomentanaConfirmed ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                      AWAITING_FINAL_OUTCOME
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                      CHECKPOINT T+14 PRONTO
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase block">Prezzo Deliberato</span>
                    <span className="text-emerald-400 font-bold">€484.000</span>
                    <span className="text-[9px] text-emerald-300 block">+5.2% MCA</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase block">Buyer Pool CRM</span>
                    <span className="text-white font-bold">23 Profilati</span>
                    <span className="text-[9px] text-cyan-300 block">9 High-Intent</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase block">Avanzamento Proxy</span>
                    <span className="text-emerald-400 font-bold">Giorno 14 / 14</span>
                    <span className="text-[9px] text-emerald-300 block">Raggiunto</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consuntivo Lead (14gg):</span>
                    <span className="text-emerald-400 font-bold">7 / 8 (Target +25%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Visite Eseguite (14gg):</span>
                    <span className="text-white font-bold">4 visite concluse (Target 5)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Response Index:</span>
                    <span className="text-emerald-400 font-bold">
                      {isNomentanaConfirmed || isM08Success ? '84.4/100 (TRAIETTORIA VALIDATA)' : '84.4/100 (In Revisione)'}
                    </span>
                  </div>
                </div>

                {/* Interactive Checkpoint Trigger Button */}
                <button
                  onClick={() => openProxyReviewModal('prop_rm_nomentana_221')}
                  className={`w-full mt-2 px-3.5 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isNomentanaConfirmed || isM08Success
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {isNomentanaConfirmed || isM08Success 
                      ? 'Rivedi Checkpoint T+14 in Modale' 
                      : 'Esegui Revisione Checkpoint T+14 in Modale'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Asset 2: Via dell'Indipendenza 12 (Bologna) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Via dell'Indipendenza 12 — Bologna</span>
                      <span className="text-[10px] font-mono text-slate-500">(BO-IND-12)</span>
                    </h4>
                    <div className="text-[10px] text-slate-400 font-mono">Centro Storico · Deliberato Compromesso</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                    DELIBERATED
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase block">Prezzo Deliberato</span>
                    <span className="text-cyan-300 font-bold">€440.000</span>
                    <span className="text-[9px] text-cyan-400 block">-4.3%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase block">Buyer Pool CRM</span>
                    <span className="text-white font-bold">14 Profilati</span>
                    <span className="text-[9px] text-slate-400 block">4 High-Intent</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase block">Avanzamento Proxy</span>
                    <span className="text-amber-300 font-bold">Giorno 11 / 14</span>
                    <span className="text-[9px] text-slate-400 block">In Riconciliazione</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Lead a 14gg:</span>
                    <span className="text-emerald-400 font-bold">+30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Visite Attese entro T+14:</span>
                    <span className="text-white font-bold">4 visite fissate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidenza Metodologica:</span>
                    <span className="text-cyan-300 font-bold">86% (HIGH)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INTERFACCIA OPERATIVA CHECKPOINT T+14 — MODULO M08 (§10, §29) */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/50 space-y-6 shadow-xl shadow-emerald-950/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
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
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Revisione Operativa Proxy Checkpoint: Via Nomentana 221 — Roma</span>
                  <span className="text-xs font-mono text-slate-400">(RM-NOM-221)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prezzo Deliberato MCA: <strong className="text-emerald-400">€484.000 (+5.2%)</strong> · Microzona: <strong className="text-slate-300">Trieste / Porta Pia, Roma</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setM08ActualLeads(7);
                    setM08TargetLeads(8);
                    setM08ActualVisits(4);
                    setM08TargetVisits(5);
                    setM08CtrDeltaPct(28);
                    setM08FairCount(3);
                    setM08HighCount(1);
                    setM08LowCount(0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Reset Consuntivi Specifica
                </button>
              </div>
            </div>

            {/* Notification if confirmed */}
            {(isNomentanaConfirmed || isM08Success) && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">Checkpoint T+14 Confermato con Successo!</h4>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    Stato aggiornato a <strong>AWAITING_FINAL_OUTCOME</strong>. Evento <code>PROXY_CHECKPOINT_CONFIRMED</code> registrato nel Decision Log.
                  </p>
                </div>
              </div>
            )}

            {/* 2-Column Grid: Form Inputs vs Live Calculation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Consuntivi Empirical Inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>1. Consuntivi Empirici Prime 2 Settimane (T+14)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {/* Visite Concluse */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Visite Concluse (35%)</span>
                      <span className="text-[10px] text-slate-500">Target: {m08TargetVisits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setM08ActualVisits(Math.max(0, m08ActualVisits - 1))}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xl font-bold text-white px-2">{m08ActualVisits}</span>
                        <button
                          onClick={() => setM08ActualVisits(m08ActualVisits + 1)}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold">
                        {Math.round((m08ActualVisits / m08TargetVisits) * 100)}% target
                      </span>
                    </div>
                  </div>

                  {/* Lead Ricevuti */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Lead Ricevuti (30%)</span>
                      <span className="text-[10px] text-slate-500">Target: {m08TargetLeads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setM08ActualLeads(Math.max(0, m08ActualLeads - 1))}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xl font-bold text-white px-2">{m08ActualLeads}</span>
                        <button
                          onClick={() => setM08ActualLeads(m08ActualLeads + 1)}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold">
                        {Math.round((m08ActualLeads / m08TargetLeads) * 100)}% target
                      </span>
                    </div>
                  </div>

                  {/* CTR Portali */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Δ CTR Portali (20%)</span>
                      <span className="text-[10px] text-slate-500">vs Benchmark</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setM08CtrDeltaPct(Math.max(-50, m08CtrDeltaPct - 5))}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xl font-bold text-emerald-400 px-1">+{m08CtrDeltaPct}%</span>
                        <button
                          onClick={() => setM08CtrDeltaPct(m08CtrDeltaPct + 5)}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-cyan-300 font-bold">Eccellente</span>
                    </div>
                  </div>

                  {/* Buyer Sentiment Prezzo */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Sentiment Prezzo Buyer (15%)</span>
                      <span className="text-[10px] text-slate-500">{m08FairCount + m08HighCount + m08LowCount} Feedback</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => { setM08FairCount(prev => prev + 1); }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 cursor-pointer"
                        title="Aggiungi feedback Fair"
                      >
                        Fair: {m08FairCount}
                      </button>
                      <button
                        onClick={() => { setM08HighCount(prev => prev + 1); }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 cursor-pointer"
                        title="Aggiungi feedback High"
                      >
                        High: {m08HighCount}
                      </button>
                      <button
                        onClick={() => { setM08LowCount(prev => Math.max(0, prev + 1)); }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-bold border border-rose-500/30 cursor-pointer"
                        title="Aggiungi feedback Low"
                      >
                        Low: {m08LowCount}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Formula deterministica: <code>MRI = (0.35 × Visite) + (0.30 × Leads) + (0.20 × CTR) + (0.15 × Sentiment)</code></span>
                  <span className="text-emerald-400 font-bold">Standard ABI / IVS</span>
                </div>
              </div>

              {/* Right Column: Live MRI Result & Model Recalibration (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                      2. Calcolo Live Market Response Index
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      m08Result.trajectoryStatus === 'TRAIETTORIA_VALIDATA'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : m08Result.trajectoryStatus === 'ATTENZIONE_ATTRITO'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {m08Result.trajectoryStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
                        {m08Result.mriScore.toFixed(1)}
                      </span>
                      <span className="text-slate-400 font-mono text-sm ml-1">/ 100</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Soglia Validazione</span>
                      <span className="text-xs font-bold text-white font-mono">≥ 65.0 pt</span>
                    </div>
                  </div>

                  {/* Dimension breakdown */}
                  <div className="space-y-1.5 pt-3 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Visite (35%): <strong className="text-white">{(m08Result.dimensionalScores?.weightedVisits || 28.0).toFixed(1)} pt</strong></span>
                      <span>Lead (30%): <strong className="text-white">{(m08Result.dimensionalScores?.weightedLeads || 26.3).toFixed(1)} pt</strong></span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>CTR (20%): <strong className="text-white">{(m08Result.dimensionalScores?.weightedCtr || 18.0).toFixed(1)} pt</strong></span>
                      <span>Sentiment (15%): <strong className="text-white">{(m08Result.dimensionalScores?.weightedSentiment || 12.2).toFixed(1)} pt</strong></span>
                    </div>
                  </div>

                  {/* Recalibration Impact Box */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Boost Confidenza Decision Model:</span>
                      <span className="text-emerald-400 font-bold">
                        +{Math.round(m08Result.confidenceBoost * 100)}% (90% → 98% HIGH)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Action Score Ricalibrato:</span>
                      <span className="text-cyan-300 font-bold">{m08Result.actionScoreRecalibrated}/100 (Non più in stasi)</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans pt-1 border-t border-slate-800/80 leading-relaxed">
                      {m08Result.rationale}
                    </div>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={handleConfirmM08Checkpoint}
                    disabled={isNomentanaConfirmed || isM08Success}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Conferma Checkpoint & Avanza a Monitoraggio Offerte</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage 1: Short-Term Proxy Outcomes */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase font-mono flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Stadio 1: Short-Term Proxy Outcomes (14–21 Giorni)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  Aggiornamento Pesi Immediato
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Metriche precoci di riscontro dal mercato registrate sull'annuncio:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Δ Visualizzazioni Annuncio</span>
                  <span className="text-lg font-bold text-emerald-400">{selectedLog.outcome_tracking.short_term_proxies.views_delta_pct}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Δ Richieste Lead (14d)</span>
                  <span className="text-lg font-bold text-emerald-400">{selectedLog.outcome_tracking.short_term_proxies.leads_delta_14d}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Visite Fissate (14d)</span>
                  <span className="text-lg font-bold text-white">{selectedLog.outcome_tracking.short_term_proxies.visits_scheduled_14d} appuntamenti</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Proposte Ricevute</span>
                  <span className="text-lg font-bold text-cyan-300">{selectedLog.outcome_tracking.short_term_proxies.offers_received_14d} offerte</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
                ✓ Aggiornamento immediato dei coefficienti di elasticità e confidenza senza attendere il rogito.
              </div>
            </div>

            {/* Stage 2: Long-Term Final Outcomes */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 uppercase font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Stadio 2: Long-Term Final Outcomes (90–240 Giorni)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Ricalibrazione di Fondo
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Esito definitivo convalidato da atto pubblico notarile o chiusura del mandato:
              </p>

              {selectedLog.outcome_tracking.final_outcome && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Prezzo Finale Transato</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {selectedLog.outcome_tracking.final_outcome.sale_price > 0 
                        ? `€${selectedLog.outcome_tracking.final_outcome.sale_price.toLocaleString()}`
                        : 'Incarico Decaduto'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Giorni Totali sul Mercato</span>
                    <span className="text-lg font-bold text-white">{selectedLog.outcome_tracking.final_outcome.days_on_market_total} gg</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Stato Mandato</span>
                    <span className="text-sm font-bold text-emerald-300">{selectedLog.outcome_tracking.final_outcome.mandate_outcome}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Delta vs Stima AI</span>
                    <span className="text-sm font-bold text-cyan-300">{selectedLog.outcome_tracking.final_outcome.price_delta_vs_ai_pct > 0 ? `+${selectedLog.outcome_tracking.final_outcome.price_delta_vs_ai_pct}%` : `${selectedLog.outcome_tracking.final_outcome.price_delta_vs_ai_pct}%`}</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200">
                ✓ Ricalibrazione dei coefficienti edonici territoriali e validazione della Ground Truth.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EFFORT-ADJUSTED ATTRIBUTION (Section 6.1) */}
      {activeTab === 'EFFORT_ATTRIBUTION' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                6.1 Filtro per la Disattenzione Operativa (Effort-Adjusted Attribution)
              </h3>
              <p className="text-xs text-slate-400">
                Evita che l'inerzia commerciale dell'agente venga erroneamente interpretata come errore predittivo del modello di mercato.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-bold">
              Covariata di Controllo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_FORMAL_DECISION_LOGS.map((log) => {
              const effort = log.operational_effort;
              return (
                <div
                  key={log.event_id}
                  className={`p-5 rounded-xl border space-y-3 ${
                    effort.isAttributedToOperationalInertia
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{log.decision_context.property_title}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      effort.isAttributedToOperationalInertia
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {effort.isAttributedToOperationalInertia ? 'DISATTENZIONE' : 'EFFORT ATTIVO'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-slate-300">
                    <div>Tempo Risposta Lead: <strong className="text-white">{effort.avgLeadContactTimeHours}h</strong></div>
                    <div>Giorni Senza Update Listing: <strong className="text-white">{effort.listingFreshnessDays} gg</strong></div>
                    <div>Budget Pubblicitario: <strong className="text-white">€{effort.adSpendAllocatedEuros}</strong></div>
                    <div>Visite Effettuate / Fissate: <strong className="text-white">{Math.round(effort.scheduledVisitsCompletedRatio * 100)}%</strong></div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    <strong>Attribuzione:</strong> {effort.attributionReason}
                  </div>

                  {effort.isAttributedToOperationalInertia && (
                    <div className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>ESCLUSO dall'aggiornamento pesi World Model</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MODEL SEGREGATION & ANTI-BIAS (Section 7) */}
      {activeTab === 'MODEL_SEGREGATION' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                7. Motore di Apprendimento: Segregazione dei Modelli e Anti-Bias
              </h3>
              <p className="text-xs text-slate-400">
                Separazione computazionale su due binari distinti per impedire che le inefficienze decisionali dell'utente degradino l'accuratezza predittiva oggettiva.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-bold">
              Sezione 7 Specifica v1.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* World Learning */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
              <div className="text-xs font-bold text-cyan-300 uppercase font-mono flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span>WORLD LEARNING (Come Funziona il Mercato)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Apprende le leggi oggettive della microzona:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono">
                <li>Elasticità prezzo / tempo di vendita</li>
                <li>Validità oggettiva dei comparabili</li>
                <li>Curve di domanda reali e traffico attivo</li>
                <li>Correzione AVM territoriali empirici</li>
              </ul>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <strong className="text-cyan-300">Stato:</strong> Protetto da distorsioni comportamentali.
              </div>
            </div>

            {/* Decision Learning */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-3">
              <div className="text-xs font-bold text-purple-300 uppercase font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>DECISION LEARNING (Come Opera l'Organizzazione)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Apprende le dinamiche interne e la propensione al rischio del team:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono">
                <li>Vincoli negoziali tipici con i proprietari</li>
                <li>Rigidità verso concessione sconti</li>
                <li>Profilo di rischio dell'agenzia</li>
                <li>Pattern decisionali ricorrenti per singolo agente</li>
              </ul>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <strong className="text-purple-300">Stato:</strong> Mappatura attiva dei bias negoziali.
              </div>
            </div>
          </div>

          {/* Section 7.1 Learn From Disagreement */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>7.1 Apprendimento dal Disaccordo (Learn From Disagreement)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-bold font-mono">Caso 1: Outcome Umano &gt; Outcome AI</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  L'evento innesca una procedura di individuazione delle <strong>feature qualitative non censite</strong> (es. ristrutturazione di pregio, esposizione panoramica). L'esperienza umana espande la conoscenza del World Model.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-amber-400 font-bold font-mono">Caso 2: Outcome Umano &lt; Outcome AI (Clausola Anti-Bias)</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Il sistema <strong>NON adatta il World Model</strong> per conformarsi all'errore dell'agente. L'evento viene registrato nel Decision Model come bias negoziale e il sistema quantifica il costo economico dell'inerzia.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
