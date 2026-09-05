import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { PropertyItem, SubDimension, ActionScenario } from '../../types/intelligence';
import { RatingBadge } from '../badges/RatingBadge';
import { ConfidenceBadge } from '../badges/ConfidenceBadge';
import { AgencyFitBadge } from '../badges/AgencyFitBadge';
import { PropertyIntelligenceView } from './PropertyIntelligenceView';

interface PropertiesViewProps {
  properties: PropertyItem[];
  selectedProperty: PropertyItem;
  onSelectProperty: (property: PropertyItem) => void;
  onOpenExplainability: (dimensionKey: string, subDimension?: SubDimension) => void;
  onOpenDecisionModal: (scenario: ActionScenario) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onOpenExplainability,
  onOpenDecisionModal
}) => {
  const [viewState, setViewState] = useState<'database' | 'intelligence'>('database');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filtered = properties.filter(p => {
    if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.microZone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDetail = (prop: PropertyItem) => {
    onSelectProperty(prop);
    setViewState('intelligence');
  };

  if (viewState === 'intelligence') {
    return (
      <PropertyIntelligenceView
        property={selectedProperty}
        allProperties={properties}
        onSelectProperty={onSelectProperty}
        onOpenExplainability={onOpenExplainability}
        onOpenDecisionModal={onOpenDecisionModal}
        onBack={() => setViewState('database')}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Database Istituzionale Immobili
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Properties Database & Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Archivio centralizzato del patrimonio immobiliare con telemetria quantitativa e accesso alla Scheda Property Intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewState('intelligence')}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Apri Scheda Selezionata ({selectedProperty.code})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per codice, titolo o microzona..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Città:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono cursor-pointer"
          >
            <option value="ALL">Tutte</option>
            <option value="Roma">Roma</option>
            <option value="Milano">Milano</option>
            <option value="Torino">Torino</option>
            <option value="Bologna">Bologna</option>
            <option value="Firenze">Firenze</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Stato:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono cursor-pointer"
          >
            <option value="ALL">Tutti gli stati</option>
            <option value="Active">Attivo</option>
            <option value="Review Required">Revisione Richiesta</option>
          </select>
        </div>
      </div>

      {/* Database Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prop) => {
          const isCurrent = prop.id === selectedProperty.id;

          return (
            <div
              key={prop.id}
              onClick={() => handleOpenDetail(prop)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isCurrent
                  ? 'bg-slate-900/90 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-md'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                      {prop.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 hover:text-emerald-400 transition-colors">
                      {prop.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono">
                      {prop.microZone} • {prop.city}
                    </div>
                  </div>

                  <RatingBadge score={prop.realEstateRating} classification={prop.ratingClassification} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Richiesta:</span>
                    <span className="text-white font-bold">€{prop.askingPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Fair Value:</span>
                    <span className="text-emerald-400 font-bold">€{prop.estimatedFairValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Agency Fit:</span>
                    <span className="text-cyan-300 font-bold">{prop.agencyFit.score}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Confidenza:</span>
                    <span className="text-white font-bold">{prop.ratingConfidence}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-mono">
                  {prop.squareMeters} m² • {prop.rooms} Locali
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 hover:underline">
                  <span>Apri Scheda</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
