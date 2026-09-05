import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, Database, CheckCircle2, ChevronRight } from 'lucide-react';
import { PropertyItem } from '../types/intelligence';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  evidence?: Array<{ label: string; value: string }>;
  suggestedAction?: {
    label: string;
    propertyId: string;
  };
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  properties,
  onSelectProperty
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: 'Co-pilota Decisionale del prototipo. Le risposte sono generate su un dataset dimostrativo che simula dimensioni del Rating, benchmark OMI, comparabili e pool acquirenti CRM. Chiedimi anomalie di portafoglio, variazioni di rating o screening delle priorità.',
      evidence: [
        { label: 'Dataset di ancoraggio', value: '26 immobili demo' },
        { label: 'Versione prototipo', value: 'v0.1' }
      ]
    }
  ]);

  if (!isOpen) return null;

  const sampleQueries = [
    "Perché è variato il rating di Via Appia?",
    "Mostrami immobili con Rating >80 e Agency Fit >90",
    "Quali immobili richiedono una revisione strategica?",
    "Confronta Via Appia e Via Veneto",
    "Quali trend emergono questo mese a Roma e Milano?"
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: q
    };

    let replyText = '';
    let evidenceList: Array<{ label: string; value: string }> = [];
    let suggested: { label: string; propertyId: string } | undefined = undefined;

    const lower = q.toLowerCase();

    if (lower.includes('appia') && (lower.includes('variat') || lower.includes('drop') || lower.includes('cambi') || lower.includes('perch'))) {
      replyText = 'Via Appia Nuova 245 ha attualmente un Rating di 84/100 (+4 pt negli ultimi 30 giorni). Precedentemente a inizio luglio era sceso a 77 a causa di 6 annunci concorrenti immessi ad Appio Latino. Il rating ha poi recuperato poiché il venditore ha posizionato il prezzo a 349.000 € (-7,7% sotto il Valore Congruo di 378.000 €) e la domanda qualificata per la linea Metro A è aumentata del +4,8%.';
      evidenceList = [
        { label: 'Delta Valore Congruo', value: '-7,7% (349k € vs 378k €)' },
        { label: 'Comparabili simulati', value: '11 compravendite negli ultimi 6 mesi' },
        { label: 'Compatibilità Agenzia', value: '94/100 (23 acquirenti attivi in target)' }
      ];
      suggested = { label: 'Ispeziona Via Appia Nuova 245', propertyId: 'prop_rm_appia_245' };
    } else if (lower.includes('>80') || (lower.includes('rating') && lower.includes('fit'))) {
      const matched = properties.filter(p => p.realEstateRating >= 80 && p.agencyFit.score >= 90);
      replyText = `Trovati ${matched.length} asset ad alta convinzione con Rating Immobiliare ≥80 e Agency Fit ≥90:\n` +
        matched.map(m => `• ${m.title} (Rating: ${m.realEstateRating}, Fit: ${m.agencyFit.score}, Prezzo: €${m.askingPrice.toLocaleString()})`).join('\n');
      evidenceList = [
        { label: 'Asset Top Match', value: 'Via Melchiorre Gioia 35 (Rating 93, Fit 96)' },
        { label: 'Tempo Mediano di Vendita', value: '34 giorni' }
      ];
      if (matched[0]) suggested = { label: `Ispeziona ${matched[0].title}`, propertyId: matched[0].id };
    } else if (lower.includes('revision') || lower.includes('review') || lower.includes('strategic')) {
      const reviewRequired = properties.filter(p => p.status === 'Review Required' || p.priority === 'HIGH');
      replyText = `Identificati ${reviewRequired.length} asset che richiedono revisione strategica umana:\n` +
        `1. Via Veneto 118 (Rating 72, Richiesta 1.18M € supera il Valore Congruo del +13.5% con 0 visite in 21 giorni)\n` +
        `2. Via Tiburtina 610 (Rating 38 CRITICO, richiesta 240k € superiore del 30% al valore edonico al 5° piano senza ascensore)\n` +
        `3. Via Appia Nuova 245 (Proposta di riposizionamento prezzo a 319k € pronta all'esecuzione)`;
      evidenceList = [
        { label: 'Fattore Principale di Rischio', value: 'Prezzo richiesto disallineato dai rogiti notarili storici' }
      ];
      suggested = { label: 'Apri Revisione Via Veneto 118', propertyId: 'prop_rm_veneto_118' };
    } else if (lower.includes('confront') || (lower.includes('veneto') && lower.includes('appia'))) {
      replyText = 'Sintesi Comparativa:\n• Via Appia Nuova 245: Rating 84, Agency Fit 94, Sotto-prezzo (-7,7%), 23 acquirenti in target, chiusura stimata in 54gg.\n• Via Veneto 118: Rating 72, Agency Fit 68, Sovrapprezzo (+13,5%), solo 5 acquirenti, chiusura stimata in 135gg.\nConclusione: Via Appia è priorità commerciale immediata; Via Veneto richiede rinegoziazione del prezzo di circa 140.000 € con la proprietà.';
      evidenceList = [
        { label: 'Raccomandazione', value: 'Priorità preview acquirenti su Appia; ricalibrazione su Veneto' }
      ];
    } else {
      replyText = `Analisi telemetria territoriale: Sul portafoglio monitorato di ${properties.length} immobili, il Rating medio è di 76/100 con confidenza media dell'87%. La velocità di liquidità è più marcata a Milano (Porta Nuova/Isola: 32gg mediano) e Roma (Appio Latino/Prati: 52gg mediano).`;
      evidenceList = [
        { label: 'Opportunità Attive', value: '18 asset ad alto potenziale' },
        { label: 'Freschezza dati demo', value: 'Scenario aggiornato 4 ore fa' }
      ];
    }

    const assistantMsg: Message = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      evidence: evidenceList,
      suggestedAction: suggested
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-slate-950 border-l border-slate-800 h-full overflow-hidden shadow-2xl flex flex-col z-10 text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Co-pilota Decision Intelligence
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Demo guidata
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Risposte simulate sul dataset del prototipo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-xl ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {m.evidence && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Evidenze Verificate:
                    </span>
                    {m.evidence.map((ev, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                        <span className="text-slate-400">{ev.label}:</span>
                        <span className="font-semibold text-white">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {m.suggestedAction && (
                  <button
                    onClick={() => {
                      const prop = properties.find(p => p.id === m.suggestedAction?.propertyId);
                      if (prop) {
                        onSelectProperty(prop);
                        onClose();
                      }
                    }}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{m.suggestedAction.label}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Sample Queries */}
        <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
            Quesiti Quantitativi Consigliati
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.slice(0, 3).map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 transition-colors text-left truncate max-w-full"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Fai una domanda quantitativa (es. Perché è calato il rating?)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
