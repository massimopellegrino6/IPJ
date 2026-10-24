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
      freshness: 'Semestrale 2026-S1 (Ingestion Reale)',
      recordsCount: '3.4M microzone storiche',
      description: 'Valori minimi e massimi di compravendita e locazione per zona omogenea OMI per calcolo Price Fit.'
    },
    {
      id: 'ds_conservatoria',
      name: 'Rogiti Notarili & Comparabili MCA (Strada C)',
      category: 'Verità Contrattuale & Closed-Loop Agenzia',
      provider: 'REDIP Closed-Loop + Ingestion Storico CSV Agenzia',
      status: 'CONNECTED',
      latency: '5ms',
      qualityScore: 98,
      coveragePct: 97.4,
      freshness: 'Tempo Reale & Ingestion CSV',
      recordsCount: 'Rogiti verificati con rettifiche edoniche marginali',
      description: 'Motore MCA edonico con rettifiche IVS (piano, ascensore, stato, classe energetica) e fallback deterministico OMI con penalità di confidenza (§28).'
    },
    {
      id: 'ds_portali',
      name: 'Portali Immobiliari',
      category: 'Offerta Concorrente & Prezzi di Vetrina',
      provider: 'Aggregatore Multi-Portal (Immobiliare, Idealista, Casa)',
      status: 'SIMULATED',
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
      status: 'SIMULATED',
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
      status: 'SIMULATED',
      latency: '8ms',
      qualityScore: 95,
      coveragePct: 100,
      freshness: 'Tempo Reale (Bilocale/Trilocale Sync)',
      recordsCount: '148 acquirenti profilati',
      description: 'Profili di ricerca acquirenti, budget verificato, delibere mutuo e storico visite effettuate.'
    },
    {
      id: 'ds_istat',
      name: 'ISTAT Demografia (SDMX REST)',
      category: 'Popolazione, Densità & Famiglie',
      provider: 'Istituto Nazionale di Statistica (ISTAT) - Endpoint SDMX DCIS_POPRES1',
      status: 'CONNECTED',
      latency: '145ms',
      qualityScore: 98,
      coveragePct: 100,
      freshness: 'Bilancio Censuario 2024/2025 (Live SDMX + Cache 30gg)',
      recordsCount: '7.904 Comuni (Popolazione, Densità, Vecchiaia, Target Famiglie)',
      description: 'Connettore REST SDMX governativo con timeout a 2500ms, cache in-memory 30gg e Graceful Degradation provinciale/regionale (§28). Alimenta Pilastro 7 (Macro & Time, 8%) e Demand Match CRM.'
    },
    {
      id: 'ds_mobility',
      name: 'OpenStreetMap (Overpass API)',
      category: 'Accessibilità, POI & Rete TPL',
      provider: 'OpenStreetMap Foundation (Overpass Live QL)',
      status: 'CONNECTED',
      latency: '18ms',
      qualityScore: 96,
      coveragePct: 99.5,
      freshness: 'Tempo Reale (Overpass API)',
      recordsCount: 'Nodi geospaziali 350m/500m',
      description: 'Stazioni metro, fermate bus, scuole, farmacie, supermercati e parchi con calcolo Walkability Index.'
    },
    {
      id: 'ds_macro',
      name: 'BCE & Banca d\'Italia',
      category: 'Macroeconomia, Credito & Tassi Mutuo',
      provider: 'Banca Centrale Europea & Banca d\'Italia',
      status: 'CONNECTED',
      latency: '12ms',
      qualityScore: 99,
      coveragePct: 100.0,
      freshness: 'Snapshot Tempo Reale',
      recordsCount: 'Euribor 3M/6M, EurIRS 20Y, TAEG Mutui',
      description: 'Parametri del costo del denaro, liquidità creditizia e coefficiente di assorbimento DOM sul mercato residenziale.'
    },
    {
      id: 'ds_urbanistica',
      name: 'ISPRA IdroGEO & Protezione Civile',
      category: 'Rischio Idrogeologico, Alluvioni & Sismicità',
      provider: 'ISPRA (IdroGEO / Direttiva 2007/60/CE) & Prot. Civile (OPCM 3274)',
      status: 'CONNECTED (ISPRA/PC)',
      latency: '42ms',
      qualityScore: 98,
      coveragePct: 100.0,
      freshness: 'Tempo Reale (Open Data ISPRA / PCIV WFS)',
      recordsCount: 'Perimetri PAI Frane, Alluvioni P1/P2/P3 e Zonizzazione Sismica Nazionale',
      description: 'Verifica georeferenziata dei rischi di dissesto idrogeologico, pericolosità idraulica ex Direttiva Alluvioni e zonizzazione sismica ufficiale. Alimenta il Pilastro 4 (Asset Risk Index, 15%) e i controlli asseverativi D.P.R. 380/2001.'
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
            Anteprima delle fonti previste: connettività, latenza e qualità sono valori simulati per validare l’esperienza.
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
            <span>{syncing ? 'Simulazione in corso...' : 'Simula sincronizzazione'}</span>
          </button>
        </div>
      </div>

      {/* 1. DATA SOURCES SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Fonti Integrate</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">5 fonti connesse</div>
          <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">OSM, OMI, ISTAT, ISPRA/PC, BCE</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Latency Media API</span>
          <div className="text-2xl font-mono font-extrabold text-cyan-300 mt-1">35 ms</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">High Performance Ingestion</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Qualità Media Dato</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">96.8 / 100</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Standard Fiduciario Istituzionale</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Copertura Territoriale</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">98.5%</div>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">7.904 Comuni Catasto & ISTAT</span>
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
              <div className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border ${
                ds.status.includes('CONNECTED')
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/60'
                  : 'text-amber-300 bg-amber-950/40 border-amber-500/40'
              }`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${ds.status.includes('CONNECTED') ? 'text-emerald-400' : 'text-amber-400'}`} />
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
