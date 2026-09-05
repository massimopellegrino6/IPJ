import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Binary,
  ArrowRight,
  BrainCircuit,
  Compass,
  Check
} from 'lucide-react';
import { DATA_SOURCES_CATALOG } from '../../data/mockIntelligenceDatabase';

export const MethodologyView: React.FC = () => {
  // 6 Core Pillars from Section 17
  const sixPillars = [
    { 
      number: '1',
      name: 'Qualità Immobile', 
      weight: '20%',
      desc: 'Layout distributivo, altezza soffitti, luminosità naturale, qualità finiture, stato conservativo impianti ed efficienza energetica.' 
    },
    { 
      number: '2',
      name: 'Posizione & Connettività', 
      weight: '20%',
      desc: 'Distanza da nodi di trasporto rapido (Metro/FS), indice di camminabilità verso servizi essenziali, offerta scolastica e sicurezza urbana.' 
    },
    { 
      number: '3',
      name: 'Ambiente & Territorio', 
      weight: '15%',
      desc: 'Aree verdi di prossimità, telemetria qualità dell\'aria ARPA (PM2.5/PM10), inquinamento acustico, esposizione climatica e isole di calore.' 
    },
    { 
      number: '4',
      name: 'Rischio & Conformità', 
      weight: '15%',
      desc: 'Verifica conformità edilizia/catastale, rischio alluvione/sismico, contenziosi condominiali pendenti e congruità fondo cassa straordinario.' 
    },
    { 
      number: '5',
      name: 'Mercato & Liquidità', 
      weight: '15%',
      desc: 'Velocità di assorbimento della microzona, volume annunci concorrenti attivi, giorni medi di vendita (DOM) e pressione della domanda locale.' 
    },
    { 
      number: '6',
      name: 'Economia & Rendimento', 
      weight: '15%',
      desc: 'Prezzo unitario congruo rispetto ai rogiti notarili storici, yield locativo potenziale, rivalutazione di zona e marginalità dell\'operazione.' 
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800/80">
        <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
          Governance, Trasparenza & Modello Fiduciario
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Methodology & System Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Nessuna scatola nera ("black-box AI"). Spiegazione scientifica del calcolo del Rating, del ruolo della Confidenza e del principio di governance fiduciaria.
        </p>
      </div>

      {/* CORE PRINCIPLE BANNER: AI RECOMMENDS -> HUMAN DECIDES -> SYSTEM LEARNS */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/50 space-y-3">
        <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
          Il Principio Cardine del Sistema
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-lg font-bold text-white font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              AI recommends
            </span>
            <ArrowRight className="w-5 h-5 text-slate-500" />
            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Human decides
            </span>
            <ArrowRight className="w-5 h-5 text-slate-500" />
            <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              System learns
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-md">
            L'intelligenza artificiale propone scenari quantitativi basati su dati oggettivi. La decisione commerciale spetta esclusivamente all'agente o al comitato investimenti. L'esito contrattuale reale a rogito chiude il loop di apprendimento continuo.
          </p>
        </div>
      </div>

      {/* 1. COS'È IL REAL ESTATE RATING & COME FUNZIONA IL CALCOLO */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Binary className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Cos'è il Real Estate Rating & Come Funziona il Calcolo
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Il <strong>Real Estate Rating</strong> è un indice sintetico e deterministico scalato da 0 a 100 che quantifica la solidità, la liquidità e il valore intrinseco di un cespite immobiliare. A differenza di una semplice stima di prezzo commerciale, il rating isola i fattori strutturali e territoriali indipendentemente dalla volatilità momentanea della richiesta del proprietario.
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 space-y-2 overflow-x-auto">
          <code>
            RATING = ∑ (Punteggio_Pilastro_i × Peso_i) × (1 - Penalità_Rischio_Critico)
          </code>
          <div className="text-[11px] text-slate-400 font-sans">
            Dove la somma dei pesi è normalizzata ad 1.00. In presenza di anomalie bloccanti (es. difformità catastale insanabile o pregiudizio strutturale), si applica un tetto massimo penalizzante sulla liquidità.
          </div>
        </div>
      </div>

      {/* 2. I 6 PILASTRI METODOLOGICI (Richiesti esplicitamente da Section 17) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              I 6 Pilastri Metodologici
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Pesi Istituzionali in Validazione</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sixPillars.map((pillar) => (
            <div
              key={pillar.number}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">
                  {pillar.number}. {pillar.name}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-bold">
                  Peso {pillar.weight}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. IL RUOLO DELLA CONFIDENCE & DEGRADAZIONE GRAZIOSA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Il Ruolo Trasversale della Confidenza
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            La <strong>Confidence</strong> non misura la bontà dell'immobile, bensì l'<strong>accuratezza e la completezza delle evidenze informative disponibili</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
            <li><strong className="text-white">Dati Ricchi (&gt;80%):</strong> Rogiti notarili recenti, planimetria catastale validata, storico mercato attivo.</li>
            <li><strong className="text-white">Dati Moderati (60-80%):</strong> Modello edonico basato su comparabili di raggio medio, stima affidabile.</li>
            <li><strong className="text-white">Evidenza Limitata (&lt;60%):</strong> Poche compravendite recenti nella microzona. Il sistema mostra <span className="text-amber-400 font-mono font-bold">LIMITED EVIDENCE</span> e richiede un sopralluogo peritale umano prima della delibera.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <BrainCircuit className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Ciclo di Apprendimento Closed-Loop
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Come il sistema impara continuamente:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
            <li><strong className="text-white">Audit delle Decisioni:</strong> Ogni proposta accettata, modificata o rifiutata con motivazione viene registrata con immutabilità.</li>
            <li><strong className="text-white">Confronto con Rogiti Notarili:</strong> Alla trascrizione notarile della compravendita, il prezzo reale e i giorni effettivi sul mercato vengono confrontati con le stime.</li>
            <li><strong className="text-white">Ricalibrazione Mensile:</strong> I coefficienti edonici di microzona vengono aggiornati per ridurre progressivamente l'errore quadratico medio (MAE).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
