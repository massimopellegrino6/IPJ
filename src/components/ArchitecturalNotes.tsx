import React from 'react';
import { BookOpen, ShieldCheck, Database, Cpu, Sparkles, AlertTriangle, Layers, CheckCircle2 } from 'lucide-react';

export const ArchitecturalNotes: React.FC = () => {
  return (
    <div className="space-y-4 text-slate-900 max-w-5xl mx-auto">
      {/* Hero Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Tech Lead & Senior Architect White Paper</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Architettura Decision Intelligence per PropTech & Real Estate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Superare la valutazione statica AVM (Automated Valuation Model) attraverso un motore dinamico di rating,
          principi di <strong>Graceful Degradation</strong> e il flywheel proprietario <strong>Data Capture by Design</strong>.
        </p>
      </div>

      {/* Bento Grid of Core Architectural Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Principle 1: Graceful Degradation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  1. Graceful Degradation
                </h2>
                <span className="text-xs text-slate-500">
                  Perché gli AVM tradizionali falliscono e come risolverlo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              I modelli AVM tradizionali soffrono di <em>"fragilità statistica"</em>: se in una microzona mancano compravendite recenti, il sistema si blocca o allucina estrapolando comparabili distanti. La nostra architettura applica un <strong>ledger di penalità deterministico</strong> al Confidence Score e allarga il corridoio di fair value per tutelare l'acquirente.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Ledger di Penalità Ponderato</span>
                <p className="text-slate-500 text-[11px]">
                  Assenza comparabili (-25 pts), domanda ignota (-20 pts), assorbimento non rilevato (-15 pts). Baseline: 100%.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Risk Corridor Spreading</span>
                <p className="text-slate-500 text-[11px]">
                  Se confidence &lt; 60%, la forchetta di offerta si allarga a ±8% invece di ±4% per assorbire l'incertezza.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Principle 2: Data Capture by Design */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Flywheel: Data Capture by Design
                </h2>
                <span className="text-xs text-slate-500">
                  Creare il vero "data moat" tramite la tabella decision_log
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              I dati catastali e i portali sono commodity accessibili a chiunque. Il vero valore risiede nella conoscenza non codificata (domain expertise) degli agenti sul territorio: registrare lo snapshot di input/output assieme alla decisione reale crea il loop di Active Learning.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Snapshot Frozen Immutabile</span>
                <p className="text-slate-500 text-[11px]">
                  Nessun data drift retroattivo: lo stato del mercato e la raccomandazione del modello sono congelati al timestamp esatto.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Tassonomia Rifiuti Strutturata</span>
                <p className="text-slate-500 text-[11px]">
                  Rifiuti categorizzati (es. difformità catastali, liti condominiali) per supervisionare e calibrare gli algoritmi futuri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database & Cloud Architecture Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              3. Ottimizzazioni Supabase & PostgreSQL in Produzione
            </h2>
            <span className="text-xs text-slate-500">
              Integrità dei dati, sicurezza RLS e indicizzazione vettoriale/JSONB
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">CHECK Constraints & Tipizzazione Forte</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Tutti i punteggi di rating (0-100), superfici e prezzi sono vincolati da clausole <code className="text-slate-800 font-mono font-semibold">CHECK</code> native a livello di database per impedire corruzioni o payload invalidi.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Indici B-Tree & GIN su JSONB</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Query territoriali accelerate da indici composti <code className="text-slate-800 font-mono font-semibold">(city, micro_zone)</code>. Attributi flessibili (<code className="text-slate-800 font-mono font-semibold">features</code>) indicizzati con indici GIN.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Colonna GENERATED ALWAYS AS ... STORED</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Il delta percentuale tra stima algoritmica e offerta dell'agente (<code className="text-slate-800 font-mono font-semibold">delta_price_pct</code>) è calcolato direttamente dal database PostgreSQL, garantendo zero overhead computazionale nelle query aggregate.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Row Level Security (RLS) Multi-Tenant</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Politiche di sicurezza dichiarative per segregare i log e le quotazioni riservate per singola agenzia o profilo utente autenticato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
