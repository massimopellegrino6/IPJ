import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  FileCheck2, 
  Database, 
  Info, 
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const ConfidenceAndDegradationGuide: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-200">
      {/* Definizione della Confidenza */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-tight uppercase font-mono text-[13px]">
            La Confidence: Definizione Scientifica & Ruolo Trasversale
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In REDIP, il punteggio di <strong>Confidence (Confidenza Informativa)</strong> non quantifica la qualità dell'immobile, bensì l'<strong>integrità, la freschezza e la densità probatoria delle evidenze matematiche disponibili</strong>. Un immobile fatiscente può avere una confidenza del 95% (se abbiamo perizia completa, rogito recente e catasto perfetto), mentre una villa lussuosa in zona isolata può avere confidenza del 45% per carenza di transazioni comparabili.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          {/* HIGH */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400 text-sm">HIGH CONFIDENCE</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                &gt; 80%
              </span>
            </div>
            <div className="text-white font-bold">Evidenza Probatoria Robusta</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Disponibilità di rogiti notarili reali a meno di 180 giorni nel raggio di 400m, visura e planimetria catastale validate, telemetria territoriale verificata.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Delibera rapida autorizzata (1-Click)</span>
            </div>
          </div>

          {/* MEDIUM */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-400 text-sm">MEDIUM CONFIDENCE</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                60% - 80%
              </span>
            </div>
            <div className="text-white font-bold">Stima Edonica Affidabile</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Numero moderato di comparabili (3-5 transazioni) o raggio di ricerca allargato a 800m. Modello statistico solido, con lieve varianza campionaria.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Revisione agente raccomandata</span>
            </div>
          </div>

          {/* LIMITED */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400 text-sm">LIMITED EVIDENCE</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                &lt; 60%
              </span>
            </div>
            <div className="text-white font-bold">Carenza Informativa Critica</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Assenza di compravendite recenti, documentazione catastale parziale, o tipologia architettonica atipica. Le bande di oscillazione del valore sono ampliate.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Sopralluogo peritale perito obbligatorio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Principio di Graceful Degradation */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <TrendingDown className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Il Principio di Graceful Degradation (Degradazione Graziosa)
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          I modelli di intelligenza artificiale tradizionali falliscono miseramente quando mancano dati puntuali: inventano stime prive di riscontro o bloccano l'esecuzione con errori opachi.
          REDIP implementa l'architettura <strong>Graceful Degradation</strong>, ispirata ai protocolli di sicurezza aeronautici e bancari:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
              1. Fallback Bayesiano Trasparente
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Quando un segnale locale (es. acustica da sensore o storico transazioni micro-strada) è assente, l'algoritmo non imputa un valore arbitrario. Ricorre al <em>prior bayesiano</em> del quartiere o della macro-zona OMI, allargando contestualmente l'intervallo di confidenza.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
              2. Tracciamento Esplicito dei Segnali Mancanti
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Ogni scheda immobile e ogni record di telemetria evidenzia esplicitamente il tag <code className="text-amber-300">system_degraded: true</code> e la lista dei segnali assenti (es. <code>NOTARIAL_DEEDS_MISSING</code>, <code>APE_NOT_FILED</code>), informando il broker dell'incertezza residua.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
              3. Ampliamento dello Spread Edonico
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Minore è la densità dei dati, maggiore è la forchetta tra Prezzo Minimo Conservativo e Prezzo Massimo Ottimistico. La piattaforma impedisce all'operatore di basarsi su una falsa precisione numerica.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
              4. Penalizzazione Asimmetrica della Liquidità
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              L'incertezza informativa viene incorporata come fattore di frizione di mercato: il tempo medio di vendita previsto (DOM) aumenta proporzionalmente alla carenza di certificazioni documentali.
            </p>
          </div>
        </div>
      </div>

      {/* Regole di Blocco del Comitato Fiduciario */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-rose-900/40 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Protocolli Fiduciari di Blocco della Delibera Automatica
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          A tutela della responsabilità deontologica e legale dell'agenzia, il sistema impone <strong>3 Hard Stops</strong> insuperabili che inibiscono l'approvazione 1-click:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-start gap-3">
            <span className="font-mono text-rose-400 font-bold text-sm shrink-0">STOP 1</span>
            <div>
              <strong className="text-white">Confidenza Informativa Inferiore al 55%</strong>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Il sistema vieta l'emissione del mandato in esclusiva senza un preventivo sopralluogo tecnico asseverato da un perito abilitato.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-start gap-3">
            <span className="font-mono text-rose-400 font-bold text-sm shrink-0">STOP 2</span>
            <div>
              <strong className="text-white">Pilastro "Rischio & Conformità" Inferiore a 50/100</strong>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Rilevazione di difformità planimetrica, pignoramento pendente, o delibera condominiale straordinaria non quantificata. L'immobile viene contrassegnato con bandiera rossa "AUDIT LEGALE RICHIESTO".
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-start gap-3">
            <span className="font-mono text-rose-400 font-bold text-sm shrink-0">STOP 3</span>
            <div>
              <strong className="text-white">Delta di Override Prezzo Agente Superiore al ±12%</strong>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Se il broker intende proporre un prezzo che devia di oltre il 12% dallo Scenario B consigliato, il sistema rende obbligatoria l'immissione di note motivazionali strutturate archiviate nell'audit trail immutabile.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
