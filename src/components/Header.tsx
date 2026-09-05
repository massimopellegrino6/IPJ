import React from 'react';
import { Search, Bell, MapPin, Calendar, Bot, RefreshCw } from 'lucide-react';

interface HeaderProps {
  selectedTerritory: string;
  onTerritoryChange: (territory: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedTerritory,
  onTerritoryChange,
  selectedPeriod,
  onPeriodChange,
  searchQuery,
  onSearchChange,
  onOpenAssistant
}) => {
  const territories = ['Tutti i Territori', 'Roma', 'Milano', 'Torino', 'Bologna', 'Firenze'];
  const periods = ['Q3 2026 (Attivo)', 'Ultimi 30 Giorni', 'Ultimi 90 Giorni', 'Da Inizio Anno'];

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca per indirizzo, codice OMI, microzona o ID immobile..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Right Controls: Filters, Sync Status, Notifications, AI Assistant, User Profile */}
      <div className="flex items-center gap-3">
        {/* Territory Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedTerritory}
            onChange={(e) => onTerritoryChange(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
          >
            {territories.map((t) => (
              <option key={t} value={t} className="bg-slate-900 text-white">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Analyzed Period */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
          >
            {periods.map((p) => (
              <option key={p} value={p} className="bg-slate-900 text-white">
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Data Freshness Live Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin-slow" />
          <span>Dataset demo aggiornato</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-semibold">Prototype v0.1</span>
        </div>

        {/* AI Assistant Button (Discrete, non-intrusive) */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-colors"
          title="Apri Co-pilota Decisionale AI"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium hidden sm:inline">Co-pilota AI</span>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors relative" title="Notifiche">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            MR
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">Marco Rossi</span>
            <span className="text-[10px] text-slate-400 font-medium">Head of Acquisitions</span>
          </div>
        </div>
      </div>
    </header>
  );
};
