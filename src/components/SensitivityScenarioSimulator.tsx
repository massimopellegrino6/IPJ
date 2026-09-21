import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle,
  BrainCircuit,
  Eye,
  CheckCircle2,
  HelpCircle,
  Layers,
  FileDown,
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import { PropertyItem } from '../types/intelligence';
import { useDecisionStore } from '../context/DecisionStoreContext';
import { DecisionDivergenceCategory } from '../types/decision';

interface SensitivityScenarioSimulatorProps {
  property: PropertyItem;
  onApplyScenario?: (customPrice: number, timeHorizonDays: number, inferredMotivation?: string) => void;
  compact?: boolean;
}

export const SensitivityScenarioSimulator: React.FC<SensitivityScenarioSimulatorProps> = ({
  property,
  onApplyScenario,
  compact = false
}) => {
  const { emitSignal, downloadOwnerReport, recordDecision } = useDecisionStore();

  const basePrice = property.askingPrice;
  const fairValue = property.estimatedFairValue || basePrice * 0.92;

  // Sliders state
  const [priceSlider, setPriceSlider] = useState<number>(Math.round(basePrice * 0.93)); // default ~ -7%
  const [timeHorizonDays, setTimeHorizonDays] = useState<number>(60);
  const [isManipulated, setIsManipulated] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DUAL_HORIZON' | 'BAYESIAN_PRIOR'>('DUAL_HORIZON');

  // Dynamic simulation calculations
  const simulation = useMemo(() => {
    const deltaEuro = priceSlider - basePrice;
    const deltaPct = Number(((deltaEuro / basePrice) * 100).toFixed(1));
    const deltaFairValuePct = Number((((priceSlider - fairValue) / fairValue) * 100).toFixed(1));

    // Sigmoid elasticity
    const priceRatio = priceSlider / fairValue;
    let baseProbability = 50;
    if (priceRatio <= 0.85) baseProbability = 95;
    else if (priceRatio <= 0.90) baseProbability = 88;
    else if (priceRatio <= 0.95) baseProbability = 78;
    else if (priceRatio <= 1.00) baseProbability = 66;
    else if (priceRatio <= 1.05) baseProbability = 48;
    else if (priceRatio <= 1.10) baseProbability = 32;
    else baseProbability = 18;

    const timeRatio = timeHorizonDays / 60;
    const adjustedProbability = Math.min(98, Math.max(8, Math.round(baseProbability * Math.pow(timeRatio, 0.4))));

    let estimatedDays = Math.round(45 * Math.pow(priceRatio, 1.8) * (60 / timeHorizonDays));
    estimatedDays = Math.min(180, Math.max(15, estimatedDays));

    const realizationWeight = 0.55;
    const probabilityWeight = 0.45;
    const realizationComponent = Math.min(100, Math.max(20, (priceSlider / basePrice) * 90));
    const probabilityComponent = adjustedProbability;
    const rawActionScore = Math.round(realizationComponent * realizationWeight + probabilityComponent * probabilityWeight);
    const actionScore = Math.min(97, Math.max(25, rawActionScore));

    let dynamicConfidence = property.ratingConfidence || 88;
    if (Math.abs(deltaFairValuePct) > 12) {
      dynamicConfidence = Math.max(55, dynamicConfidence - 8);
    }

    // 14-21d Short-term Proxy metrics estimations
    let proxy14dLeadsDelta = '+0%';
    let proxy14dVisits = 1;
    let proxy14dFeedback: 'FAIR' | 'EXCESSIVE' | 'COMPETITIVE' = 'FAIR';
    let proxy14dCtr = '+0%';

    if (deltaPct <= -8) {
      proxy14dLeadsDelta = '+48%';
      proxy14dVisits = 5;
      proxy14dFeedback = 'COMPETITIVE';
      proxy14dCtr = '+38%';
    } else if (deltaPct < -3) {
      proxy14dLeadsDelta = '+24%';
      proxy14dVisits = 3;
      proxy14dFeedback = 'FAIR';
      proxy14dCtr = '+18%';
    } else if (deltaPct === 0) {
      proxy14dLeadsDelta = '-4%';
      proxy14dVisits = 1;
      proxy14dFeedback = 'EXCESSIVE';
      proxy14dCtr = '-2%';
    } else {
      proxy14dLeadsDelta = '-22%';
      proxy14dVisits = 0;
      proxy14dFeedback = 'EXCESSIVE';
      proxy14dCtr = '-15%';
    }

    // Inferred Implicit Signal
    let implicitSignal = '';
    let inferredCategory: DecisionDivergenceCategory = 'STRATEGIC_PREFERENCE';
    let probabilityDistribution = {
      EXTERNAL_CONSTRAINT: 0.15,
      MODEL_DISAGREEMENT: 0.20,
      STRATEGIC_PREFERENCE: 0.40,
      COMMERCIAL_TIMING: 0.15,
      INFORMATION_GAP: 0.05,
      UNKNOWN: 0.05
    };

    if (deltaPct <= -10) {
      inferredCategory = 'STRATEGIC_PREFERENCE';
      implicitSignal = 'Priorità strategica: Massima liquidità e azzeramento time-to-sale (rotazione portafoglio rapida).';
      probabilityDistribution = {
        EXTERNAL_CONSTRAINT: 0.10,
        MODEL_DISAGREEMENT: 0.08,
        STRATEGIC_PREFERENCE: 0.74,
        COMMERCIAL_TIMING: 0.04,
        INFORMATION_GAP: 0.02,
        UNKNOWN: 0.02
      };
    } else if (deltaPct < 0 && deltaPct > -7) {
      inferredCategory = 'EXTERNAL_CONSTRAINT';
      implicitSignal = 'Strategia di mediazione prudente: gestione della rigidità del venditore con ribasso parziale.';
      probabilityDistribution = {
        EXTERNAL_CONSTRAINT: 0.72,
        MODEL_DISAGREEMENT: 0.12,
        COMMERCIAL_TIMING: 0.08,
        INFORMATION_GAP: 0.04,
        STRATEGIC_PREFERENCE: 0.02,
        UNKNOWN: 0.02
      };
    } else if (deltaPct >= 0) {
      inferredCategory = 'EXTERNAL_CONSTRAINT';
      implicitSignal = 'Vincolo esterno rigido o aspettativa speculativa del cliente venditore (Status Quo).';
      probabilityDistribution = {
        EXTERNAL_CONSTRAINT: 0.86,
        MODEL_DISAGREEMENT: 0.05,
        COMMERCIAL_TIMING: 0.05,
        INFORMATION_GAP: 0.02,
        STRATEGIC_PREFERENCE: 0.01,
        UNKNOWN: 0.01
      };
    } else {
      inferredCategory = 'STRATEGIC_PREFERENCE';
      implicitSignal = 'Punto di equilibrio ottimale stimato dal modello decisionale.';
    }

    const estimatedCommission = Math.round(priceSlider * 0.03);

    return {
      deltaEuro,
      deltaPct,
      deltaFairValuePct,
      adjustedProbability,
      estimatedDays,
      actionScore,
      dynamicConfidence,
      implicitSignal,
      inferredCategory,
      probabilityDistribution,
      estimatedCommission,
      proxy14d: {
        leadsDelta: proxy14dLeadsDelta,
        visits: proxy14dVisits,
        feedback: proxy14dFeedback,
        ctr: proxy14dCtr
      }
    };
  }, [priceSlider, timeHorizonDays, basePrice, fairValue, property.ratingConfidence]);

  const handleSliderRelease = () => {
    emitSignal(property.id, 'SLIDER_TOLERANCE_TEST', {
      testedPrice: priceSlider,
      deltaPct: simulation.deltaPct,
      timeHorizonDays,
      actionScore: simulation.actionScore
    });
  };

  const handleDownloadDossier = () => {
    downloadOwnerReport(property);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleApply = () => {
    recordDecision({
      property,
      eventType: simulation.deltaPct === 0 ? 'ACTION_OVERRIDE' : 'PARTIAL_PRICE_ADJUSTMENT',
      appliedPrice: priceSlider,
      scenarioChosen: 'CUSTOM_SLIDER',
      forcedCategory: simulation.inferredCategory
    });

    if (onApplyScenario) {
      onApplyScenario(priceSlider, timeHorizonDays, simulation.implicitSignal);
    }
  };

  const minPriceRange = Math.round(basePrice * 0.75);
  const maxPriceRange = Math.round(basePrice * 1.10);

  return (
    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Sensitivity Scenario Simulator & Behavioral Signal Capture</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                v1.0 Implicit
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Manipolazione continua: ogni rilascio registra un segnale <code className="text-cyan-300 font-mono">SLIDER_TOLERANCE_TEST</code> e proietta il doppio orizzonte temporale.
            </p>
          </div>
        </div>

        {/* Trojan Horse Button */}
        <button
          onClick={handleDownloadDossier}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>{downloadSuccess ? 'Dossier Scaricato!' : 'Scarica Dossier Proprietario (Trojan Horse)'}</span>
        </button>
      </div>

      {/* Interactive Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        {/* Slider 1: Prezzo Target */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prezzo Target Simulato</span>
            </label>
            <div className="text-right font-mono">
              <span className="text-base font-bold text-white">€{priceSlider.toLocaleString()}</span>
              <span className={`ml-2 text-xs font-bold ${simulation.deltaPct < 0 ? 'text-emerald-400' : simulation.deltaPct > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {simulation.deltaPct > 0 ? `+${simulation.deltaPct}%` : `${simulation.deltaPct}%`}
              </span>
            </div>
          </div>

          <input
            type="range"
            min={minPriceRange}
            max={maxPriceRange}
            step={1000}
            value={priceSlider}
            onChange={(e) => {
              setPriceSlider(Number(e.target.value));
              setIsManipulated(true);
            }}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: €{minPriceRange.toLocaleString()} (-25%)</span>
            <span className="text-slate-400">Richiesta Base: €{basePrice.toLocaleString()}</span>
            <span>Max: €{maxPriceRange.toLocaleString()} (+10%)</span>
          </div>
        </div>

        {/* Slider 2: Orizzonte Temporale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Orizzonte Temporale Target</span>
            </label>
            <div className="text-right font-mono">
              <span className="text-base font-bold text-cyan-300">{timeHorizonDays} giorni</span>
              <span className="ml-1 text-[11px] text-slate-400">
                ({timeHorizonDays <= 30 ? 'Rotazione Rapida' : timeHorizonDays <= 60 ? 'Standard' : 'Esteso'})
              </span>
            </div>
          </div>

          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={timeHorizonDays}
            onChange={(e) => {
              setTimeHorizonDays(Number(e.target.value));
              setIsManipulated(true);
            }}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>15 gg (Alta Rotazione)</span>
            <span>60 gg (Finestra Ottimale)</span>
            <span>120 gg (Inerzia Tollerata)</span>
          </div>
        </div>
      </div>

      {/* DUAL HORIZON TRACKING STRIP (14-21gg Proxy vs 60-90gg Target) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Doppio Orizzonte di Misurazione (Dual-Horizon Impact)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Section 5.4 · Closed-Loop Flywheel</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* HORIZON 1: Short-term Proxy (14-21 Giorni) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Orizzonte 1: Proxy di Breve Termine (14–21gg)</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-bold">
                Early Feedback
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Richieste Lead</span>
                <span className={`text-base font-extrabold ${simulation.proxy14d.leadsDelta.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulation.proxy14d.leadsDelta}
                </span>
                <span className="text-[9px] text-slate-500 block">su portali</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Visite 14gg</span>
                <span className="text-base font-extrabold text-white">
                  {simulation.proxy14d.visits} <span className="text-[10px] font-normal text-slate-400">visite</span>
                </span>
                <span className="text-[9px] text-slate-500 block">attese in agenda</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">CTR Annuncio</span>
                <span className={`text-base font-extrabold ${simulation.proxy14d.ctr.startsWith('+') ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {simulation.proxy14d.ctr}
                </span>
                <span className="text-[9px] text-slate-500 block">click-through</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Sentiment prezzo acquirenti:</span>
              <span className={`font-mono font-bold ${
                simulation.proxy14d.feedback === 'COMPETITIVE' ? 'text-emerald-400' :
                simulation.proxy14d.feedback === 'FAIR' ? 'text-cyan-300' : 'text-rose-400'
              }`}>
                {simulation.proxy14d.feedback === 'COMPETITIVE' ? 'MOLTO COMPETITIVO' :
                 simulation.proxy14d.feedback === 'FAIR' ? 'ALLINEATO AL MERCATO' : 'FUORI MERCATO / DISALLINEATO'}
              </span>
            </div>
          </div>

          {/* HORIZON 2: Final Target Outcome (60-90 Giorni) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Orizzonte 2: Target Finale di Portafoglio (60–90gg)</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">
                Final Outcome
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Action Score</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {simulation.actionScore}
                  <span className="text-[10px] text-slate-400">/100</span>
                </span>
                <span className="text-[9px] text-slate-500 block">ottimizzazione</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">P(Vendita {timeHorizonDays}d)</span>
                <span className="text-base font-extrabold text-cyan-300">
                  {simulation.adjustedProbability}%
                </span>
                <span className="text-[9px] text-slate-500 block">prob. rogito</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Provvigione 3%</span>
                <span className="text-base font-extrabold text-amber-300">
                  €{simulation.estimatedCommission.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 block">ricavo agenzia</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Tempo stimato al rogito:</span>
              <span className="font-mono font-bold text-white">
                {simulation.estimatedDays} giorni (vs {property.agencyFit?.historicalTimeToSaleDays || 55}gg medi)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Implicit Signal & Inferred Motivation Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              Segnale Comportamentale Estratto Automaticamente
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-semibold">
            Observe First · Zero Invasività
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          "{simulation.implicitSignal}"
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-400">
            Inferenza assegnata al log: <strong className="text-white font-mono">{simulation.inferredCategory}</strong> (Confidenza: {Math.round(simulation.probabilityDistribution.EXTERNAL_CONSTRAINT * 100)}%)
          </div>

          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Adotta Scenario (€{priceSlider.toLocaleString()}) & Registra Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
