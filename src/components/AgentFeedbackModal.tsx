import React, { useState } from 'react';
import { EvaluationResult, PropertyData, AgentDecisionOutcome, RejectionCategory } from '../types/proptech';
import { X, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface AgentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationResult;
  property: PropertyData;
  onSubmitDecision: (feedback: {
    agent_id: string;
    agent_name: string;
    agent_decision: AgentDecisionOutcome;
    agent_final_price?: number;
    rejection_category?: RejectionCategory;
    agent_feedback_notes?: string;
  }) => void;
}

export const AgentFeedbackModal: React.FC<AgentFeedbackModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  property,
  onSubmitDecision,
}) => {
  if (!isOpen) return null;

  const [decision, setDecision] = useState<AgentDecisionOutcome>('ACCEPTED');
  const [agentPrice, setAgentPrice] = useState<number>(evaluation.valuation.suggested_target_price);
  const [rejectionCategory, setRejectionCategory] = useState<RejectionCategory>('PRICE_UNREALISTIC');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [agentName, setAgentName] = useState<string>('Marco Rossi (Senior Acquisition Lead)');

  const priceDelta = agentPrice 
    ? Math.round(((agentPrice - evaluation.valuation.suggested_target_price) / evaluation.valuation.suggested_target_price) * 100 * 10) / 10
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDecision({
      agent_id: 'usr_agent_007',
      agent_name: agentName,
      agent_decision: decision,
      agent_final_price: decision === 'REJECTED' ? undefined : Number(agentPrice),
      rejection_category: decision === 'REJECTED' ? rejectionCategory : undefined,
      agent_feedback_notes: feedbackNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-900 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Data Capture by Design • Feedback Loop</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Registra Decisione Finale Agente
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Salva l'output deterministico del motore e la decisione sul territorio in <code className="text-slate-800 font-semibold font-mono">public.decision_log</code>.
          </p>
        </div>

        {/* Snapshot Summary Box */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-4 grid grid-cols-3 gap-2">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Immobile</span>
            <span className="font-bold text-slate-800 line-clamp-1">{property.title}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Rating & Conf.</span>
            <span className="font-mono font-bold text-slate-800">
              {evaluation.overall_rating}/100 • {evaluation.confidence_score}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Stima</span>
            <span className="font-mono text-emerald-700 font-bold">
              € {evaluation.valuation.suggested_target_price.toLocaleString('it-IT')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Decision Outcome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Esito Decisionale dell'Agente:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('ACCEPTED')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  decision === 'ACCEPTED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Accetta</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('OVERRIDDEN')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  decision === 'OVERRIDDEN'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Modifica Prezzo</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  decision === 'REJECTED'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Rifiuta / Scarta</span>
              </button>
            </div>
          </div>

          {/* Conditional: Adjusted Price */}
          {decision !== 'REJECTED' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Prezzo Finale Concordato / Offerta dell'Agente (€):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="1000"
                  value={agentPrice}
                  onChange={(e) => setAgentPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className={`text-xs font-mono font-bold px-2.5 py-2 rounded-lg shrink-0 ${
                  priceDelta === 0 
                    ? 'bg-slate-200 text-slate-700' 
                    : priceDelta > 0 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {priceDelta > 0 ? `+${priceDelta}%` : `${priceDelta}%`} vs Stima
                </span>
              </div>
            </div>
          )}

          {/* Conditional: Rejection Category */}
          {decision === 'REJECTED' && (
            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
              <label className="block text-xs font-bold text-rose-900">
                Motivazione Strutturata del Rifiuto (Obbligatoria per ML):
              </label>
              <select
                value={rejectionCategory}
                onChange={(e) => setRejectionCategory(e.target.value as RejectionCategory)}
                className="w-full bg-white border border-rose-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-rose-500"
              >
                <option value="PRICE_UNREALISTIC">Venditore irrealistico / Fuori mercato</option>
                <option value="POOR_PHYSICAL_CONDITION">Stato conservativo peggiore delle perizie</option>
                <option value="UNRESOLVED_LEGAL_ISSUES">Vizi edilizi / Difformità catastali / Ipoteche</option>
                <option value="MICRO_ZONE_DEGRADATION">Quartiere degradato o rumoroso (feedback locale)</option>
                <option value="SELLER_INFLEXIBLE">Proprietario non collaborativo / No mandato</option>
                <option value="CONDO_EXPENSES_EXCESSIVE">Spese straordinarie deliberate elevate</option>
                <option value="OTHER">Altra motivazione documentata</option>
              </select>
            </div>
          )}

          {/* Qualitative Agent Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note Qualitative dell'Agente (Domain Feedback):
            </label>
            <textarea
              rows={3}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="Es. Il venditore ha accettato un'offerta a 510k per chiusura entro 60 giorni. Ottima luminosità naturale non catturata dalla scheda catastale."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Salva in Decision Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
