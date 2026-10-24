import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  TrendingDown, 
  ArrowRight, 
  Binary, 
  Zap,
  Info,
  Scale
} from 'lucide-react';

export const BiasAttributionTheory: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-200">
      {/* Product Thesis Hero Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400">
            <Scale className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight uppercase font-mono text-[13px]">
              Product Thesis v1.0 — Segregazione World Model vs Decision Model
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
            Algoritmo Proprietario di Sterilizzazione
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Il fallimento storico di quasi tutti i modelli predittivi e AVM (Automated Valuation Model) nel Real Estate risiede in un vizio epistemologico: 
          <strong> confondere un fallimento di esecuzione commerciale dell'agenzia con un rifiuto dell'immobile da parte del mercato</strong>.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="text-slate-200 font-bold">
            Il Paradosso dell'Inquinamento dei Dati (Feedback Loop Avvelenato):
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Se un immobile con prezzo stimato congruo di €450.000 non viene venduto in 90 giorni perché l'agente incaricato ha risposto ai lead con 72 ore di ritardo, ha rifiutato le visite nei weekend e ha investito solo €100 in sponsorizzazione, un algoritmo ingenuo concluderà: <em>"Il mercato ha respinto il prezzo di €450.000; dobbiamo svalutare l'immobile e tutti gli analoghi della microzona a €390.000"</em>.
            Questo distrugge l'accuratezza del modello statistico.
          </p>
        </div>
      </div>

      {/* L'Equazione dell'Effort Operativo */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Binary className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-tight">
            La Formulazione Matematica dell'Effort Operativo
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Nello <strong>Step 3 (T+60/90gg)</strong>, REDIP calcola l'<strong>Operative Effort Score</strong> normalizzato da 0.00 a 1.00 attraverso una combinazione lineare di 3 parametri oggettivi desunti dalle API di telemetria e dal CRM:
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 space-y-2 overflow-x-auto">
          <div className="font-bold text-sm">
            EFFORT = [ 0.35 × Score_LeadResponse ] + [ 0.35 × Score_VisitsRatio ] + [ 0.30 × Score_MarketingBudget ]
          </div>
          <div className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1 border-t border-slate-800">
            Dove ciascun sub-punteggio è calibrato sui benchmark operativi del settore:
            <ul className="list-disc list-inside mt-1 space-y-1 font-mono text-[10px] text-slate-300">
              <li><strong>Score_LeadResponse:</strong> 1.00 se tempo medio &lt; 2h; 0.70 se &lt; 8h; 0.30 se &lt; 24h; 0.05 se &gt; 48h.</li>
              <li><strong>Score_VisitsRatio:</strong> Visite fisiche svolte / Visite richieste profilate (1.00 per ratio &gt; 80%).</li>
              <li><strong>Score_MarketingBudget:</strong> Budget adv effettivamente erogato / Budget stanziato a delibera.</li>
            </ul>
          </div>
        </div>

        {/* Fasce di Classificazione Effort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/50">
            <span className="text-rose-400 font-bold font-mono text-[10px] uppercase block mb-1">
              LOW_EFFORT (&lt; 0.40)
            </span>
            <div className="text-white font-bold">Inerzia Organizzativa</div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              La mancata vendita è causata da lentezza e omissione commerciale. 
              <strong> Innesca la STERILIZZAZIONE del World Model</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/50">
            <span className="text-amber-400 font-bold font-mono text-[10px] uppercase block mb-1">
              MODERATE_EFFORT (0.40 - 0.69)
            </span>
            <div className="text-white font-bold">Esecuzione Standard</div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Impegno commerciale sufficiente. Il sistema applica una ricalibrazione parziale a peso attenuato (damping factor 0.50).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/50">
            <span className="text-emerald-400 font-bold font-mono text-[10px] uppercase block mb-1">
              HIGH_EFFORT (&gt;= 0.70)
            </span>
            <div className="text-white font-bold">Esecuzione Impeccabile</div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Se l'immobile non è stato venduto nonostante l'alto impegno, il prezzo era oggettivamente errato.
              <strong> Innesca la RICALIBRAZIONE del World Model</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Matrice a 4 Quadranti di Attribuzione */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>La Tassonomia dei 4 Quadranti di Attribuzione</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Quadrante 1 */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-rose-400 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                ORGANIZATIONAL_INERTIA_BIAS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                STERILIZZATO
              </span>
            </div>
            <div className="text-white font-bold text-sm">Mancata Vendita + Basso Effort (&lt; 0.40)</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Il mandato scade o viene revocato, ma i registri mostrano lead inevasi per giorni o budget marketing non speso.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-rose-300">Azione Algoritmica: </strong>
              Il World Model <strong>NON declassa il valore dell'immobile</strong> né svaluta la microzona. L'errore viene computato a carico del Decision Model dell'agenzia per il calcolo dell'efficienza organizzativa.
            </div>
          </div>

          {/* Quadrante 2 */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400 text-xs flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" />
                WORLD_MODEL_RECALIBRATION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                RICALIBRATO
              </span>
            </div>
            <div className="text-white font-bold text-sm">Mancata Vendita + Alto Effort (&gt;= 0.70)</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              L'agenzia ha condotto decine di visite, risposto in tempo reale e speso il budget marketing, ma il mercato ha respinto l'offerta.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-amber-300">Azione Algoritmica: </strong>
              L'algoritmo accetta la smentita empirica: aggiorna i pesi del pilastro "Mercato & Liquidità", riduce l'indice di elasticità zonale e calibra al ribasso le stime future per la tipologia.
            </div>
          </div>

          {/* Quadrante 3 */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                HUMAN_EXPERTISE_SURPLUS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                ALPHA AGENTE
              </span>
            </div>
            <div className="text-white font-bold text-sm">Vendita a Prezzo Superiore alla Stima Algoritmo</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              L'agente ha applicato un Override rialzista rispetto allo Scenario Consigliato e ha chiuso la vendita al prezzo maggiorato nei tempi previsti.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-cyan-300">Azione Algoritmica: </strong>
              Il sistema apprende le caratteristiche non scritte (es. affaccio panoramico particolare, finiture d'autore) e incrementa l'Expertise Score dell'agente nel modello bayesiano.
            </div>
          </div>

          {/* Quadrante 4 */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                MARKET_ALIGNED_SUCCESS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                CONVERGENZA
              </span>
            </div>
            <div className="text-white font-bold text-sm">Vendita Perfetta Allineata allo Scenario B</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Prezzo chiuso entro il ±2% dalla raccomandazione algoritmica nei giorni previsti dal DOM modellato.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-emerald-300">Azione Algoritmica: </strong>
              Il modello consolida la convergenza dei coefficienti di regressione e aumenta il punteggio di Confidenza Informativa per tutte le stime future nella medesima microzona.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
