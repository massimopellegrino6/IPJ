import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import { 
  MOCK_NORTH_STAR_METRICS, 
  MOCK_FORMAL_DECISION_LOGS 
} from '../../data/mockIntelligenceDatabase';

export const AnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NORTH_STAR' | 'TWO_STAGE_OUTCOMES' | 'EFFORT_ATTRIBUTION' | 'MODEL_SEGREGATION'>('NORTH_STAR');
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_FORMAL_DECISION_LOGS[0].event_id);

  const selectedLog = MOCK_FORMAL_DECISION_LOGS.find(l => l.event_id === selectedEventId) || MOCK_FORMAL_DECISION_LOGS[0];

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
            <div className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
              Eventi Registrati in Database (Audit Log v1.0)
            </div>
            {MOCK_FORMAL_DECISION_LOGS.map((event) => {
              const isSelected = event.event_id === selectedEventId;
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
                    {event.decision_context.property_title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Decisione:</span>
                    <span className="text-emerald-400 font-bold">
                      {event.observed_human_decision.event_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Agente: {event.decision_context.agent_name}</span>
                    <span className="text-cyan-300 font-mono">Score {event.recommendation_issued.action_score}</span>
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
                    {selectedLog.decision_context.property_title} ({selectedLog.event_id})
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
                    {selectedLog.observed_human_decision.event_type}
                  </div>
                  <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                    <div>Prezzo Applicato: <strong className="text-white">€{selectedLog.observed_human_decision.applied_price.toLocaleString()}</strong></div>
                    <div>Consiglio Algoritmo: <strong className="text-slate-400">€{selectedLog.recommendation_issued.recommended_price.toLocaleString()}</strong></div>
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
