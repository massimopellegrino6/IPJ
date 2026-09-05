import React, { useState } from 'react';
import { 
  Compass, 
  DollarSign, 
  Sparkles, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Filter,
  History,
  Check,
  XCircle,
  Edit3,
  Layers,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { DecisionTask, DecisionHistoryItem, PropertyItem, ActionScenario } from '../../types/intelligence';
import { ConfidenceBadge } from '../badges/ConfidenceBadge';
import { ActionScoreBadge } from '../badges/ActionScoreBadge';

interface DecisionCenterViewProps {
  tasks: DecisionTask[];
  history: DecisionHistoryItem[];
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
  onExecuteTask: (taskId: string, actionType: 'ACCEPTED' | 'MODIFIED' | 'DECLINED', notes?: string) => void;
}

type PipelineStage = 'Pending Review' | 'Decision Taken' | 'Executed' | 'Monitored' | 'Closed';

export const DecisionCenterView: React.FC<DecisionCenterViewProps> = ({
  tasks,
  history,
  properties,
  onSelectProperty,
  onExecuteTask
}) => {
  const [activeStage, setActiveStage] = useState<PipelineStage>('Pending Review');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedTaskForSimulation, setSelectedTaskForSimulation] = useState<DecisionTask | null>(tasks[0] || null);

  // Decline modal state
  const [decliningTaskId, setDecliningTaskId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('Vincoli del proprietario');

  // Modify modal state
  const [modifyingTaskId, setModifyingTaskId] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(315000);

  const stages: { stage: PipelineStage; count: number }[] = [
    { stage: 'Pending Review', count: tasks.length },
    { stage: 'Decision Taken', count: 3 },
    { stage: 'Executed', count: 8 },
    { stage: 'Monitored', count: 14 },
    { stage: 'Closed', count: history.length }
  ];

  const categories = [
    { id: 'ALL', label: 'Tutte le Tipologie' },
    { id: 'REPRICING', label: 'Revisioni Prezzo' },
    { id: 'ACQUISITION', label: 'Nuove Acquisizioni' },
    { id: 'CLIENT_MATCHING', label: 'Matching Acquirenti' },
    { id: 'STRATEGIC_REVIEW', label: 'Revisioni Strategiche' }
  ];

  const filteredTasks = tasks.filter((t) => {
    if (activeCategory === 'ALL') return true;
    return t.decisionType === activeCategory;
  });

  const selectedProperty = properties.find(p => p.id === selectedTaskForSimulation?.propertyId) || properties[0];

  // Scenarios for the simulation tool
  const currentPrice = selectedProperty.askingPrice;
  const scenarios = [
    {
      id: 'scen_a',
      name: 'Scenario A: Keep Price',
      targetPrice: currentPrice,
      priceDeltaPct: 0,
      saleProbability90d: selectedProperty.estimatedSaleProbability90d,
      timeToSaleDays: selectedProperty.estimatedTimeToSaleDays,
      estimatedRevenue: currentPrice * 0.03,
      actionScore: 54,
      unsoldRisk: 'ELEVATO (48%)',
      isRecommended: false
    },
    {
      id: 'scen_b',
      name: 'Scenario B: Reprice -5%',
      targetPrice: Math.round(currentPrice * 0.95),
      priceDeltaPct: -5,
      saleProbability90d: Math.min(95, selectedProperty.estimatedSaleProbability90d + 14),
      timeToSaleDays: Math.max(25, selectedProperty.estimatedTimeToSaleDays - 16),
      estimatedRevenue: Math.round(currentPrice * 0.95 * 0.03),
      actionScore: 78,
      unsoldRisk: 'MEDIO (26%)',
      isRecommended: false
    },
    {
      id: 'scen_c',
      name: 'Scenario C: Reprice -9.5% (Recommended)',
      targetPrice: Math.round(currentPrice * 0.905),
      priceDeltaPct: -9.5,
      saleProbability90d: 84,
      timeToSaleDays: 38,
      estimatedRevenue: Math.round(currentPrice * 0.905 * 0.03),
      actionScore: 92,
      unsoldRisk: 'BASSO (11%)',
      isRecommended: true
    },
    {
      id: 'scen_d',
      name: 'Scenario D: Aggressive -15%',
      targetPrice: Math.round(currentPrice * 0.85),
      priceDeltaPct: -15,
      saleProbability90d: 94,
      timeToSaleDays: 21,
      estimatedRevenue: Math.round(currentPrice * 0.85 * 0.03),
      actionScore: 75,
      unsoldRisk: 'MINIMO (4%)',
      isRecommended: false
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Governance & Decision Workflow
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Decision Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            “Quali decisioni dobbiamo prendere oggi?” Pipeline unificata da raccomandazione ad audit closed-loop.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Principio: <strong className="text-emerald-400 font-bold">AI recommends → Human decides → System learns.</strong>
        </div>
      </div>

      {/* 1. DECISION PIPELINE TABS */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-semibold gap-1">
        {stages.map((st) => (
          <button
            key={st.stage}
            onClick={() => setActiveStage(st.stage)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeStage === st.stage
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>{st.stage}</span>
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
              activeStage === st.stage ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-400'
            }`}>
              {st.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeStage === 'Pending Review' && (
        <div className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-slate-800 text-white border border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Decision Cards List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const prop = properties.find(p => p.id === task.propertyId) || properties[0];
              const isSelectedForSim = selectedTaskForSimulation?.id === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isSelectedForSim
                      ? 'bg-slate-950 border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-md'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Property & Issue/Trigger */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          task.priority === 'CRITICAL' ? 'bg-rose-950/30 text-rose-300 border-rose-500/40' :
                          task.priority === 'HIGH' ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">ID: {task.id}</span>
                      </div>

                      <h3
                        onClick={() => onSelectProperty(prop)}
                        className="text-lg font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{task.propertyTitle}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </h3>

                      <div className="text-xs text-slate-300 font-medium">
                        <strong className="text-slate-400">Issue / Trigger:</strong> {task.reason}
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-0.5">
                          AI Recommendation:
                        </span>
                        {task.recommendedAction}
                      </div>
                    </div>

                    {/* Middle: Expected Impact & Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 font-mono text-xs lg:w-80">
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block">Action Score</span>
                        <span className="text-emerald-400 font-bold text-sm block mt-0.5">{task.actionScore}/100</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block">Confidenza</span>
                        <span className="text-cyan-300 font-bold text-sm block mt-0.5">{task.confidence}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block">Expected Impact</span>
                        <span className="text-white font-bold text-xs block mt-0.5">{task.expectedImpact}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block">Deadline</span>
                        <span className="text-amber-400 font-bold text-xs block mt-0.5">{task.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedTaskForSimulation(task)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                        isSelectedForSim ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isSelectedForSim ? 'Simulatore Attivo Sotto' : 'Apri Simulatore Scenari'}</span>
                    </button>

                    {/* Human Decision Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onExecuteTask(task.id, 'ACCEPTED', 'Approvato senza modifiche')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>

                      <button
                        onClick={() => setModifyingTaskId(task.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Modify</span>
                      </button>

                      <button
                        onClick={() => setDecliningTaskId(task.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. SCENARIO ANALYSIS TOOL (INTEGRATO) */}
          {selectedTaskForSimulation && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                    Simulatore Scenari Integrato
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Simulazione per {selectedProperty.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trade-off evidente: <strong className="text-amber-300">“Più alto il prezzo → più basso il rating di liquidità → più lungo il tempo di vendita.”</strong>
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Prezzo Attuale: <strong className="text-white">€{currentPrice.toLocaleString()}</strong>
                </div>
              </div>

              {/* Scenarios Grid: A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scenarios.map((scen) => (
                  <div
                    key={scen.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      scen.isRecommended
                        ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{scen.name}</span>
                        {scen.isRecommended && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                            RACCOMANDATO
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-mono font-extrabold text-white">
                          €{scen.targetPrice.toLocaleString()}
                        </span>
                        <span className={`text-xs font-mono font-bold ${scen.priceDeltaPct < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {scen.priceDeltaPct === 0 ? 'Invariato' : `${scen.priceDeltaPct}%`}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Probabilità 90d:</span>
                          <span className="font-bold text-white">{scen.saleProbability90d}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tempo Vendita:</span>
                          <span className="font-bold text-white">{scen.timeToSaleDays} gg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ricavo Stimato:</span>
                          <span className="font-bold text-emerald-400">€{scen.estimatedRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rischio Invenduto:</span>
                          <span className={`font-bold ${scen.unsoldRisk.includes('ELEVATO') ? 'text-rose-400' : scen.unsoldRisk.includes('MEDIO') ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {scen.unsoldRisk}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 font-sans font-semibold">Action Score:</span>
                          <ActionScoreBadge score={scen.actionScore} isRecommended={scen.isRecommended} />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onExecuteTask(selectedTaskForSimulation.id, 'ACCEPTED', `Applicato ${scen.name}`)}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                        scen.isRecommended
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      Seleziona & Esegui
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monitored / Closed History View */}
      {(activeStage === 'Executed' || activeStage === 'Monitored' || activeStage === 'Closed') && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <h3 className="font-bold text-white text-sm">Registro Decisioni in Fase: {activeStage}</h3>
            <p className="text-slate-400">Tracciamento continuo dell'impatto economico e comportamentale delle decisioni deliberate.</p>
          </div>

          <div className="space-y-3">
            {history.map((hist) => (
              <div
                key={hist.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      hist.actionType === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300' :
                      hist.actionType === 'MODIFIED' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {hist.actionType}
                    </span>
                    <span className="font-bold text-white">{hist.propertyTitle}</span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    Deliberato da: {hist.decisionMaker} • Timestamp: {hist.timestamp}
                  </div>
                  {hist.notes && (
                    <div className="text-slate-300 text-[11px] mt-0.5 font-mono">
                      Note: "{hist.notes}"
                    </div>
                  )}
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">Stato Loop</span>
                  <span className="text-emerald-400 font-bold">{hist.outcomeStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {decliningTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Rifiuta Raccomandazione Decisionale</h3>
              <button onClick={() => setDecliningTaskId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Specifica la motivazione per il Registro di Audit e per l'apprendimento del modello:
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Vincoli del proprietario',
                'Giudizio professionale agente',
                'Strategia alternativa pianificata',
                'Nuove informazioni non a sistema',
                'Altro'
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                    declineReason === reason ? 'bg-slate-900 border-emerald-500 text-white' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReasonTask"
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
                onClick={() => setDecliningTaskId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onExecuteTask(decliningTaskId, 'DECLINED', declineReason);
                  setDecliningTaskId(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
              >
                Conferma Rifiuto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Price Modal */}
      {modifyingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Modifica Parametri Azione</h3>
              <button onClick={() => setModifyingTaskId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Prezzo Target Personalizzato (€):</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-white text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setModifyingTaskId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onExecuteTask(modifyingTaskId, 'MODIFIED', `Prezzo modificato a €${customPrice.toLocaleString()}`);
                  setModifyingTaskId(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Registra Modifica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
