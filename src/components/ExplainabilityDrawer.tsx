import React from 'react';
import { X, CheckCircle2, AlertCircle, Database, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { PropertyItem, SubDimension } from '../types/intelligence';

interface ExplainabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyItem;
  selectedDimensionKey?: string | null;
  selectedSubDimension?: SubDimension | null;
  onNavigateToMethodology?: () => void;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({
  isOpen,
  onClose,
  property,
  selectedDimensionKey,
  selectedSubDimension,
  onNavigateToMethodology
}) => {
  if (!isOpen) return null;

  // Find dimension details
  const dimension = property.dimensions.find(d => d.key === selectedDimensionKey) || property.dimensions[5]; // Default to economics
  const targetSub = selectedSubDimension || dimension.subDimensions[0];

  // Specific evidence data tailored for the clicked item
  const isEconomicsOrPrice = dimension.key === 'economics' || targetSub.name.toLowerCase().includes('price');

  const evidence = {
    dimensionName: `${dimension.name} → ${targetSub.name}`,
    score: targetSub.score,
    confidence: property.ratingConfidence,
    askingPrice: property.askingPrice,
    estimatedFairValue: property.estimatedFairValue,
    differencePct: property.priceDifferencePct,
    comparablesCount: 18,
    verifiedTransactions: 11,
    medianComparablePriceSqm: 4120,
    propertyPriceSqm: Math.round(property.askingPrice / property.squareMeters),
    dataFreshnessDays: 12,
    modelVersion: 'Modello Rating v0.1',
    positiveFactors: [
      'Prezzo inferiore al valore congruo stimato dall\'algoritmo (-7,7%)',
      'Evidenza comparabile simulata (11 rogiti notarili demo nel raggio di 500m)',
      'Indice di domanda acquirenti qualificati nel top 15° percentile per Appio Latino'
    ],
    negativeFactors: [
      'Incremento dell\'offerta concorrente attiva locale (+6 annunci nel 3° trimestre)',
      'Necessità di riqualificazione energetica in vista della direttiva europea EPBD Case Green 2030'
    ],
    sources: [
      'Agenzia delle Entrate - OMI Microzona Appio Latino 2026-S1',
      'Banca Dati Rogiti Notarili e Compravendite Chiuse',
      'Grafo Nodi di Trasporto ARPA & OpenStreetMap'
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-slate-950 border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col z-10 text-slate-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/60 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold mb-1">
              <span>Perché Questo Punteggio?</span>
              <span>•</span>
              <span>Matrice di Spiegabilità</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {targetSub.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dimensione: <strong className="text-slate-200">{dimension.name}</strong> ({dimension.score}/100)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Top Score Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Punteggio Sotto-Dimensione</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-white">{targetSub.score}</span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Peso: {(targetSub.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Confidenza</div>
              <div className="font-mono text-lg font-bold text-emerald-400 mt-1">{evidence.confidence}% ALTA</div>
            </div>
          </div>

          {/* Quantitative Evidence Metrics (Financial & Market Anchor) */}
          {isEconomicsOrPrice && (
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Dati Quantitativi di Riferimento
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Prezzo Richiesto</div>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">
                    €{property.askingPrice.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Valore Congruo Stimato</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    €{property.estimatedFairValue.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Scostamento dal Congruo</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {property.priceDifferencePct > 0 ? `+${property.priceDifferencePct}%` : `${property.priceDifferencePct}%`}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Prezzo Immobile al m²</div>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">
                    €{evidence.propertyPriceSqm.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Immobili Comparabili</div>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">
                    {evidence.comparablesCount} annunci attivi
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Transazioni Verificate</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {evidence.verifiedTransactions} rogiti registrati
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Mediana Comparabili €/m²</div>
                  <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                    €{evidence.medianComparablePriceSqm.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Freschezza del Dato</div>
                  <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                    {evidence.dataFreshnessDays} giorni fa
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Qualitative Sub-dimension Summary */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400 font-semibold block mb-1">Razionale Qualitativo:</span>
            {targetSub.summary}
          </div>

          {/* Positive Driver Factors */}
          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Fattori Positivi Determinanti
            </h4>
            <div className="space-y-1.5">
              {evidence.positiveFactors.map((factor, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Driver Factors */}
          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Fattori di Rischio o Penalizzazione
            </h4>
            <div className="space-y-1.5">
              {evidence.negativeFactors.map((factor, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources and Provenance */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Origine Dati & Modelli di Calcolo
            </h4>
            <div className="space-y-1 text-slate-400 font-mono text-[11px]">
              {evidence.sources.map((src, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span>{src}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Principle Footer */}
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Catena di Spiegabilità Decisionale:</div>
            <div className="font-mono text-emerald-400 font-semibold text-xs">
              RATING → PERCHÉ → FATTORI → DATI ORIGINARI → METODOLOGIA
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 sticky bottom-0">
          <button
            onClick={() => {
              onClose();
              if (onNavigateToMethodology) onNavigateToMethodology();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700"
          >
            <span>Consulta Metodologia Rating v0.1</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
