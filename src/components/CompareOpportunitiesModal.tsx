import React from 'react';
import { X, Check, Layers } from 'lucide-react';
import { PropertyItem } from '../types/intelligence';
import { RatingBadge } from './badges/RatingBadge';
import { ConfidenceBadge } from './badges/ConfidenceBadge';
import { AgencyFitBadge } from './badges/AgencyFitBadge';

interface CompareOpportunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
}

export const CompareOpportunitiesModal: React.FC<CompareOpportunitiesModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSelectProperty
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Confronto Affiancato Opportunità di Acquisizione
              </h3>
              <p className="text-xs text-slate-400">
                Valutazione comparativa di {properties.length} asset su Rating, Agency Fit, Valutazione e Rischio
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto flex-1 space-y-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-3 px-4 text-slate-400 font-semibold uppercase text-[10px] tracking-wider w-48">
                  Dimensione / Metrica
                </th>
                {properties.map((prop) => (
                  <th key={prop.id} className="py-3 px-4 min-w-[240px]">
                    <div className="font-bold text-white text-sm">{prop.title}</div>
                    <div className="text-[11px] text-slate-400">{prop.microZone}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {/* Rating */}
              <tr className="bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Rating Immobiliare
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">
                    <RatingBadge score={prop.realEstateRating} classification={prop.ratingClassification} size="sm" />
                  </td>
                ))}
              </tr>

              {/* Confidence */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Confidenza del Rating
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">
                    <ConfidenceBadge score={prop.ratingConfidence} level={prop.ratingConfidenceLevel} size="sm" />
                  </td>
                ))}
              </tr>

              {/* Agency Fit */}
              <tr className="bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Compatibilità Agenzia (Fit)
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">
                    <AgencyFitBadge score={prop.agencyFit.score} size="sm" />
                  </td>
                ))}
              </tr>

              {/* Asking Price vs Estimated Value */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Prezzo Richiesto
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-white font-bold">
                    €{prop.askingPrice.toLocaleString()}
                  </td>
                ))}
              </tr>

              <tr className="bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Valore Congruo Stimato
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-emerald-400 font-bold">
                    €{prop.estimatedFairValue.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Price Delta */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Scostamento Prezzo (% vs Congruo)
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className={`py-3 px-4 font-bold ${prop.priceDifferencePct < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {prop.priceDifferencePct > 0 ? `+${prop.priceDifferencePct}%` : `${prop.priceDifferencePct}%`}
                  </td>
                ))}
              </tr>

              {/* 90d Sale Probability */}
              <tr className="bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Probabilità Vendita a 90g
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-white font-bold">
                    {prop.estimatedSaleProbability90d}%
                  </td>
                ))}
              </tr>

              {/* Time to Sale */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Tempo Stimato di Chiusura
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-slate-300">
                    {prop.estimatedTimeToSaleDays} giorni
                  </td>
                ))}
              </tr>

              {/* Compatible Active Buyers */}
              <tr className="bg-slate-900/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Acquirenti Qualificati Attivi
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-sky-400 font-bold">
                    {prop.agencyFit.compatibleActiveBuyers} qualificati ({prop.agencyFit.highIntentBuyers} alto intento)
                  </td>
                ))}
              </tr>

              {/* Dimensions: Property, Location, Economics */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                  Qualità Immobile / Microzona
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-slate-300">
                    Immobile: {prop.dimensions[0]?.score}/100 • Zona: {prop.dimensions[1]?.score}/100
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="py-4 px-4 font-sans font-semibold text-slate-300">
                  Azione
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-4 px-4">
                    <button
                      onClick={() => {
                        onSelectProperty(prop);
                        onClose();
                      }}
                      className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold font-sans transition-colors"
                    >
                      Apri Scheda Immobile
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
