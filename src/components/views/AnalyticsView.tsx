import React, { useState } from 'react';
import { 
  LineChart, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight,
  Activity,
  Compass,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('ALL');

  const outcomesClosed = [
    {
      id: 'out_1',
      title: 'Via Nomentana 188 — Roma',
      zone: 'Trieste / Nomentano',
      decisionTaken: 'Reprice -6.2% ad €420.000',
      decisionDate: '12 Maggio 2026',
      saleDate: '28 Giugno 2026',
      predictedPrice: 420000,
      realizedPrice: 418000,
      priceDeltaPct: -0.47,
      predictedDays: 45,
      actualDays: 47,
      daysDelta: +2,
      modelAccuracy: '98.8%',
      learningFeedback: 'Coefficiente tempo di vendita per quadrante Nomentano validato. Riduzione incertezza stimata -1.2%.'
    },
    {
      id: 'out_2',
      title: 'Corso Sempione 72 — Milano',
      zone: 'Sempione / Arco della Pace',
      decisionTaken: 'Matching Immediato con Top 3 Acquirenti CRM',
      decisionDate: '3 Aprile 2026',
      saleDate: '24 Aprile 2026',
      predictedPrice: 590000,
      realizedPrice: 595000,
      priceDeltaPct: +0.84,
      predictedDays: 25,
      actualDays: 21,
      daysDelta: -4,
      modelAccuracy: '99.1%',
      learningFeedback: 'Incrementato peso propensione acquisto per acquirenti con pre-delibera mutuo bancario.'
    },
    {
      id: 'out_3',
      title: 'Via Saragozza 45 — Bologna',
      zone: 'Saragozza / Colli',
      decisionTaken: 'Rifiuto Proposta Al Ribasso (-12%) e Riposizionamento a Congruo',
      decisionDate: '15 Febbraio 2026',
      saleDate: '10 Aprile 2026',
      predictedPrice: 380000,
      realizedPrice: 378000,
      priceDeltaPct: -0.52,
      predictedDays: 50,
      actualDays: 54,
      daysDelta: +4,
      modelAccuracy: '97.6%',
      learningFeedback: 'Validata tenuta del prezzo congruo edonico contro offerte speculative.'
    },
    {
      id: 'out_4',
      title: 'Via Cavour 31 — Torino',
      zone: 'Centro / San Salvario',
      decisionTaken: 'Messa in Vendita con Esclusiva e Servizio Foto 3D',
      decisionDate: '10 Gennaio 2026',
      saleDate: '20 Febbraio 2026',
      predictedPrice: 260000,
      realizedPrice: 258000,
      priceDeltaPct: -0.76,
      predictedDays: 40,
      actualDays: 41,
      daysDelta: +1,
      modelAccuracy: '98.5%',
      learningFeedback: 'Confermata elasticità di domanda per bilocali centrali ad alto rendimento locativo.'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Misurazione di Efficacia & Apprendimento Closed-Loop
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Analytics & Outcomes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            “Cosa è successo dopo le decisioni?” Verifica empirica delle delibere umane rispetto ai dati notarili e apprendimento del modello.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <span>Closed-Loop Learning · Simulazione</span>
        </div>
      </div>

      {/* 1. KEY OUTCOME METRICS (Richiesti esplicitamente da Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Decisions Executed */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center justify-between">
            <span>Decisions Executed</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-white mt-1">42</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>100% tracciate in audit log</span>
          </div>
        </div>

        {/* Model Accuracy */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center justify-between">
            <span>Model Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">91.4%</div>
          <div className="text-[11px] text-slate-400 font-mono">
            Predizioni confermate a rogito
          </div>
        </div>

        {/* Tempo Medio di Vendita: Previsto vs Reale */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center justify-between">
            <span>Tempo Medio Vendita</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">
            48 <span className="text-sm font-normal text-slate-400">prev.</span> vs 52 <span className="text-sm font-normal text-emerald-400">reali</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Scostamento minimo (+4 giorni)
          </div>
        </div>

        {/* Prezzo Finale: Stimato vs Realizzato */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center justify-between">
            <span>Prezzo Finale</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
            0.7% <span className="text-sm font-normal text-slate-400">delta medio</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Stima media €348k vs €345.5k reali
          </div>
        </div>
      </div>

      {/* 2. FEEDBACK LOOP: IMMOBILI VENDUTI & SCOSTAMENTO */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Feedback Loop: Immobili Venduti & Scostamento dalle Predizioni
            </h3>
            <p className="text-xs text-slate-400">
              Confronto sistematico tra la raccomandazione decisionale adottata e il reale esito contrattuale.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Dati sincronizzati con Rogiti Notarili
          </span>
        </div>

        <div className="space-y-4">
          {outcomesClosed.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                    {item.zone}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {item.title}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">
                    Decisione Adottata: <strong className="text-white">{item.decisionTaken}</strong> (Delibera: {item.decisionDate} • Rogito: {item.saleDate})
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Accuratezza Modello</span>
                    <span className="text-base font-bold text-emerald-400">{item.modelAccuracy}</span>
                  </div>
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Prezzo Previsto:</span>
                  <span className="text-white font-bold">€{item.predictedPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Prezzo Realizzato:</span>
                  <span className="text-emerald-400 font-bold">€{item.realizedPrice.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block font-normal">({item.priceDeltaPct >= 0 ? `+${item.priceDeltaPct}%` : `${item.priceDeltaPct}%`})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Tempo Stimato:</span>
                  <span className="text-white font-bold">{item.predictedDays} giorni</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Tempo Effettivo:</span>
                  <span className="text-emerald-400 font-bold">{item.actualDays} giorni</span>
                  <span className="text-[10px] text-slate-400 block font-normal">({item.daysDelta >= 0 ? `+${item.daysDelta}gg` : `${item.daysDelta}gg`})</span>
                </div>
              </div>

              {/* System Learning Note */}
              <div className="flex items-start gap-2 text-xs text-slate-300 pt-1">
                <BrainCircuit className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-emerald-400">Apprendimento del Sistema:</strong> {item.learningFeedback}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CONTINUOUS LEARNING ARCHITECTURE EXPLANATION */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Come Funziona il Ciclo di Apprendimento Closed-Loop</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Ogni volta che una vendita viene registrata presso l'Agenzia delle Entrate o un agente archivia un esito commerciale, il sistema confronta i parametri stimati (prezzo congruo edonico, giorni sul mercato, elasticità della domanda) con i valori contrattuali effettivi. I residui generati alimentano la ricalibrazione dei coefficienti territoriali per la microzona di appartenenza, garantendo una convergenza continua verso la massima accuratezza senza deviazioni arbitrarie.
        </p>
      </div>
    </div>
  );
};
