import React from 'react';
import { PropertyMarketPair } from '../data/mockProperties';
import { Building2, TrendingUp, AlertTriangle, CheckCircle2, Sliders, ShieldAlert } from 'lucide-react';
import { PropertyData, MarketData } from '../types/proptech';

interface PropertySelectorProps {
  scenarios: PropertyMarketPair[];
  selectedIndex: number;
  onSelectScenario: (index: number) => void;
  activeProperty: PropertyData;
  activeMarket: MarketData | null;
  onUpdateMarket: (updated: MarketData | null) => void;
  onUpdateProperty: (updated: PropertyData) => void;
  isCustomized: boolean;
  onResetToPreset: () => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  scenarios,
  selectedIndex,
  onSelectScenario,
  activeProperty,
  activeMarket,
  onUpdateMarket,
  onUpdateProperty,
  isCustomized,
  onResetToPreset,
}) => {
  const [showTuner, setShowTuner] = React.useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Scenario Benchmark & Ingress Selection
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Testbed Valutativo: Seleziona Immobile o Simula Degradazione
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {isCustomized && (
            <button
              onClick={onResetToPreset}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              Ripristina Preset
            </button>
          )}
          <button
            onClick={() => setShowTuner(!showTuner)}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all ${
              showTuner
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showTuner ? 'Nascondi Tuner Dati' : 'Simula Dati Mancanti (Tuner)'}</span>
          </button>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((item, idx) => {
          const isSelected = selectedIndex === idx && !isCustomized;
          return (
            <button
              key={idx}
              onClick={() => {
                onSelectScenario(idx);
              }}
              className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      item.dataCompleteness === 'FULL'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.dataCompleteness === 'PARTIAL'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {item.dataCompleteness === 'FULL' && 'Dati Completi'}
                    {item.dataCompleteness === 'PARTIAL' && 'Dati Parziali'}
                    {item.dataCompleteness === 'SPARSE' && 'Dati Assenti'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {item.property.city}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                  {item.property.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.scenarioDescription}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 font-mono">
                <span>€ {item.property.asking_price.toLocaleString('it-IT')}</span>
                <span className="text-slate-400 font-sans font-normal text-[11px]">{item.property.square_meters} mq</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Data Tuner Panel (Graceful Degradation Simulator) */}
      {showTuner && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">
                Graceful Degradation Tuner: Iniezione Dinamica Dati Mancanti
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Modifica i segnali di mercato per testare la caduta controllata di confidence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Toggle 1: Comparabili */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700">Comparabili Recenti</span>
                <span className="text-[10px] font-mono text-amber-700 font-bold">-25 pts se assente</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (activeMarket) {
                      onUpdateMarket({ ...activeMarket, comparables_count: 12 });
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    activeMarket && (activeMarket.comparables_count || 0) >= 3
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Presenti (12)
                </button>
                <button
                  onClick={() => {
                    if (activeMarket) {
                      onUpdateMarket({ ...activeMarket, comparables_count: 0 });
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    activeMarket && (activeMarket.comparables_count === 0 || !activeMarket.comparables_count)
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Assenti (0)
                </button>
              </div>
            </div>

            {/* Toggle 2: Indice Domanda */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700">Pressione Domanda</span>
                <span className="text-[10px] font-mono text-amber-700 font-bold">-20 pts se nullo</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (activeMarket) {
                      onUpdateMarket({ ...activeMarket, demand_intensity_index: 85 });
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    activeMarket && activeMarket.demand_intensity_index !== null
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Attivo (85/100)
                </button>
                <button
                  onClick={() => {
                    if (activeMarket) {
                      onUpdateMarket({ ...activeMarket, demand_intensity_index: null });
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    activeMarket && activeMarket.demand_intensity_index === null
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mancante (NULL)
                </button>
              </div>
            </div>

            {/* Toggle 3: Assorbimento Mensile */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700">Tasso Assorbimento</span>
                <span className="text-[10px] font-mono text-amber-700 font-bold">-15 pts se nullo</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (activeMarket) {
                      onUpdateMarket({ ...activeMarket, monthly_absorption_rate: 24.5 });
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    activeMarket && activeMarket.monthly_absorption_rate !== null
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Calcolato (24%)
                </button>
                <button
                  onClick={() => {
                    if (activeMarket) {
                      onUpdateMarket({ ...activeMarket, monthly_absorption_rate: null });
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    activeMarket && activeMarket.monthly_absorption_rate === null
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mancante (NULL)
                </button>
              </div>
            </div>

            {/* Toggle 4: Classe Energetica Immobile */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700">Attestato APE</span>
                <span className="text-[10px] font-mono text-amber-700 font-bold">-10 pts se nullo</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    onUpdateProperty({ ...activeProperty, energy_class: 'B' });
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    activeProperty.energy_class
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Presente (Cl. B)
                </button>
                <button
                  onClick={() => {
                    onUpdateProperty({ ...activeProperty, energy_class: null });
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex-1 transition-all ${
                    !activeProperty.energy_class
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mancante (NULL)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
