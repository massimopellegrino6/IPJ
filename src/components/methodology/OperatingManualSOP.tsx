import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  Clock, 
  UserCheck, 
  ArrowRight, 
  FileText, 
  Activity, 
  Trophy, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Workflow
} from 'lucide-react';

interface SOPStep {
  id: string;
  code: string;
  title: string;
  timing: string;
  role: string;
  objective: string;
  checklist: string[];
  systemAction: string;
  pitfallsToAvoid: string;
}

export const OperatingManualSOP: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('SOP_01');

  const sopList: SOPStep[] = [
    {
      id: 'SOP_01',
      code: 'SOP 01',
      title: 'Scouting, Screener & Ingestion dell’Opportunità',
      timing: 'Giorno T - 3 (Fase Pre-Mandato)',
      role: 'Acquisitore Junior / Broker Territoriale',
      objective: 'Identificare immobili ad alto potenziale, filtrare anomalie documentali e preparare il dossier per la delibera.',
      checklist: [
        'Accedere alla vista "Opportunità" e filtrare per microzona di competenza e classe energetica.',
        'Verificare il Real Estate Rating preliminare (soglia minima per mandati in esclusiva: 68/100).',
        'Controllare il livello di Confidence: se inferiore a 60%, programmare sopralluogo tecnico preliminare.',
        'Inserire l’immobile nella propria Watchlist personale per monitorare oscillazioni dei comparabili di zona.',
        'Esaminare il "Risk & Compliance Breakdown": verificare assenza di vincoli monumentali o difformità non sanabili.'
      ],
      systemAction: 'La piattaforma aggrega i micro-dati OMI, le transazioni recenti, la telemetria ARPA e l’accessibilità isocrona, generando il primo snapshot deterministico.',
      pitfallsToAvoid: 'Non presentare al proprietario una stima verbale prima di aver congelato lo snapshot nel Decision Center.'
    },
    {
      id: 'SOP_02',
      code: 'SOP 02',
      title: 'Sessione di Delibera & Scelta Scenario di Pricing (Step 1)',
      timing: 'Giorno T = 0 (Formalizzazione Incarico)',
      role: 'Broker Senior / Comitato Investimenti',
      objective: 'Formalizzare la strategia di prezzo, selezionare lo scenario commerciale (A, B o C) e registrare l’evento nel Decision Log.',
      checklist: [
        'Aprire la scheda immobile e cliccare "Avvia Delibera" per accedere al Decision Center.',
        'Confrontare i tre scenari generati dal motore quantitativo:',
        '• Scenario A (Liquidità / Fast Sell 30-45gg): per vendite urgenti o mandati con forte competizione.',
        '• Scenario B (Allineato al Mercato 60-90gg • RACCOMANDATO): target naturale per massimizzare il valore netto.',
        '• Scenario C (Opportunità 120-180gg): per immobili unici o ristrutturazioni di pregio.',
        'Se si opta per un Prezzo Differente (Override): inserire l’importo desiderato e compilare obbligatoriamente le note di perizia motivata nel box "Giustificazione Periziale".',
        'Confermare la delibera: il sistema congela lo snapshot dei parametri per i successivi audit di riconciliazione.'
      ],
      systemAction: 'Viene creato un record immutabile in public.decision_log con timestamp, identificativo dell’agente, versione del modello e metriche target a 14gg.',
      pitfallsToAvoid: 'Evitare override superiori al 10% guidati unicamente dalle pretese emotive del venditore se non supportati da fattori di unicità documentati.'
    },
    {
      id: 'SOP_03',
      code: 'SOP 03',
      title: 'Stress-Test con i Simulatori di Sensibilità',
      timing: 'Giorno T = 0 (Contestuale alla Delibera)',
      role: 'Risk Analyst / Portfolio Manager',
      objective: 'Valutare la resilienza del piano di vendita a shock macroeconomici, rialzi dei tassi di interesse o saturazione dell’offerta concorrente.',
      checklist: [
        'Accedere al simulatore di sensibilità nella scheda immobile o nel Decision Center.',
        'Simulare uno Shock Tassi BCE (+50bps / +100bps): osservare l’incremento della rata di mutuo standard e la conseguente contrazione del bacino di acquirenti qualificati.',
        'Simulare uno Shock di Offerta Concorrente (+3 immobili analoghi in microzona): verificare l’allungamento stimato dei giorni di vendita (DOM).',
        'Verificare la soglia di breakeven e definire a priori il margine massimo di trattativa negoziale (solitamente 3-5%).'
      ],
      systemAction: 'Il simulatore ricalcola in tempo reale le curve di elasticità e restituisce la stima dei DOM e della probabilità di chiusura entro il termine contrattuale.',
      pitfallsToAvoid: 'Non sottovalutare l’effetto combinato di tassi elevati e classe energetica G: la liquidità crolla del 30% se il prezzo non è adeguato.'
    },
    {
      id: 'SOP_04',
      code: 'SOP 04',
      title: 'Checkpoint Empirico a 14-21 Giorni (Step 2)',
      timing: 'Giorno T + 14 / T + 21 (Verifica Mercato)',
      role: 'Broker Incaricato & Team Operativo',
      objective: 'Misurare la reazione reale del mercato nei primi giorni di pubblicazione, calcolare il Market Response Index (MRI) e applicare la prescrizione strategica.',
      checklist: [
        'Aprire la notifica o il pulsante "Checkpoint T+14" nella tabella delle delibere o nell’elenco opportunità.',
        'Inserire i dati consuntivi raccolti dal CRM aziendale e dai portali:',
        '• Contatti / Leads telefonici e via email qualificati ricevuti nei 14 giorni (es. target: 8, effettivi: 3).',
        '• Visite fisiche svolte presso l’immobile con clienti profilati.',
        '• Sentiment prevalente degli acquirenti sul prezzo (Allineato, Eccessivo, Molto Basso).',
        'Esaminare il Market Response Index (MRI calcolato su scala 0-100) e la variazione di confidenza bayesiana (Δ Confidenza).',
        'Adottare la Prescrizione Strategica formulata dal motore (es. Mantenimento Prezzo, Ribasso Rapido del 3.5%, o Potenziamento Campagna Video/Virtual Tour).'
      ],
      systemAction: 'Il sistema confronta i dati previsti a T0 con quelli osservati a T14, aggiorna il prior bayesiano della microzona e formalizza la raccomandazione correttiva.',
      pitfallsToAvoid: 'Non rimandare il checkpoint oltre il 21° giorno: le prime tre settimane rappresentano la finestra d’oro dell’interesse acquirenti (Listing Freshness Decay).'
    },
    {
      id: 'SOP_05',
      code: 'SOP 05',
      title: 'Consuntivazione Finale Mandato, Rogito & Segregazione Bias (Step 3)',
      timing: 'Giorno T + 60 / T + 90 (Chiusura Mandato o Rogito)',
      role: 'Broker Titolare / Compliance Officer',
      objective: 'Chiudere il ciclo contrattuale, registrare il prezzo e i giorni effettivi di vendita, e alimentare la segregazione tra World Model ed Effort Agenziale.',
      checklist: [
        'Aprire la console "Esito Finale T+90" sulla delibera conclusa.',
        'Selezionare l’esito definitivo del mandato (Rogito Perfezionato, Mandato Scaduto, Revoca Venditore, Ritiro dal Mercato).',
        'In caso di vendita: inserire il prezzo effettivo di compravendita a rogito notarile e i giorni totali di permanenza sul mercato (DOM).',
        'Compilare i 3 parametri di Effort Operativo dell’agenzia:',
        '1. Tempo medio di risposta ai lead ricevuti (ore; benchmark eccellenza: < 4 ore).',
        '2. % di visite condotte rispetto alle richieste ricevute (benchmark: > 75%).',
        '3. % di budget marketing effettivamente erogato rispetto al piano concordato.',
        'Verificare la classificazione del bias assegnata dal sistema (ORGANIZATIONAL_INERTIA_BIAS vs WORLD_MODEL_RECALIBRATION).',
        'Confermare la chiusura dell’evento decisionale.'
      ],
      systemAction: 'Il sistema calcola l’Effort Score composito. Se l’effort è basso (< 0.40) sterilizza il World Model per non declassare l’asset. Se l’effort è alto, aggiorna le curve statistiche di mercato.',
      pitfallsToAvoid: 'Non imputare un insuccesso al mercato se i lead sono stati gestiti con oltre 48 ore di ritardo o se non sono state effettuate visite.'
    }
  ];

  const currentSOP = sopList.find(s => s.id === activeTab) || sopList[0];

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header del Manuale Operativo */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Workflow className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight uppercase font-mono text-[13px]">
              Standard Operating Procedures (SOP) per il Team
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            Versione Operativa 1.4
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Le procedure operative standard definiscono le regole di ingaggio obbligatorie per broker, acquisitori e analisti.
          La governance REDIP garantisce che ogni delibera commerciale sia tracciabile, verificabile e protetta da contenziosi o disallineamenti di prezzo.
        </p>

        {/* Workflow visuale 5 Step */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
          {sopList.map((sop, idx) => {
            const isCurrent = sop.id === activeTab;
            return (
              <button
                key={sop.id}
                onClick={() => setActiveTab(sop.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`}>
                    STEP 0{idx + 1}
                  </span>
                  <Clock className="w-3 h-3 text-slate-500" />
                </div>
                <div className={`text-xs font-bold leading-tight line-clamp-2 ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                  {sop.title.split('&')[0]}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                  {sop.timing.split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dettaglio della SOP Selezionata */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {currentSOP.code}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentSOP.timing}
              </span>
            </div>
            <h4 className="text-xl font-bold text-white mt-1">
              {currentSOP.title}
            </h4>
          </div>

          <div className="text-right sm:max-w-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Ruolo Responsabile</span>
            <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 sm:justify-end">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{currentSOP.role}</span>
            </div>
          </div>
        </div>

        {/* Obiettivo */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
          <strong className="text-slate-300 uppercase tracking-wider text-[10px] font-mono block mb-1">
            Obiettivo Operativo:
          </strong>
          <p className="text-slate-200 leading-relaxed font-medium">
            {currentSOP.objective}
          </p>
        </div>

        {/* Checklist Operativa */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />
            Checklist di Esecuzione Operativa (Punto per Punto):
          </span>
          <div className="space-y-1.5">
            {currentSOP.checklist.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                <span className="text-emerald-400 font-mono font-bold text-[11px] shrink-0 mt-0.5">
                  [{idx + 1}]
                </span>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Azione di Sistema & Pitfalls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Azione Automatica del Sistema REDIP
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentSOP.systemAction}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Errore Critico da Evitare (Pitfall)
            </span>
            <p className="text-xs text-rose-200 leading-relaxed">
              {currentSOP.pitfallsToAvoid}
            </p>
          </div>
        </div>
      </div>

      {/* Matrice RACI dei Ruoli Aziendali */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <span>Matrice RACI delle Responsabilità di Processo</span>
        </h4>
        <p className="text-xs text-slate-400">
          R = Responsible (Esegue), A = Accountable (Approva e risponde), C = Consulted (Fornisce input), I = Informed (Riceve telemetria).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-900 text-slate-300 font-mono text-[11px]">
              <tr>
                <th className="p-3 border-b border-slate-800">Fase / Step Operativo</th>
                <th className="p-3 border-b border-slate-800 text-center">Acquisitore</th>
                <th className="p-3 border-b border-slate-800 text-center">Broker Senior</th>
                <th className="p-3 border-b border-slate-800 text-center">Risk Analyst</th>
                <th className="p-3 border-b border-slate-800 text-center">Comitato Investimenti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
              <tr>
                <td className="p-3 font-sans font-medium text-white">SOP 01: Screening & Dossier Preliminare</td>
                <td className="p-3 text-center text-emerald-400 font-bold">R</td>
                <td className="p-3 text-center text-cyan-400 font-bold">A</td>
                <td className="p-3 text-center text-slate-500">C</td>
                <td className="p-3 text-center text-slate-500">I</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-white">SOP 02: Delibera Prezzo & Scelta Scenario (Step 1)</td>
                <td className="p-3 text-center text-slate-500">C</td>
                <td className="p-3 text-center text-emerald-400 font-bold">R</td>
                <td className="p-3 text-center text-slate-500">C</td>
                <td className="p-3 text-center text-cyan-400 font-bold">A</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-white">SOP 03: Stress-Test Sensibilità & Macro Shock</td>
                <td className="p-3 text-center text-slate-500">I</td>
                <td className="p-3 text-center text-slate-500">C</td>
                <td className="p-3 text-center text-emerald-400 font-bold">R / A</td>
                <td className="p-3 text-center text-slate-500">I</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-white">SOP 04: Checkpoint Empirico 14gg & MRI (Step 2)</td>
                <td className="p-3 text-center text-emerald-400 font-bold">R</td>
                <td className="p-3 text-center text-cyan-400 font-bold">A</td>
                <td className="p-3 text-center text-slate-500">I</td>
                <td className="p-3 text-center text-slate-500">I</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-white">SOP 05: Consuntivazione Rogito & Bias (Step 3)</td>
                <td className="p-3 text-center text-slate-500">C</td>
                <td className="p-3 text-center text-emerald-400 font-bold">R</td>
                <td className="p-3 text-center text-slate-500">C</td>
                <td className="p-3 text-center text-cyan-400 font-bold">A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
