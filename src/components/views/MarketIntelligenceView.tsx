import React, { useState } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Clock, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Radio
} from 'lucide-react';
import { TerritoryMetric } from '../../types/intelligence';

interface MarketIntelligenceViewProps {
  territories: TerritoryMetric[];
  selectedTerritory: string;
  onSelectTerritory: (territory: string) => void;
}

export const MarketIntelligenceView: React.FC<MarketIntelligenceViewProps> = ({
  territories,
  selectedTerritory,
  onSelectTerritory
}) => {
  const [selectedCityFilter, setSelectedCityFilter] = useState('ALL');

  const filtered = selectedCityFilter === 'ALL'
    ? territories 
    : territories.filter(t => t.city === selectedCityFilter);

  // Microzone Analysis Data required by Section 9
  const microzones = [
    {
      name: 'Roma Nord (Fleming, Vigna Clara)',
      city: 'Roma',
      avgRating: 81,
      avgPricePerSqm: 4650,
      avgTimeToSale: 44,
      demandIndex: 88,
      trend: '+18% domanda',
      isGrowth: true,
      status: 'In Forte Crescita'
    },
    {
      name: 'Roma Prati / Delle Vittorie',
      city: 'Roma',
      avgRating: 83,
      avgPricePerSqm: 5200,
      avgTimeToSale: 48,
      demandIndex: 84,
      trend: '+4.2% prezzi',
      isGrowth: true,
      status: 'Stabile / Solido'
    },
    {
      name: 'Milano Centro / Brera',
      city: 'Milano',
      avgRating: 88,
      avgPricePerSqm: 9800,
      avgTimeToSale: 62,
      demandIndex: 76,
      trend: '+11% inventario',
      isGrowth: false,
      status: 'Allungamento Tempi'
    },
    {
      name: 'Milano Porta Romana',
      city: 'Milano',
      avgRating: 79,
      avgPricePerSqm: 6400,
      avgTimeToSale: 41,
      demandIndex: 89,
      trend: '+9.1% domanda',
      isGrowth: true,
      status: 'In Forte Crescita'
    },
    {
      name: 'Bologna Murri / Saragozza',
      city: 'Bologna',
      avgRating: 75,
      avgPricePerSqm: 3850,
      avgTimeToSale: 58,
      demandIndex: 68,
      trend: '-14gg liquidità',
      isGrowth: false,
      status: 'Rallentamento'
    },
    {
      name: 'Torino Crocetta',
      city: 'Torino',
      avgRating: 77,
      avgPricePerSqm: 3100,
      avgTimeToSale: 52,
      demandIndex: 74,
      trend: '+2.4% prezzi',
      isGrowth: true,
      status: 'Stabile'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Osservatorio Territoriale & Flussi di Mercato
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Market Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            “Cosa sta succedendo nel mercato? Quali microzone stanno crescendo? Dove si stanno allungando i tempi di vendita?”
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Aggiornamento Flussi:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">Tempo Reale (2026-S1)</span>
        </div>
      </div>

      {/* 1. SIX CORE MACRO INDICATORS (Richiesti da Section 9) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Market Liquidity Index */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Liquidity Index</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">74.5</div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+2.8 pt MoM</span>
          </div>
        </div>

        {/* Average Price / sqm */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Avg Price / sqm</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">€4,120</div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+1.4% trimestrale</span>
          </div>
        </div>

        {/* Market Demand Trend */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Demand Trend</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">+6.8%</div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-0.5">
            <span>Forte interesse</span>
          </div>
        </div>

        {/* Transaction Volume */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Transaction Vol.</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">1,420</div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            Rogiti registrati
          </div>
        </div>

        {/* Time-on-Market Trend */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Time-on-Market</span>
          <div className="text-2xl font-mono font-extrabold text-cyan-300 mt-1">54 gg</div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-0.5">
            <ArrowDownRight className="w-3 h-3" />
            <span>-8 giorni vs 2025</span>
          </div>
        </div>

        {/* Inventory Trend */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Inventory Trend</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">+3.2%</div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            Annunci attivi
          </div>
        </div>
      </div>

      {/* 2. MICROZONE ANALYSIS TABLE & TELEMETRY */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Microzone Analysis & Dinamica Territoriale
            </h3>
            <p className="text-xs text-slate-400">
              Analisi incrociata tra rating medio, prezzo unitario, giorni di vendita e indice di pressione della domanda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-mono">Filtra:</span>
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono cursor-pointer"
            >
              <option value="ALL">Tutte le Città</option>
              <option value="Roma">Roma</option>
              <option value="Milano">Milano</option>
              <option value="Bologna">Bologna</option>
              <option value="Torino">Torino</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4 font-sans">Microzona</th>
                <th className="py-3 px-3 text-center">Avg Rating</th>
                <th className="py-3 px-3 text-right">Avg Price / sqm</th>
                <th className="py-3 px-3 text-center">Avg Time to Sale</th>
                <th className="py-3 px-3 text-center">Demand Index</th>
                <th className="py-3 px-3 text-center">Trend Rilevato</th>
                <th className="py-3 px-3 text-right font-sans">Dinamica Mercato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {microzones
                .filter(m => selectedCityFilter === 'ALL' || m.city === selectedCityFilter)
                .map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-white text-xs">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.city}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-white text-sm">{m.avgRating}</span>
                      <span className="text-slate-400 text-[10px]">/100</span>
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      €{m.avgPricePerSqm.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center text-white font-bold">
                      {m.avgTimeToSale} giorni
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        {m.demandIndex}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        m.isGrowth ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {m.trend}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <span className="text-xs font-semibold text-slate-300">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
