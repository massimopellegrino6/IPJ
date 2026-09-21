import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  FileDown, 
  BrainCircuit, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { PropertyItem, ActionScenario } from '../types/intelligence';
import { useDecisionStore } from '../context/DecisionStoreContext';
import { DecisionDivergenceCategory } from '../types/decision';

interface HumanDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyItem;
  scenario: ActionScenario;
  onConfirmDecision: (type: 'ACCEPTED' | 'MODIFIED' | 'DECLINED', reason: string, customPrice?: number) => void;
}

export const HumanDecisionModal: React.FC<HumanDecisionModalProps> = ({
  isOpen,
  onClose,
  property,
  scenario,
  onConfirmDecision
}) => {
  const { recordDecision, downloadOwnerReport, emitSignal } = useDecisionStore();

  const currentPrice = property.askingPrice;
  const recommendedPrice = scenario.targetPrice;
  const compromisePrice = Math.round(currentPrice * 0.95);

  // Active Choice: Scenario A (Recommended), Scenario B (Compromise), Scenario C (Status Quo), Custom
  const [chosenScenario, setChosenScenario] = useState<'A' | 'B' | 'C' | 'CUSTOM'>('A');
  const [customPrice, setCustomPrice] = useState<number>(scenario.targetPrice);
  const [selectedMicroChip, setSelectedMicroChip] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Active choice scenario specifications
  const scenarios = {
    A: {
      id: 'A',
      title: 'Scenario A: Raccomandazione AI (Ottimale)',
      price: recommendedPrice,
      deltaPct: Number((((recommendedPrice - currentPrice) / currentPrice) * 100).toFixed(1)),
      prob60d: 78,
      actionScore: scenario.actionScore || 88,
      inferredCategory: 'STRATEGIC_PREFERENCE' as DecisionDivergenceCategory,
      badge: 'RACCOMANDATO',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    B: {
      id: 'B',
      title: 'Scenario B: Compromesso Morbido (-5%)',
      price: compromisePrice,
      deltaPct: -5.0,
      prob60d: 54,
      actionScore: 72,
      inferredCategory: 'EXTERNAL_CONSTRAINT' as DecisionDivergenceCategory,
      badge: 'COMPROMESSO VENDITORE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    C: {
      id: 'C',
      title: 'Scenario C: Status Quo (Mantieni Invariato)',
      price: currentPrice,
      deltaPct: 0,
      prob60d: 28,
      actionScore: 45,
      inferredCategory: 'COMMERCIAL_TIMING' as DecisionDivergenceCategory,
      badge: 'ALTO RISCHIO INVENDUTO',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }
  };

  const microChips = [
    { id: 'OWNER_RIGIDITY', label: 'Vincolo Venditore', category: 'EXTERNAL_CONSTRAINT' as DecisionDivergenceCategory },
    { id: 'PEER_MISMATCH', label: 'Dati Comparabili Errati', category: 'MODEL_DISAGREEMENT' as DecisionDivergenceCategory },
    { id: 'TIMING_DELAY', label: 'Attendo Esito Proposta', category: 'COMMERCIAL_TIMING' as DecisionDivergenceCategory },
    { id: 'MARGIN_PREFERENCE', label: 'Priorità Margine vs Velocità', category: 'STRATEGIC_PREFERENCE' as DecisionDivergenceCategory }
  ];

  const handleDownloadDossier = () => {
    downloadOwnerReport(property);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleExecute = () => {
    let appliedP = recommendedPrice;
    let eventType: 'ACCEPTED' | 'PARTIAL_PRICE_ADJUSTMENT' | 'ACTION_OVERRIDE' = 'ACCEPTED';
    let chosenKey: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'CUSTOM_SLIDER' = 'SCENARIO_A';
    let forcedCategory: DecisionDivergenceCategory | undefined = undefined;

    if (chosenScenario === 'A') {
      appliedP = scenarios.A.price;
      eventType = 'ACCEPTED';
      chosenKey = 'SCENARIO_A';
    } else if (chosenScenario === 'B') {
      appliedP = scenarios.B.price;
      eventType = 'PARTIAL_PRICE_ADJUSTMENT';
      chosenKey = 'SCENARIO_B';
      forcedCategory = 'EXTERNAL_CONSTRAINT';
    } else if (chosenScenario === 'C') {
      appliedP = scenarios.C.price;
      eventType = 'ACTION_OVERRIDE';
      chosenKey = 'SCENARIO_C';
      forcedCategory = 'COMMERCIAL_TIMING';
    } else {
      appliedP = customPrice;
      eventType = 'PARTIAL_PRICE_ADJUSTMENT';
      chosenKey = 'CUSTOM_SLIDER';
      if (selectedMicroChip) {
        const chip = microChips.find((c) => c.id === selectedMicroChip);
        if (chip) forcedCategory = chip.category;
      }
    }

    recordDecision({
      property,
      eventType,
      appliedPrice: appliedP,
      scenarioChosen: chosenKey,
      forcedCategory
    });

    const actionText = eventType === 'ACCEPTED' ? 'Accettato Scenario A' : eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? `Applicato riallineamento a €${appliedP.toLocaleString()}` : 'Mantenuto Status Quo';
    onConfirmDecision(eventType === 'ACCEPTED' ? 'ACCEPTED' : eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? 'MODIFIED' : 'DECLINED', actionText, appliedP);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Active Choice & Feedback Implicito (Product Thesis v1.0)</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Delibera Strategica per {property.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prezzo attuale a catalogo: <strong className="text-white font-mono">€{currentPrice.toLocaleString()}</strong> ({property.microzone})
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Active Choice Tri-Scenario Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Scegli Scenario d'Azione (Active Choice)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Zero Form Invasivi</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Scenario A */}
              <div
                onClick={() => setChosenScenario('A')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  chosenScenario === 'A'
                    ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{scenarios.A.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${scenarios.A.badgeColor}`}>
                      {scenarios.A.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-lg font-extrabold text-white">€{scenarios.A.price.toLocaleString()}</span>
                    <span className="text-emerald-400 font-bold">{scenarios.A.deltaPct}%</span>
                    <span className="text-slate-400 text-[11px] ml-2">P(60d): <strong className="text-white">{scenarios.A.prob60d}%</strong></span>
                    <span className="text-slate-400 text-[11px] ml-2">Score: <strong className="text-emerald-400">{scenarios.A.actionScore}/100</strong></span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  chosenScenario === 'A' ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Scenario B */}
              <div
                onClick={() => setChosenScenario('B')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  chosenScenario === 'B'
                    ? 'bg-cyan-950/30 border-cyan-500 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{scenarios.B.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${scenarios.B.badgeColor}`}>
                      {scenarios.B.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-lg font-extrabold text-white">€{scenarios.B.price.toLocaleString()}</span>
                    <span className="text-cyan-300 font-bold">{scenarios.B.deltaPct}%</span>
                    <span className="text-slate-400 text-[11px] ml-2">P(60d): <strong className="text-white">{scenarios.B.prob60d}%</strong></span>
                    <span className="text-slate-400 text-[11px] ml-2">Score: <strong className="text-cyan-300">{scenarios.B.actionScore}/100</strong></span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  chosenScenario === 'B' ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Scenario C */}
              <div
                onClick={() => setChosenScenario('C')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  chosenScenario === 'C'
                    ? 'bg-rose-950/30 border-rose-500 ring-1 ring-rose-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{scenarios.C.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${scenarios.C.badgeColor}`}>
                      {scenarios.C.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-lg font-extrabold text-white">€{scenarios.C.price.toLocaleString()}</span>
                    <span className="text-slate-400 font-bold">Invariato</span>
                    <span className="text-slate-400 text-[11px] ml-2">P(60d): <strong className="text-rose-400">{scenarios.C.prob60d}%</strong></span>
                    <span className="text-slate-400 text-[11px] ml-2">Score: <strong className="text-rose-400">{scenarios.C.actionScore}/100</strong></span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  chosenScenario === 'C' ? 'bg-rose-500 border-rose-400 text-slate-950' : 'border-slate-700 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          {/* Trojan Horse Feature: Download Owner Negotiation Dossier */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <FileDown className="w-4 h-4" />
                <span>Trojan Horse · Strumento di Supporto per il Broker</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Scarica il Dossier di Congruità con comparabili reali per convincere il proprietario.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadDossier}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'Dossier Scaricato!' : 'Scarica Dossier PDF'}</span>
            </button>
          </div>

          {/* Micro-chip Fallback: Solamente se l'operatore sceglie Status Quo o vuole rettificare */}
          {(chosenScenario === 'C' || chosenScenario === 'B') && (
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Micro-chip Fallback (1-Tap opzionale, nessun testo richiesto):</span>
                <span className="text-emerald-400 font-bold">Minimum Necessary Feedback</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {microChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedMicroChip(selectedMicroChip === chip.id ? null : chip.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                      selectedMicroChip === chip.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bayesian Observation Principle */}
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Inferenza: P(OWNER_CONSTRAINT) aggiornata automaticamente dai comportamenti.</span>
            <span className="text-emerald-400 font-bold">Flywheel v1.0</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Registra Decisione Active Choice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
