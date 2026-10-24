import React, { useState } from 'react';
import { DecisionLogEntry } from '../types/proptech';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Filter, 
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { useDecisionStore } from '../context/DecisionStoreContext';

interface DecisionLogHistoryProps {
  logs?: DecisionLogEntry[];
}

export const DecisionLogHistory: React.FC<DecisionLogHistoryProps> = ({ logs: propLogs }) => {
  const { decisionLogs } = useDecisionStore();
  const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED' | 'STEP3_ATTRIBUTION'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // If propLogs is not provided or empty, map from decisionLogs in context
  const effectiveLogs: DecisionLogEntry[] = React.useMemo(() => {
    if (propLogs && propLogs.length > 0) {
      return propLogs.map((pl) => {
        const matchingDl = decisionLogs.find((d) => d.decisionContext.propertyId === pl.property_id);
        if (matchingDl && matchingDl.finalOutcomeReconciliation) {
          const rec = matchingDl.finalOutcomeReconciliation;
          return {
            ...pl,
            final_mandate_outcome: rec.outcomeType,
            attribution_bias_category: rec.attribution.biasCategory,
            world_model_sterilized: rec.attribution.worldModelSterilized,
            operative_effort_score: rec.operativeEffort.compositeScore,
            actual_sale_price: rec.actualSalePrice,
            days_on_market_actual: rec.totalDaysOnMarket
          };
        }
        return pl;
      });
    }

    // Default fallback from decisionLogs
    return decisionLogs.map((dl) => {
      const rec = dl.finalOutcomeReconciliation;
      return {
        id: dl.eventId,
        property_id: dl.decisionContext.propertyId,
        agent_id: dl.decisionContext.agentId,
        agent_name: dl.decisionContext.agentId === 'broker_elena_rossi' ? 'Elena Rossi' : 'Marco Bianchi',
        evaluated_at: dl.timestamp,
        model_version: 'v1.4-bayesian-reconciled',
        system_rating: dl.recommendationIssued.recommendedRating || 84,
        system_confidence: 88,
        system_recommended_action: 'ACQUIRE_PRIORITY',
        system_suggested_price: dl.recommendationIssued.recommendedPrice,
        system_degraded: false,
        system_missing_signals: [],
        agent_decision: dl.observedHumanDecision.eventType === 'ACCEPTED' ? 'ACCEPTED' :
                        dl.observedHumanDecision.eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? 'OVERRIDDEN' : 'REJECTED',
        agent_final_price: dl.observedHumanDecision.appliedPrice,
        agent_feedback_notes: dl.observedHumanDecision.notes || 'Validazione strategica closed-loop.',
        delta_price_pct: dl.observedHumanDecision.deltaVsRecommendation !== 0 
          ? Number(((dl.observedHumanDecision.deltaVsRecommendation / dl.recommendationIssued.recommendedPrice) * 100).toFixed(1)) 
          : 0,
        final_mandate_outcome: rec?.outcomeType || null,
        attribution_bias_category: rec?.attribution.biasCategory || null,
        world_model_sterilized: rec?.attribution.worldModelSterilized ?? null,
        operative_effort_score: rec?.operativeEffort.compositeScore ?? null,
        actual_sale_price: rec?.actualSalePrice ?? null,
        days_on_market_actual: rec?.totalDaysOnMarket ?? null,
        created_at: dl.timestamp
      };
    });
  }, [propLogs, decisionLogs]);

  const filteredLogs = effectiveLogs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'STEP3_ATTRIBUTION') return Boolean(log.attribution_bias_category);
    return log.agent_decision === filter;
  });

  const acceptedCount = effectiveLogs.filter((l) => l.agent_decision === 'ACCEPTED').length;
  const overriddenCount = effectiveLogs.filter((l) => l.agent_decision === 'OVERRIDDEN').length;
  const rejectedCount = effectiveLogs.filter((l) => l.agent_decision === 'REJECTED').length;
  const step3Count = effectiveLogs.filter((l) => l.attribution_bias_category).length;

  const inertiaSterilizedCount = effectiveLogs.filter(
    (l) => l.attribution_bias_category === 'ORGANIZATIONAL_INERTIA_BIAS'
  ).length;
  const worldModelRecalibratedCount = effectiveLogs.filter(
    (l) => l.attribution_bias_category === 'WORLD_MODEL_RECALIBRATION'
  ).length;

  return (
    <div className="space-y-4 text-slate-900">
      {/* Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Telemetry, Audit & Step 3 Attribution Table (Product Thesis v1.0)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Flywheel Decisionale: Tabella public.decision_log
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Ogni interazione cattura l'output algoritmico frozen, la decisione effettiva e l'esito finale a 60–90gg. 
            Segregazione rigorosa tra <strong>World Model</strong> (mercato oggettivo) e <strong>Decision Model</strong> (effort agenziale).
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['ALL', 'ACCEPTED', 'OVERRIDDEN', 'REJECTED', 'STEP3_ATTRIBUTION'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' && `Tutti (${effectiveLogs.length})`}
              {f === 'ACCEPTED' && `Accettati (${acceptedCount})`}
              {f === 'OVERRIDDEN' && `Modificati (${overriddenCount})`}
              {f === 'REJECTED' && `Rifiutati (${rejectedCount})`}
              {f === 'STEP3_ATTRIBUTION' && `Step 3 Esiti (${step3Count})`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Decisioni Totali
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {effectiveLogs.length}
          </div>
          <span className="text-[11px] text-slate-500">Record in database</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Tasso di Accettazione
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {effectiveLogs.length > 0 ? Math.round((acceptedCount / effectiveLogs.length) * 100) : 0}%
          </div>
          <span className="text-[11px] text-slate-500">Allineamento algoritmo</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Prezzo Riadattato
          </span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            {overriddenCount}
          </div>
          <span className="text-[11px] text-slate-500">Intervento periziale agente</span>
        </div>

        {/* Step 3 Segregation KPIs */}
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
            Inerzia (Sterilizzati)
          </span>
          <div className="text-2xl font-extrabold text-rose-700 font-mono">
            {inertiaSterilizedCount}
          </div>
          <span className="text-[11px] text-rose-600">World Model protetto da bias</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs bg-amber-50/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
            Rigetto (Ricalibrati)
          </span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            {worldModelRecalibratedCount}
          </div>
          <span className="text-[11px] text-amber-600">Elasticità mercato aggiornata</span>
        </div>
      </div>

      {/* Log List Bento Container */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">Nessun record corrisponde al filtro selezionato.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const matchingDl = decisionLogs.find((d) => d.decisionContext.propertyId === log.property_id);
            const finalRec = matchingDl?.finalOutcomeReconciliation;

            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs transition-all hover:border-slate-300 overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/50"
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="p-2.5 rounded-xl shrink-0 bg-slate-100 border border-slate-200">
                      {log.agent_decision === 'ACCEPTED' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      {log.agent_decision === 'OVERRIDDEN' && (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      {log.agent_decision === 'REJECTED' && (
                        <X className="w-5 h-5 text-rose-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {log.property_id}
                        </span>
                        
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            log.agent_decision === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : log.agent_decision === 'OVERRIDDEN'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {log.agent_decision}
                        </span>

                        {/* Step 3: Bias Segregation Badge */}
                        {log.attribution_bias_category && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md font-mono tracking-tight border ${
                              log.attribution_bias_category === 'ORGANIZATIONAL_INERTIA_BIAS'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : log.attribution_bias_category === 'WORLD_MODEL_RECALIBRATION'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : log.attribution_bias_category === 'HUMAN_EXPERTISE_SURPLUS'
                                ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                            title={log.world_model_sterilized 
                              ? 'World Model Sterilizzato: mancata vendita dovuta a bassa esecuzione agenziale (Effort < 0.40)' 
                              : 'World Model Ricalibrato: rigetto di mercato validato con alto effort (>= 0.70)'
                            }
                          >
                            {log.attribution_bias_category === 'ORGANIZATIONAL_INERTIA_BIAS' && (
                              <>
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>ORGANIZATIONAL_INERTIA_BIAS (STERILIZZATO)</span>
                              </>
                            )}
                            {log.attribution_bias_category === 'WORLD_MODEL_RECALIBRATION' && (
                              <>
                                <RefreshCw className="w-3 h-3 text-amber-600" />
                                <span>WORLD_MODEL_RECALIBRATION (RICALIBRATO)</span>
                              </>
                            )}
                            {log.attribution_bias_category === 'HUMAN_EXPERTISE_SURPLUS' && (
                              <>
                                <Sparkles className="w-3 h-3 text-cyan-600" />
                                <span>HUMAN_EXPERTISE_SURPLUS</span>
                              </>
                            )}
                            {log.attribution_bias_category === 'MARKET_ALIGNED_SUCCESS' && (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>MARKET_ALIGNED_SUCCESS</span>
                              </>
                            )}
                          </span>
                        )}

                        {/* Step 3: Final Mandate Outcome Tag */}
                        {log.final_mandate_outcome && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            log.final_mandate_outcome === 'CLOSED_SALE_WON'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {log.final_mandate_outcome === 'CLOSED_SALE_WON' ? (
                              <>
                                <Trophy className="w-2.5 h-2.5 text-emerald-600" />
                                <span>ROGITO €{log.actual_sale_price?.toLocaleString('it-IT') || 'N/A'}</span>
                              </>
                            ) : (
                              <span>ESITO: {log.final_mandate_outcome}</span>
                            )}
                          </span>
                        )}

                        {log.system_degraded && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            DEGRADED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Agente: <span className="text-slate-700 font-semibold">{log.agent_name}</span> • Modello: <span className="font-mono text-slate-600">{log.model_version}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Rating / Conf.
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {log.system_rating}/100 • {log.system_confidence}%
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Prezzo Applicato
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {log.agent_final_price ? `€ ${log.agent_final_price.toLocaleString('it-IT')}` : 'Rifiutato'}
                      </span>
                      {log.delta_price_pct !== null && log.delta_price_pct !== undefined && log.delta_price_pct !== 0 && (
                        <span className={`text-[10px] font-bold block ${log.delta_price_pct > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {log.delta_price_pct > 0 ? `+${log.delta_price_pct}%` : `${log.delta_price_pct}%`} vs Stima
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 text-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                          Snapshot Raccomandazione (Giorno 0)
                        </span>
                        <div className="text-slate-800 space-y-1">
                          <div>Azione: <strong>{log.system_recommended_action}</strong></div>
                          <div>Stima Target: <strong className="font-mono">€ {log.system_suggested_price.toLocaleString('it-IT')}</strong></div>
                          <div>Data Eval: <span className="font-mono text-[11px] text-slate-500">{new Date(log.evaluated_at).toLocaleString('it-IT')}</span></div>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                          Esito & Delta Umano
                        </span>
                        <div className="text-slate-800 space-y-1">
                          <div>Decisione: <strong>{log.agent_decision}</strong></div>
                          {log.rejection_category && (
                            <div className="text-rose-700 font-bold">
                              Causa: {log.rejection_category}
                            </div>
                          )}
                          <div>Data Delibera: <span className="font-mono text-[11px] text-slate-500">{new Date(log.created_at).toLocaleString('it-IT')}</span></div>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                          Note di Dominio dell'Agente
                        </span>
                        <p className="text-slate-600 italic">
                          "{log.agent_feedback_notes || 'Nessuna nota testuale specificata.'}"
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Consuntivazione Finale & Segregazione World Model */}
                    {finalRec ? (
                      <div className={`p-4 rounded-xl border space-y-3 ${
                        finalRec.attribution.biasCategory === 'ORGANIZATIONAL_INERTIA_BIAS'
                          ? 'bg-rose-50/50 border-rose-200'
                          : finalRec.attribution.biasCategory === 'WORLD_MODEL_RECALIBRATION'
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-emerald-50/50 border-emerald-200'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                              Step 3 Closed-Loop — Segregazione Attribuzione:
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              finalRec.attribution.biasCategory === 'ORGANIZATIONAL_INERTIA_BIAS'
                                ? 'bg-rose-100 text-rose-800'
                                : finalRec.attribution.biasCategory === 'WORLD_MODEL_RECALIBRATION'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {finalRec.attribution.biasCategory}
                            </span>
                          </div>

                          <div className="text-xs font-mono">
                            DOM Effettivo: <strong className="text-slate-900">{finalRec.totalDaysOnMarket} giorni</strong>
                          </div>
                        </div>

                        {/* Effort Metrics Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Risposta Lead</span>
                            <div className="font-bold text-slate-800 mt-0.5">
                              {finalRec.operativeEffort.avgLeadResponseHours} ore ({finalRec.operativeEffort.leadResponseScore.toFixed(2)})
                            </div>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Visite Condotte</span>
                            <div className="font-bold text-slate-800 mt-0.5">
                              {finalRec.operativeEffort.visitsConductedRatioPct}% ({finalRec.operativeEffort.visitCompletionScore.toFixed(2)})
                            </div>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Budget Marketing</span>
                            <div className="font-bold text-slate-800 mt-0.5">
                              {finalRec.operativeEffort.marketingBudgetUsedRatioPct}% ({finalRec.operativeEffort.marketingBudgetScore.toFixed(2)})
                            </div>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Effort Composite</span>
                            <div className={`font-bold mt-0.5 ${
                              finalRec.operativeEffort.classification === 'HIGH_EFFORT' ? 'text-emerald-700' :
                              finalRec.operativeEffort.classification === 'MODERATE_EFFORT' ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                              {finalRec.operativeEffort.compositeScore.toFixed(2)} ({finalRec.operativeEffort.classification})
                            </div>
                          </div>
                        </div>

                        {/* World Model Rule explanation */}
                        <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                          {finalRec.attribution.worldModelSterilized ? (
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold text-slate-900">
                              {finalRec.attribution.worldModelSterilized 
                                ? 'WORLD MODEL STERILIZZATO (Nessun Inquinamento Parametrico)' 
                                : 'WORLD MODEL RICALIBRATO (Adattamento Curve di Mercato)'}
                            </div>
                            <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                              {finalRec.attribution.worldModelSterilized
                                ? 'L’insuccesso commerciale è imputabile a inerzia operativa (Effort < 0.40). L’algoritmo NON riduce la stima di liquidità dell’asset, sterilizzando l’effetto del disallineamento organizzativo.'
                                : 'Con un effort operativo elevato (>= 0.70), il mercato ha oggettivamente respinto l’offerta. Il World Model aggiorna i coefficienti di elasticità e svaluta moderatamente il cluster micro-zonale.'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : log.attribution_bias_category ? (
                      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">Step 3 Consuntivato:</span>
                          <span className="font-mono font-bold text-slate-900">{log.attribution_bias_category}</span>
                          <span className="text-slate-500">• Effort Score: {log.operative_effort_score?.toFixed(2) ?? 'N/A'}</span>
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          {log.world_model_sterilized 
                            ? 'World Model Sterilizzato per inerzia agenziale.' 
                            : 'World Model Ricalibrato per evidenza empirica di mercato.'
                          }
                        </div>
                      </div>
                    ) : null}

                    {/* Degraded signals chips */}
                    {log.system_missing_signals && log.system_missing_signals.length > 0 && (
                      <div className="pt-2 flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          Segnali Mancanti Tracciati:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {log.system_missing_signals.map((sig, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-mono">
                              {sig}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
