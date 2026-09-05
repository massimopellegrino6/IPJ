import React, { useState } from 'react';
import { DecisionLogEntry } from '../types/proptech';
import { Database, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, Clock, Filter, Sparkles } from 'lucide-react';

interface DecisionLogHistoryProps {
  logs: DecisionLogEntry[];
}

export const DecisionLogHistory: React.FC<DecisionLogHistoryProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.agent_decision === filter;
  });

  const acceptedCount = logs.filter((l) => l.agent_decision === 'ACCEPTED').length;
  const overriddenCount = logs.filter((l) => l.agent_decision === 'OVERRIDDEN').length;
  const rejectedCount = logs.filter((l) => l.agent_decision === 'REJECTED').length;

  return (
    <div className="space-y-4 text-slate-900">
      {/* Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Telemetry & Human-in-the-Loop Audit Table</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Flywheel Decisionale: Tabella public.decision_log
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Ogni interazione cattura l'output algoritmico frozen e la decisione effettiva dell'agente.
            Questo dataset proprietario alimenta la ricalibrazione continua dei pesi e l'Active Learning.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['ALL', 'ACCEPTED', 'OVERRIDDEN', 'REJECTED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' && `Tutti (${logs.length})`}
              {f === 'ACCEPTED' && `Accettati (${acceptedCount})`}
              {f === 'OVERRIDDEN' && `Modificati (${overriddenCount})`}
              {f === 'REJECTED' && `Rifiutati (${rejectedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Decisioni Totali
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {logs.length}
          </div>
          <span className="text-[11px] text-slate-500">Record in database</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Tasso di Accettazione
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {logs.length > 0 ? Math.round((acceptedCount / logs.length) * 100) : 0}%
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

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Scartati / Rifiutati
          </span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono">
            {rejectedCount}
          </div>
          <span className="text-[11px] text-slate-500">Filtro rischi & difformità</span>
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
                      <div className="flex items-center space-x-2">
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
                        Prezzo Finale
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
                  <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 text-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                          Snapshot Raccomandazione
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
                          <div>Data Decisione: <span className="font-mono text-[11px] text-slate-500">{new Date(log.created_at).toLocaleString('it-IT')}</span></div>
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
