import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Percent, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { DATA_SOURCES_CATALOG } from '../../data/mockIntelligenceDatabase';
import { DataSourceItem } from '../../types/intelligence';

export const DataSourcesCatalogSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['ALL', 'Property Data', 'Market Data', 'Territorial & GIS', 'Environmental Data', 'Macroeconomic'];

  const filteredSources = DATA_SOURCES_CATALOG.filter((source: DataSourceItem) => {
    const matchCategory = selectedCategory === 'ALL' || source.category === selectedCategory;
    const matchSearch = searchTerm === '' || 
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.confidenceImpact.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header Catalogo */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Database className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight uppercase font-mono text-[13px]">
              Catalogo Sorgenti Dati & Pipeline di Telemetria
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            {DATA_SOURCES_CATALOG.length} Fonti Monitorate
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          REDIP aggrega registri pubblici catastali, osservatori immobiliari ufficiali, dati satellitari, telemetria ambientale e indicatori macroeconomici della Banca Centrale.
          Nel prototipo dimostrativo, ciascuna sorgente è collegata a generatori sintetici realistici che replicano la latenza e la precisione dei feed di produzione.
        </p>

        {/* Filtri e Ricerca */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca per nome sorgente, provider o impatto sulla confidenza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Tutte' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Griglia delle Sorgenti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source: DataSourceItem) => (
          <div 
            key={source.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                  {source.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {source.name}
                </h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Provider: <strong className="text-slate-300">{source.provider}</strong>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                source.status === 'CONNECTED'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
              }`}>
                {source.status === 'CONNECTED' ? 'LIVE API' : 'SIMULATA (DEMO)'}
              </span>
            </div>

            {/* Metriche Chiave */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/60 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 text-[9px] uppercase block">Copertura</span>
                <span className="font-bold text-slate-200">{source.coveragePct}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase block">Qualità</span>
                <span className="font-bold text-emerald-400">{source.qualityScore}/100</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase block">Aggiornamento</span>
                <span className="font-bold text-slate-300">{source.freshness}</span>
              </div>
            </div>

            {/* Impatto Confidenza */}
            <div className="text-xs space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">
                Contributo al Modello di Confidenza:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
                {source.confidenceImpact}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
              <span>Record: {source.recordsCount}</span>
              <span>Sync: {source.lastSync}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
