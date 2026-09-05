import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  Layers, 
  Search, 
  SlidersHorizontal, 
  CheckSquare, 
  Square, 
  ChevronRight,
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  ListOrdered,
  Eye,
  Bookmark,
  Building2,
  DollarSign,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { RatingBadge } from '../badges/RatingBadge';
import { ConfidenceBadge } from '../badges/ConfidenceBadge';
import { AgencyFitBadge } from '../badges/AgencyFitBadge';

interface OpportunitiesViewProps {
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
  onCompareProperties: (properties: PropertyItem[]) => void;
}

type ViewMode = 'explorer' | 'ranking' | 'map' | 'watchlist';
type RankingMetric = 'rating' | 'fit' | 'priceFit' | 'demand' | 'liquidity' | 'risk' | 'confidence';

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  properties,
  onSelectProperty,
  onCompareProperties
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [minAgencyFit, setMinAgencyFit] = useState<number>(0);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [sortField, setSortField] = useState<string>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Watchlist state (seeded with 3 properties)
  const [watchlistIds, setWatchlistIds] = useState<string[]>([
    'prop_rm_roma_18',
    'prop_rm_francia_42',
    'prop_rm_nomentana_221'
  ]);

  // Selected property on map
  const [mapSelectedProperty, setMapSelectedProperty] = useState<PropertyItem | null>(null);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;
      if (selectedType !== 'ALL' && p.propertyType !== selectedType) return false;
      if (p.realEstateRating < minRating) return false;
      if (p.agencyFit.score < minAgencyFit) return false;
      if (p.ratingConfidence < minConfidence) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.microZone.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [properties, selectedCity, selectedType, minRating, minAgencyFit, minConfidence, searchQuery]);

  // Sorted properties for Explorer
  const sortedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'rating') {
        valA = a.realEstateRating;
        valB = b.realEstateRating;
      } else if (sortField === 'fit') {
        valA = a.agencyFit.score;
        valB = b.agencyFit.score;
      } else if (sortField === 'price') {
        valA = a.askingPrice;
        valB = b.askingPrice;
      } else if (sortField === 'fairValue') {
        valA = a.estimatedFairValue;
        valB = b.estimatedFairValue;
      } else if (sortField === 'liquidity') {
        valA = 100 - a.estimatedTimeToSaleDays;
        valB = 100 - b.estimatedTimeToSaleDays;
      } else if (sortField === 'confidence') {
        valA = a.ratingConfidence;
        valB = b.ratingConfidence;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [filteredProperties, sortField, sortOrder]);

  // Ranked properties for Ranking mode
  const rankedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      if (rankingMetric === 'rating') return b.realEstateRating - a.realEstateRating;
      if (rankingMetric === 'fit') return b.agencyFit.score - a.agencyFit.score;
      if (rankingMetric === 'priceFit') return a.priceDifferencePct - b.priceDifferencePct; // lower/negative is better discount
      if (rankingMetric === 'demand') {
        const demA = a.dimensions.find(d => d.key === 'market')?.score || 50;
        const demB = b.dimensions.find(d => d.key === 'market')?.score || 50;
        return demB - demA;
      }
      if (rankingMetric === 'liquidity') return a.estimatedTimeToSaleDays - b.estimatedTimeToSaleDays; // faster is better
      if (rankingMetric === 'risk') {
        const riskA = a.dimensions.find(d => d.key === 'risk')?.score || 50;
        const riskB = b.dimensions.find(d => d.key === 'risk')?.score || 50;
        return riskB - riskA; // higher score = lower risk
      }
      if (rankingMetric === 'confidence') return b.ratingConfidence - a.ratingConfidence;
      return 0;
    });
  }, [filteredProperties, rankingMetric]);

  // Watchlist properties with simulated recent changes
  const watchlistProperties = useMemo(() => {
    return properties.filter(p => watchlistIds.includes(p.id)).map(p => {
      let recentEvent = 'Nessuna variazione recente';
      let eventType: 'rating' | 'price' | 'market' | 'comparable' | 'risk' | 'fit' = 'rating';
      
      if (p.id === 'prop_rm_roma_18') {
        recentEvent = 'Rating change: 82 → 69 (-13) • Domanda in calo';
        eventType = 'rating';
      } else if (p.id === 'prop_rm_francia_42') {
        recentEvent = 'Price change: Ribasso del -8.4% richiesto dal proprietario';
        eventType = 'price';
      } else if (p.id === 'prop_rm_nomentana_221') {
        recentEvent = 'Agency Fit change: +5 nuovi acquirenti qualificati in CRM';
        eventType = 'fit';
      } else if (p.priceDifferencePct < -5) {
        recentEvent = `New comparable: Registrato rogito a €${p.pricePerSqm + 180}/m²`;
        eventType = 'comparable';
      } else {
        recentEvent = 'Market change: Tempo medio di vendita in aumento (+4gg)';
        eventType = 'market';
      }

      return {
        ...p,
        recentEvent,
        eventType
      };
    });
  }, [properties, watchlistIds]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleWatchlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlistIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCompareTrigger = () => {
    const selectedProps = properties.filter(p => selectedIds.includes(p.id));
    if (selectedProps.length >= 2) {
      onCompareProperties(selectedProps);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Motore di Screening Quantitativo
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Opportunities Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Screening multidimensionale tra Real Estate Rating, Valore Congruo edonico e sinergia con la domanda agenzia.
          </p>
        </div>

        {/* Top Controls: Mode Switcher & Compare */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('explorer')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'explorer'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explorer</span>
            </button>
            <button
              onClick={() => setViewMode('ranking')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'ranking'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ranking</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Opportunity Map</span>
            </button>
            <button
              onClick={() => setViewMode('watchlist')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'watchlist'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Watchlist ({watchlistIds.length})</span>
            </button>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompareTrigger}
            disabled={selectedIds.length < 2 || selectedIds.length > 4}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              selectedIds.length >= 2 && selectedIds.length <= 4
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer'
                : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Confronta ({selectedIds.length}/4)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per indirizzo, codice OMI o microzona..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* City */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Città:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none cursor-pointer font-mono"
            >
              <option value="ALL">Tutte le Città</option>
              <option value="Roma">Roma</option>
              <option value="Milano">Milano</option>
              <option value="Torino">Torino</option>
              <option value="Bologna">Bologna</option>
              <option value="Firenze">Firenze</option>
            </select>
          </div>

          {/* Property Type */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Tipologia:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none cursor-pointer font-mono"
            >
              <option value="ALL">Tutte</option>
              <option value="Apartment">Appartamento</option>
              <option value="Penthouse">Attico</option>
              <option value="Villa">Villa</option>
            </select>
          </div>

          {/* Min Rating Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Min Rating:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-20 accent-emerald-500"
            />
            <span className="font-mono text-xs text-emerald-400 font-bold w-6">{minRating}</span>
          </div>

          {/* Min Fit Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Min Fit:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minAgencyFit}
              onChange={(e) => setMinAgencyFit(Number(e.target.value))}
              className="w-20 accent-cyan-500"
            />
            <span className="font-mono text-xs text-cyan-300 font-bold w-6">{minAgencyFit}</span>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: OPPORTUNITY EXPLORER TABLE */}
      {viewMode === 'explorer' && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-950 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">Sel</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3 text-right cursor-pointer" onClick={() => { setSortField('price'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Asking Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer" onClick={() => { setSortField('fairValue'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Fair Value {sortField === 'fairValue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-3 text-center cursor-pointer" onClick={() => { setSortField('rating'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Rating {sortField === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-2 text-center">Trend</th>
                  <th className="py-3 px-3 text-center cursor-pointer" onClick={() => { setSortField('fit'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Agency Fit {sortField === 'fit' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-3 text-center">Liquidity</th>
                  <th className="py-3 px-3 text-center">Risk</th>
                  <th className="py-3 px-3 text-center">Confidence</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {sortedProperties.map((prop) => {
                  const isSelected = selectedIds.includes(prop.id);
                  const isWatched = watchlistIds.includes(prop.id);
                  const riskDimension = prop.dimensions.find(d => d.key === 'risk')?.score || 80;

                  return (
                    <tr
                      key={prop.id}
                      onClick={() => onSelectProperty(prop)}
                      className={`hover:bg-slate-900/80 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Select checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => toggleSelect(prop.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 hover:text-slate-400 mx-auto" />
                        )}
                      </td>

                      {/* Property Title & Code */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors text-xs flex items-center gap-1.5">
                          <span>{prop.title}</span>
                          {prop.priority === 'HIGH' && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                              PRIORITY
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {prop.code} • {prop.squareMeters} m² • Piano {prop.floor}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 font-sans">
                        <div className="text-white text-xs font-medium">{prop.city}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{prop.microZone}</div>
                      </td>

                      {/* Asking Price */}
                      <td className="py-3 px-3 text-right text-white font-bold text-xs">
                        €{prop.askingPrice.toLocaleString()}
                      </td>

                      {/* Fair Value */}
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold text-xs">
                        €{prop.estimatedFairValue.toLocaleString()}
                        <span className={`block text-[10px] font-normal ${prop.priceDifferencePct < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {prop.priceDifferencePct > 0 ? `+${prop.priceDifferencePct}%` : `${prop.priceDifferencePct}%`}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3 text-center">
                        <RatingBadge score={prop.realEstateRating} classification={prop.ratingClassification} size="sm" />
                      </td>

                      {/* Trend */}
                      <td className="py-3 px-2 text-center text-xs">
                        {prop.ratingTrend30d >= 0 ? (
                          <span className="text-emerald-400 font-bold">+{prop.ratingTrend30d}</span>
                        ) : (
                          <span className="text-rose-400 font-bold">{prop.ratingTrend30d}</span>
                        )}
                      </td>

                      {/* Agency Fit */}
                      <td className="py-3 px-3 text-center">
                        <AgencyFitBadge score={prop.agencyFit.score} size="sm" />
                      </td>

                      {/* Liquidity */}
                      <td className="py-3 px-3 text-center text-[11px] text-slate-300">
                        {prop.estimatedTimeToSaleDays} gg
                      </td>

                      {/* Risk */}
                      <td className="py-3 px-3 text-center text-xs">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          riskDimension >= 80 ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/20' :
                          riskDimension >= 60 ? 'text-amber-300 bg-amber-950/40 border border-amber-500/20' :
                          'text-rose-300 bg-rose-950/40 border border-rose-500/20'
                        }`}>
                          {riskDimension}/100
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-3 text-center">
                        <ConfidenceBadge score={prop.ratingConfidence} level={prop.ratingConfidenceLevel} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold font-mono ${
                          prop.status === 'Active' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                          prop.status === 'Review Required' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {prop.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => toggleWatchlist(prop.id, e)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isWatched ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                            title={isWatched ? 'Rimuovi da Watchlist' : 'Aggiungi a Watchlist'}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectProperty(prop)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-sans font-semibold transition-colors"
                          >
                            Dettaglio
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: OPPORTUNITY RANKING */}
      {viewMode === 'ranking' && (
        <div className="space-y-4">
          {/* Ranking Metric Selector */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono uppercase text-[10px] font-semibold">Ordina Classifica per:</span>
            {(['rating', 'fit', 'priceFit', 'demand', 'liquidity', 'risk', 'confidence'] as RankingMetric[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setRankingMetric(metric)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  rankingMetric === metric
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {metric === 'rating' ? 'Real Estate Rating' :
                 metric === 'fit' ? 'Agency Fit' :
                 metric === 'priceFit' ? 'Price Fit (Sconto)' :
                 metric === 'demand' ? 'Market Demand' :
                 metric === 'liquidity' ? 'Velocità Liquidità' :
                 metric === 'risk' ? 'Basso Rischio' : 'Confidenza'}
              </button>
            ))}
          </div>

          {/* Ranking Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedProperties.map((prop, idx) => (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-xs"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Number */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm border ${
                    idx === 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' :
                    idx === 1 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' :
                    idx === 2 ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
                    'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    #{idx + 1}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                      {prop.title}
                    </h3>
                    <div className="text-xs text-slate-400">
                      {prop.microZone} • €{prop.askingPrice.toLocaleString()} (Congruo: €{prop.estimatedFairValue.toLocaleString()})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Rating</div>
                    <div className="text-lg font-mono font-extrabold text-white">{prop.realEstateRating}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-800"></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Agency Fit</div>
                    <div className="text-lg font-mono font-extrabold text-cyan-300">{prop.agencyFit.score}%</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: OPPORTUNITY MAP */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Canvas / Grid Representation */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Mappa Georeferenziata Opportunità</h3>
                <p className="text-xs text-slate-400">Intensità cromatica correlata al Real Estate Rating</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 80–100</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> 70–79</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> &lt;70</span>
              </div>
            </div>

            {/* Visual Geospatial Layout representation */}
            <div className="h-96 w-full rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex items-center justify-center p-6">
              {/* Map grid lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border border-slate-400"></div>
                ))}
              </div>

              {/* Positioned Property Markers */}
              {filteredProperties.slice(0, 16).map((prop, idx) => {
                const isHigh = prop.realEstateRating >= 80;
                const isMid = prop.realEstateRating >= 70 && prop.realEstateRating < 80;
                const isSelected = mapSelectedProperty?.id === prop.id;

                // Derive distributed positions across the map
                const topPct = 15 + ((idx * 23) % 70);
                const leftPct = 10 + ((idx * 37) % 80);

                return (
                  <button
                    key={prop.id}
                    onClick={() => setMapSelectedProperty(prop)}
                    style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all cursor-pointer shadow-lg flex items-center gap-1.5 ${
                      isSelected
                        ? 'ring-4 ring-white bg-white text-slate-950 font-bold z-20 scale-125'
                        : isHigh
                        ? 'bg-emerald-500 text-slate-950 hover:scale-110 z-10'
                        : isMid
                        ? 'bg-cyan-500 text-slate-950 hover:scale-110'
                        : 'bg-amber-500 text-slate-950 hover:scale-110'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono font-bold pr-1">{prop.realEstateRating}</span>
                  </button>
                );
              })}

              <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg text-[11px] font-mono text-slate-400">
                Coordinate calibrate: Quadrante Metropolitano Centro / Nord
              </div>
            </div>
          </div>

          {/* Selected Marker Detail Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            {mapSelectedProperty ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {mapSelectedProperty.code}
                  </span>
                  <RatingBadge score={mapSelectedProperty.realEstateRating} classification={mapSelectedProperty.ratingClassification} size="sm" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{mapSelectedProperty.title}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{mapSelectedProperty.microZone}</div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prezzo Richiesto:</span>
                    <span className="text-white font-bold">€{mapSelectedProperty.askingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valore Congruo:</span>
                    <span className="text-emerald-400 font-bold">€{mapSelectedProperty.estimatedFairValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Agency Fit:</span>
                    <span className="text-cyan-300 font-bold">{mapSelectedProperty.agencyFit.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidenza Dati:</span>
                    <span className="text-white font-bold">{mapSelectedProperty.ratingConfidence}% ({mapSelectedProperty.ratingConfidenceLevel})</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold mb-1">Obiettivo Decisionale:</div>
                  {mapSelectedProperty.actionScoreObjective}
                </div>

                <button
                  onClick={() => onSelectProperty(mapSelectedProperty)}
                  className="w-full py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Apri Scheda Property Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 text-slate-700" />
                <div className="text-xs font-bold text-slate-400">Nessun marker selezionato</div>
                <p className="text-[11px] text-slate-500">
                  Clicca su uno dei marker sulla mappa per visualizzare i dettagli quantitativi e il rating dell'immobile.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: WATCHLIST (Monitoraggio Cambiamenti) */}
      {viewMode === 'watchlist' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Opportunità Monitorate in Watchlist</h3>
              <p className="text-slate-400">Tracciamento continuo di variazioni di prezzo, rating, comparabili e fit acquirenti.</p>
            </div>
            <span className="font-mono text-emerald-400 font-bold">{watchlistProperties.length} Asset Monitorati</span>
          </div>

          <div className="space-y-3">
            {watchlistProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                      {prop.eventType.toUpperCase()} UPDATE
                    </span>
                    <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                      {prop.title}
                    </h4>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {prop.recentEvent}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {prop.microZone} • Richiesta: €{prop.askingPrice.toLocaleString()} • Fair Value: €{prop.estimatedFairValue.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Rating</div>
                    <div className="text-lg font-mono font-extrabold text-white">{prop.realEstateRating}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Agency Fit</div>
                    <div className="text-lg font-mono font-extrabold text-cyan-300">{prop.agencyFit.score}%</div>
                  </div>
                  <button
                    onClick={(e) => toggleWatchlist(prop.id, e)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/30 text-xs"
                    title="Rimuovi da Watchlist"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
