import React, { useState } from 'react';
import { X, Check, Edit3, XCircle, ShieldAlert } from 'lucide-react';
import { PropertyItem, ActionScenario } from '../types/intelligence';

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
  const [decisionMode, setDecisionMode] = useState<'ACCEPT' | 'MODIFY' | 'DECLINE'>('ACCEPT');
  const [declineReason, setDeclineReason] = useState<string>('Proprietario non disposto a trattare il prezzo');
  const [customPrice, setCustomPrice] = useState<number>(scenario.targetPrice);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const declineReasons = [
    'Proprietario non disposto a trattare il prezzo',
    'Giudizio professionale divergente',
    'Strategia commerciale alternativa',
    'Nuove informazioni sopraggiunte sull’immobile',
    'Altro motivo'
  ];

  const handleExecute = () => {
    if (decisionMode === 'ACCEPT') {
      onConfirmDecision('ACCEPTED', 'Accettato scenario raccomandato dal sistema', scenario.targetPrice);
    } else if (decisionMode === 'MODIFY') {
      onConfirmDecision('MODIFIED', notes || 'Modificato prezzo target in base ai margini di negoziazione', customPrice);
    } else {
      onConfirmDecision('DECLINED', declineReason + (notes ? `: ${notes}` : ''));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Human-in-the-Loop • Registro Decisionale Proprietario
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Registra Decisione Strategica
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {property.title}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Recommendation Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Raccomandazione di Sistema</span>
              <div className="font-bold text-white text-sm mt-0.5">{scenario.label}</div>
              <div className="font-mono text-emerald-400 text-xs mt-0.5">
                Target: €{scenario.targetPrice.toLocaleString()} (Punteggio: {scenario.actionScore}/100)
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Probabilità di Vendita a 90g</span>
              <div className="font-mono text-sm font-bold text-white mt-0.5">{scenario.saleProbability90d}%</div>
              <div className="text-[10px] text-slate-400 font-mono">Stima {scenario.expectedTimeToSaleDays} giorni</div>
            </div>
          </div>

          {/* Tab Selection: Accept, Modify, Decline */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Seleziona Tipo di Decisione
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionMode('ACCEPT')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  decisionMode === 'ACCEPT'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>ACCETTA</span>
              </button>
              <button
                type="button"
                onClick={() => setDecisionMode('MODIFY')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  decisionMode === 'MODIFY'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>MODIFICA</span>
              </button>
              <button
                type="button"
                onClick={() => setDecisionMode('DECLINE')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  decisionMode === 'DECLINE'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>RIFIUTA</span>
              </button>
            </div>
          </div>

          {/* Conditional Controls based on mode */}
          {decisionMode === 'MODIFY' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Prezzo Effettivo Stabilito (€)
                </label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Motivazione della Modifica (1-2 righe)
                </label>
                <input
                  type="text"
                  placeholder="Es. Controproposta con margine di chiusura al rogito..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {decisionMode === 'DECLINE' && (
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/20">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Motivazione Strutturata di Rifiuto (1-Click)</span>
              </div>
              <div className="space-y-1.5">
                {declineReasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                      declineReason === reason
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decline_reason"
                      checked={declineReason === reason}
                      onChange={() => setDeclineReason(reason)}
                      className="text-rose-500 focus:ring-0"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Principle Reminder */}
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Principio: L’AI raccomanda → L’umano decide → Il sistema apprende</span>
            <span className="text-emerald-400 font-bold">Closed Loop</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
          >
            Registra nel Log Decisionale
          </button>
        </div>
      </div>
    </div>
  );
};
