import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Activity,
  Server,
  Zap
} from 'lucide-react';

export const DataIntegrationsView: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 minuti fa');

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSyncTime('Pochi secondi fa');
    }, 1500);
  };

  // Exactly the 8 sources specified in Section 16
  const dataSources = [
    {
      id: 'ds_omi',
      name: 'Agenzia delle Entrate (OMI)',
      category: 'Quotazioni Ufficiali & Bande di Valore',
      provider: 'Banca Dati OMI - Min. Economia e Finanze',
      status: 'CONNECTED',
      latency: '24ms',
      qualityScore: 98,
      coveragePct: 99.4,
      freshness: 'Semestrale 2026-S1',
      recordsCount: '3.4M microzone storiche',
      description: 'Valori minimi e massimi di compravendita e locazione per zona omogenea OMI.'
    },
    {
      id: 'ds_conservatoria',
      name: 'Conservatoria / Atti Notarili',
      category: 'Verità Contrattuale a Rogito',
      provider: 'Registri Immobiliari & Agenzia Entrate',
      status: 'CONNECTED',
      latency: '42ms',
      qualityScore: 99,
      coveragePct: 96.8,
      freshness: 'Settimanale (Batch)',
      recordsCount: '184k atti notarili registrati',
      description: 'Prezzi di vendita reali trascritti nei rogiti notarili per calibrazione edonica del modello.'
    },
    {
      id: 'ds_portali',
      name: 'Portali Immobiliari',
      category: 'Offerta Concorrente & Prezzi di Vetrina',
      provider: 'Aggregatore Multi-Portal (Immobiliare, Idealista, Casa)',
      status: 'CONNECTED',
      latency: '15ms',
      qualityScore: 92,
      coveragePct: 98.2,
      freshness: 'Tempo Reale (Webhooks)',
      recordsCount: '420k annunci monitorati',
      description: 'Monitoraggio dinamico dei ribassi di prezzo, giorni sul mercato (DOM) e duplicazioni.'
    },
    {
      id: 'ds_catasto',
      name: 'Catasto',
      category: 'Dati Fabbricati & Planimetrie',
      provider: 'Agenzia delle Entrate - Territorio',
      status: 'CONNECTED',
      latency: '35ms',
      qualityScore: 97,
      coveragePct: 99.1,
      freshness: 'Aggiornato al rogito',
      recordsCount: 'Planimetrie vettoriali & visure',
      description: 'Rendita catastale, foglio, particella, subalterno, categoria catastale (A/2, A/3) e consistenza vani.'
    },
    {
      id: 'ds_crm',
      name: 'CRM Agenzia',
      category: 'Domanda Locale & Richieste Acquirenti',
      provider: 'Database Gestionale Agenzia Interno',
      status: 'CONNECTED',
      latency: '8ms',
      qualityScore: 95,
      coveragePct: 100,
      freshness: 'Tempo Reale (Bilocale/Trilocale Sync)',
      recordsCount: '148 acquirenti profilati',
      description: 'Profili di ricerca acquirenti, budget verificato, delibere mutuo e storico visite effettuate.'
    },
    {
      id: 'ds_istat',
      name: 'Dati Demografici / ISTAT',
      category: 'Popolazione, Reddito & Densità',
      provider: 'Istituto Nazionale di Statistica (ISTAT)',
      status: 'CONNECTED',
      latency: '60ms',
      qualityScore: 96,
      coveragePct: 100,
      freshness: 'Annuale 2025/2026',
      recordsCount: 'Censimento sezioni urbane',
      description: 'Composizione dei nuclei familiari, reddito medio dichiarato per CAP e proiezioni di crescita.'
    },
    {
      id: 'ds_mobility',
      name: 'Dati Mobilità / Trasporti',
      category: 'Accessibilità & Rete TPL',
      provider: 'OpenStreetMap & Agenzie Mobilità Urbana',
      status: 'CONNECTED',
      latency: '18ms',
      qualityScore: 94,
      coveragePct: 97.5,
      freshness: 'Giornaliero',
      recordsCount: 'Linee Metro, Tram, Bus & FS',
      description: 'Isochrone a piedi (5-10-15 minuti), stazioni metro, fermate tram e accessibilità autostradale.'
    },
    {
      id: 'ds_urbanistica',
      name: 'Piani Urbanistici',
      category: 'Rigenerazione & Vincoli Edificatori',
      provider: 'Geoportali Comunali (PRG, PGT, PUMS)',
      status: 'CONNECTED',
      latency: '85ms',
      qualityScore: 91,
      coveragePct: 93.0,
      freshness: 'Trimestrale',
      recordsCount: 'Piani di Rigenerazione 2026-2030',
      description: 'Progetti di riqualificazione urbana, vincoli storici/paesaggistici e nuove infrastrutture previste.'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Data Architecture & Ingestion Pipeline
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Data Integrations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            “Da dove arrivano i dati?” Fonti verificate con stato connettività, latency e indice di qualità del dato.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs font-mono text-slate-400 hidden sm:block">
            <span>Ultima Sincronizzazione:</span>
            <div className="text-emerald-400 font-bold">{lastSyncTime}</div>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizzazione in corso...' : 'Forza Sincronizzazione'}</span>
          </button>
        </div>
      </div>

      {/* 1. DATA SOURCES SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Fonti Integrate</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">8 su 8 Attive</div>
          <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">100% Operative</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Latency Media API</span>
          <div className="text-2xl font-mono font-extrabold text-cyan-300 mt-1">35 ms</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">High Performance Ingestion</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Qualità Media Dato</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">95.6 / 100</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Standard Fiduciario Istituzionale</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Copertura Territoriale</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">97.8%</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Roma, Milano, Bologna, Torino</span>
        </div>
      </div>

      {/* 2. THE 8 DATA SOURCES CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataSources.map((ds) => (
          <div
            key={ds.id}
            className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-xs hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{ds.name}</h3>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold block mt-0.5">
                  {ds.category} • {ds.provider}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ds.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {ds.description}
            </p>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase">Latency</span>
                <span className="text-cyan-300 font-bold">{ds.latency}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase">Qualità Dato</span>
                <span className="text-emerald-400 font-bold">{ds.qualityScore}/100</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase">Copertura</span>
                <span className="text-white font-bold">{ds.coveragePct}%</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase">Aggiornamento</span>
                <span className="text-slate-300 font-medium text-[10px] truncate block">{ds.freshness}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
