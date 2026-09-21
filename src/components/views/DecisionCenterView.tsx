import React, { useState, useRef } from 'react';
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
  TrendingUp,
  Info,
  BrainCircuit,
  Eye,
  Sliders,
  FileDown,
  Activity,
  Calendar,
  Zap,
  Tag,
  CheckCircle
} from 'lucide-react';
import { DecisionTask, DecisionHistoryItem, PropertyItem } from '../../types/intelligence';
import { ConfidenceBadge } from '../badges/ConfidenceBadge';
import { ActionScoreBadge } from '../badges/ActionScoreBadge';
import { SensitivityScenarioSimulator } from '../SensitivityScenarioSimulator';
import { useDecisionStore } from '../../context/DecisionStoreContext';
import { DecisionDivergenceCategory } from '../../types/decision';

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
  const { decisionLogs, recordDecision, downloadOwnerReport, emitSignal } = useDecisionStore();

  const [activeStage, setActiveStage] = useState<PipelineStage>('Pending Review');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedTaskForSimulation, setSelectedTaskForSimulation] = useState<DecisionTask | null>(tasks[0] || null);

  // Trojan horse feedback indicator
  const [downloadedAssetId, setDownloadedAssetId] = useState<string | null>(null);

  // Micro-chip fallback open state per task
  const [activeFallbackTaskId, setActiveFallbackTaskId] = useState<string | null>(null);
  const [selectedChipPerTask, setSelectedChipPerTask] = useState<Record<string, string>>({});

  // Simulation mode: Continuous Sliders vs Discrete Presets
  const [simMode, setSimMode] = useState<'SLIDERS' | 'PRESETS'>('SLIDERS');

  const simulatorRef = useRef<HTMLDivElement>(null);

  const handleOpenSimulation = (task: DecisionTask) => {
    setSelectedTaskForSimulation(task);
    setTimeout(() => {
      if (simulatorRef.current) {
        simulatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        document.getElementById('decision-scenario-simulator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleDownloadDossier = (prop: PropertyItem) => {
    downloadOwnerReport(prop);
    setDownloadedAssetId(prop.id);
    setTimeout(() => setDownloadedAssetId(null), 4000);
  };

  const stages: { stage: PipelineStage; count: number }[] = [
    { stage: 'Pending Review', count: tasks.length },
    { stage: 'Decision Taken', count: decisionLogs.length },
    { stage: 'Executed', count: decisionLogs.filter(l => l.observedHumanDecision.eventType !== 'IGNORED').length },
    { stage: 'Monitored', count: decisionLogs.filter(l => l.outcomeTracking.shortTermProxies.leadsDelta14d).length },
    { stage: 'Closed', count: decisionLogs.filter(l => l.outcomeTracking.finalOutcome?.closed).length + history.length }
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

  // Active Choice Scenarios for discrete simulator
  const currentPrice = selectedProperty.askingPrice;
  const discreteScenarios = [
    {
      id: 'scen_a',
      name: 'Scenario A: Raccomandazione AI',
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
      id: 'scen_b',
      name: 'Scenario B: Compromesso Venditore (-5%)',
      targetPrice: Math.round(currentPrice * 0.95),
      priceDeltaPct: -5.0,
      saleProbability90d: Math.min(95, selectedProperty.estimatedSaleProbability90d + 14),
      timeToSaleDays: Math.max(25, selectedProperty.estimatedTimeToSaleDays - 16),
      estimatedRevenue: Math.round(currentPrice * 0.95 * 0.03),
      actionScore: 78,
      unsoldRisk: 'MEDIO (26%)',
      isRecommended: false
    },
    {
      id: 'scen_c',
      name: 'Scenario C: Status Quo (Invariato)',
      targetPrice: currentPrice,
      priceDeltaPct: 0,
      saleProbability90d: selectedProperty.estimatedSaleProbability90d,
      timeToSaleDays: selectedProperty.estimatedTimeToSaleDays,
      estimatedRevenue: Math.round(currentPrice * 0.03),
      actionScore: 54,
      unsoldRisk: 'ELEVATO (48%)',
      isRecommended: false
    }
  ];

  const microChips = [
    { id: 'OWNER_CONSTRAINT', label: 'Vincolo Venditore', category: 'EXTERNAL_CONSTRAINT' as DecisionDivergenceCategory },
    { id: 'LOCAL_TREND', label: 'Trend Microzona Non Censito', category: 'MODEL_DISAGREEMENT' as DecisionDivergenceCategory },
    { id: 'PENDING_OFFER', label: 'Trattativa Riservata In Corso', category: 'COMMERCIAL_TIMING' as DecisionDivergenceCategory },
    { id: 'PREMIUM_FINISHES', label: 'Ristrutturazione Alto Pregio', category: 'INFORMATION_GAP' as DecisionDivergenceCategory }
  ];

  const handleApplyActiveChoice = (
    task: DecisionTask,
    prop: PropertyItem,
    scenarioKey: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C',
    appliedPrice: number,
    forcedCategory?: DecisionDivergenceCategory
  ) => {
    let eventType: 'ACCEPTED' | 'PARTIAL_PRICE_ADJUSTMENT' | 'ACTION_OVERRIDE' = 'ACCEPTED';
    if (scenarioKey === 'SCENARIO_B') eventType = 'PARTIAL_PRICE_ADJUSTMENT';
    if (scenarioKey === 'SCENARIO_C') eventType = 'ACTION_OVERRIDE';

    recordDecision({
      property: prop,
      eventType,
      appliedPrice,
      scenarioChosen: scenarioKey,
      forcedCategory
    });

    onExecuteTask(
      task.id,
      eventType === 'ACCEPTED' ? 'ACCEPTED' : eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? 'MODIFIED' : 'DECLINED',
      `Deliberato ${scenarioKey} a €${appliedPrice.toLocaleString()}`
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Behavioral Learning & Implicit Feedback (Product Thesis v1.0)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Decision Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            "Observe first. Ask only when necessary." Active Choice tri-scenario e tracciamento a doppio orizzonte temporale.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          Principio: <strong className="text-emerald-400 font-bold">AI recommends → Human decides → System learns.</strong>
        </div>
      </div>

      {/* 1. DECISION PIPELINE TABS */}
      <div className="flex items-center p-1.5 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-semibold gap-1">
        {stages.map((st) => (
          <button
            key={st.stage}
            onClick={() => setActiveStage(st.stage)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-slate-800 text-white border border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Decision Cards List with Active Choice Tri-Scenario */}
          <div className="space-y-6">
            {filteredTasks.map((task) => {
              const prop = properties.find(p => p.id === task.propertyId) || properties[0];
              const isSelectedForSim = selectedTaskForSimulation?.id === task.id;

              const propPrice = prop.askingPrice;
              const scenAPrice = Math.round(propPrice * 0.905); // -9.5%
              const scenBPrice = Math.round(propPrice * 0.95);  // -5.0%
              const scenCPrice = propPrice;                     // 0%

              const isFallbackOpen = activeFallbackTaskId === task.id;
              const chosenChip = selectedChipPerTask[task.id];

              return (
                <div
                  key={task.id}
                  className={`p-6 rounded-2xl border transition-all space-y-5 ${
                    isSelectedForSim
                      ? 'bg-slate-950 border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-md'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                        <span className="text-[10px] font-mono text-slate-400">• {prop.microzone}</span>
                      </div>

                      <h3
                        onClick={() => onSelectProperty(prop)}
                        className="text-lg font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{task.propertyTitle}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </h3>

                      <div className="text-xs text-slate-300 font-medium">
                        <strong className="text-slate-400">Trigger Operativo:</strong> {task.reason}
                      </div>
                    </div>

                    {/* Metrics Badge Group */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 font-mono text-xs lg:w-72">
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[9px] uppercase block">Action Score</span>
                        <span className="text-emerald-400 font-bold text-sm block">{task.actionScore}/100</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[9px] uppercase block">Confidenza</span>
                        <span className="text-cyan-300 font-bold text-sm block">{task.confidence}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[9px] uppercase block">Prezzo Attuale</span>
                        <span className="text-white font-bold text-xs block">€{propPrice.toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[9px] uppercase block">Scadenza</span>
                        <span className="text-amber-400 font-bold text-xs block">{task.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE CHOICE TRI-SCENARIO BAR */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Active Choice: Delibera Immediata a 1-Click</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Nessuna digitazione libera richiesta</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Scenario A: Raccomandato */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/50 flex flex-col justify-between space-y-3 relative group">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Scenario A: AI Optimal</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold">
                              Raccomandato
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-lg font-extrabold text-white">€{scenAPrice.toLocaleString()}</span>
                            <span className="text-emerald-400 text-xs font-bold">-9.5%</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono space-y-0.5 pt-1 border-t border-slate-800">
                            <div>P(60gg): <strong className="text-white">84%</strong> • Time: <strong className="text-white">38gg</strong></div>
                            <div>Action Score: <strong className="text-emerald-400">92/100</strong></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleApplyActiveChoice(task, prop, 'SCENARIO_A', scenAPrice)}
                          className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accetta Scenario A</span>
                        </button>
                      </div>

                      {/* Scenario B: Compromesso */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Scenario B: Compromesso</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase font-bold">
                              Margine Negoziazione
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-lg font-extrabold text-white">€{scenBPrice.toLocaleString()}</span>
                            <span className="text-cyan-300 text-xs font-bold">-5.0%</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono space-y-0.5 pt-1 border-t border-slate-800">
                            <div>P(60gg): <strong className="text-white">58%</strong> • Time: <strong className="text-white">52gg</strong></div>
                            <div>Action Score: <strong className="text-cyan-300">76/100</strong></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleApplyActiveChoice(task, prop, 'SCENARIO_B', scenBPrice, 'EXTERNAL_CONSTRAINT')}
                          className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Applica Compromesso (-5%)</span>
                        </button>
                      </div>

                      {/* Scenario C: Status Quo */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Scenario C: Status Quo</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 uppercase font-bold">
                              Rischio Invenduto
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-lg font-extrabold text-white">€{scenCPrice.toLocaleString()}</span>
                            <span className="text-slate-400 text-xs font-bold">Invariato</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono space-y-0.5 pt-1 border-t border-slate-800">
                            <div>P(60gg): <strong className="text-rose-400">32%</strong> • Time: <strong className="text-white">110gg</strong></div>
                            <div>Action Score: <strong className="text-rose-400">48/100</strong></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleApplyActiveChoice(task, prop, 'SCENARIO_C', scenCPrice, 'COMMERCIAL_TIMING')}
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mantieni Status Quo</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Utility Bar (Trojan Horse Button & Simulator Trigger) */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Trojan Horse Button: Genera Dossier Proprietario */}
                      <button
                        onClick={() => handleDownloadDossier(prop)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>
                          {downloadedAssetId === prop.id
                            ? 'Dossier Scaricato (Segnale Registrato!)'
                            : 'Genera Report Negoziazione per Proprietario'}
                        </span>
                      </button>

                      {/* Micro-chip Fallback Trigger */}
                      <button
                        onClick={() => setActiveFallbackTaskId(isFallbackOpen ? null : task.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {isFallbackOpen ? 'Nascondi Micro-Chip' : 'Motivazione 1-Tap...'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenSimulation(task)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelectedForSim ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isSelectedForSim ? 'Simulatore Attivo Sotto' : 'Apri Slider di Sensibilità'}</span>
                    </button>
                  </div>

                  {/* Micro-Chip Fallback Row (1-Tap, No Forms) */}
                  {isFallbackOpen && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Micro-chip Fallback (Minimum Necessary Feedback):</span>
                        <span className="text-emerald-400">Aggiorna la motivazione inferita con 1 solo tap</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {microChips.map((chip) => (
                          <button
                            key={chip.id}
                            onClick={() => {
                              setSelectedChipPerTask({ ...selectedChipPerTask, [task.id]: chip.id });
                              emitSignal(prop.id, 'CRM_OBJECTION_LOGGED', { chipLabel: chip.label });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                              chosenChip === chip.id
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 2. SCENARIO ANALYSIS TOOL (INTEGRATO CON SLIDER v1.0) */}
          {selectedTaskForSimulation && (
            <div ref={simulatorRef} id="decision-scenario-simulator" className="space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Modalità Simulazione Decisionale:</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setSimMode('SLIDERS')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      simMode === 'SLIDERS' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Slider Sensibilità Dinamico (v1.0)
                  </button>
                  <button
                    onClick={() => setSimMode('PRESETS')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      simMode === 'PRESETS' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Scenari Discreti (A, B, C)
                  </button>
                </div>
              </div>

              {simMode === 'SLIDERS' ? (
                <SensitivityScenarioSimulator
                  property={selectedProperty}
                  onApplyScenario={(customP, timeH, inferred) => {
                    onExecuteTask(
                      selectedTaskForSimulation.id,
                      'MODIFIED',
                      `Adottato via slider continuo: €${customP.toLocaleString()} (${timeH}gg) — ${inferred}`
                    );
                  }}
                />
              ) : (
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

                  {/* Scenarios Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {discreteScenarios.map((scen) => (
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
                            <div className="flex justify-between pt-1 border-t border-slate-800/60">
                              <span className="text-slate-400 font-sans font-semibold">Action Score:</span>
                              <ActionScoreBadge score={scen.actionScore} isRecommended={scen.isRecommended} />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            handleApplyActiveChoice(
                              selectedTaskForSimulation,
                              selectedProperty,
                              scen.id === 'scen_a' ? 'SCENARIO_A' : scen.id === 'scen_b' ? 'SCENARIO_B' : 'SCENARIO_C',
                              scen.targetPrice
                            );
                          }}
                          className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
        </div>
      )}

      {/* 3. AUDIT LOG & CLOSED-LOOP TELEMETRY (Stages: Decision Taken, Executed, Monitored, Closed) */}
      {(activeStage === 'Decision Taken' || activeStage === 'Executed' || activeStage === 'Monitored' || activeStage === 'Closed') && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Behavioral Telemetry & Closed-Loop Audit Table</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Registro Decisionale Unificato — Fase: {activeStage}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracciamento closed-loop: Fatto Certo Osservato → Motivazione Inferita → Segnali Comportamentali → Proxy 14-21gg vs Target 90gg.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-right">
                <span className="text-[9px] uppercase text-slate-400 block">Record nel Log</span>
                <span className="text-emerald-400 font-bold text-base">{decisionLogs.length}</span>
              </div>
            </div>
          </div>

          {/* Table / Cards of Decision Logs */}
          <div className="space-y-4">
            {decisionLogs.map((log) => {
              const hasProxies = Boolean(log.outcomeTracking.shortTermProxies?.leadsDelta14d);
              const isFinal = Boolean(log.outcomeTracking.finalOutcome?.closed);

              return (
                <div
                  key={log.eventId}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs font-mono"
                >
                  {/* Top Bar: Status, Asset, Broker, Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.observedHumanDecision.eventType === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        log.observedHumanDecision.eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {log.observedHumanDecision.eventType}
                      </span>
                      <span className="font-bold text-white text-sm font-sans">{log.decisionContext.propertyTitle}</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Broker: <strong className="text-white">{log.decisionContext.agentId}</strong> • Timestamp: {log.timestamp}
                    </div>
                  </div>

                  {/* 3 Pillars Grid: 1. Fatto Osservato, 2. Motivazione Inferita, 3. Segnali Comportamentali */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Pillar 1: Fatto Osservato */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">
                        1. Fatto Certo Osservato
                      </span>
                      <div className="text-white font-bold">
                        Prezzo Applicato: €{log.observedHumanDecision.appliedPrice.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Raccomandato: €{log.recommendationIssued.recommendedPrice.toLocaleString()} 
                        <span className={`ml-1 font-bold ${log.observedHumanDecision.deltaVsRecommendation === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          ({log.observedHumanDecision.deltaVsRecommendation === 0 ? 'Allineato' : `+€${log.observedHumanDecision.deltaVsRecommendation.toLocaleString()}`})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Scenario: {log.observedHumanDecision.scenarioChosen || 'SCENARIO_A'}
                      </div>
                    </div>

                    {/* Pillar 2: Motivazione Inferita */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 block font-sans">
                        2. Motivazione Inferita (Bayesiana)
                      </span>
                      <div className="text-emerald-300 font-bold">
                        {log.inferredMotivation.primaryCategory}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sottocategoria: <strong className="text-white">{log.inferredMotivation.subCategory || 'N/A'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Confidenza: <strong>{Math.round(log.inferredMotivation.confidenceScore * 100)}%</strong></span>
                        <span className="text-cyan-300 font-bold uppercase">[{log.inferredMotivation.status}]</span>
                      </div>
                    </div>

                    {/* Pillar 3: Segnali Comportamentali Asincroni */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-cyan-400 block font-sans">
                        3. Segnali Comportamentali
                      </span>
                      {log.behavioralSignals.length === 0 ? (
                        <span className="text-slate-500 text-[11px] block">Nessun segnale estraneo</span>
                      ) : (
                        <div className="space-y-1">
                          {log.behavioralSignals.map((sig, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                              <span className="font-bold text-cyan-300">{sig.signalType}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dual Horizon Outcome Strip */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-sans font-bold text-[10px] uppercase">Outcome Dual-Horizon:</span>
                      
                      {hasProxies && (
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                            PROXY 14GG
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Leads: {log.outcomeTracking.shortTermProxies.leadsDelta14d}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-white">
                            Visite: {log.outcomeTracking.shortTermProxies.visitsScheduled14d}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-300">
                            Prezzo: {log.outcomeTracking.shortTermProxies.priceFeedbackSummary}
                          </span>
                        </div>
                      )}
                    </div>

                    {isFinal ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Rogito Chiuso a €{log.outcomeTracking.finalOutcome?.salePrice?.toLocaleString()} ({log.outcomeTracking.finalOutcome?.daysOnMarketTotal}gg totali)</span>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-mono text-[10px]">
                        Target 90gg in monitoraggio attivo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
