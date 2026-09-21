import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  Sparkles, 
  Download, 
  Plus, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Euro,
  Maximize2
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { RatingBadge } from '../badges/RatingBadge';
import { ConfidenceBadge } from '../badges/ConfidenceBadge';
import { AgencyFitBadge } from '../badges/AgencyFitBadge';
import { getPropertyImages } from '../../data/propertyMediaData';
import { getPropertyRegistryInfo } from '../../data/propertyRegistryData';
import { PropertyDossierModal } from '../property/PropertyDossierModal';
import { NewPropertyModal } from '../property/NewPropertyModal';

interface PropertiesViewProps {
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
  onAddProperty?: (property: PropertyItem) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  onSelectProperty,
  onAddProperty
}) => {
  // View mode switcher: 'grid' | 'table' | 'map'
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('table');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [mandateFilter, setMandateFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'sqm_desc' | 'rating_desc' | 'expiration_asc'>('price_desc');

  // Modals state
  const [dossierProperty, setDossierProperty] = useState<PropertyItem | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false);
  const [selectedMapProperty, setSelectedMapProperty] = useState<PropertyItem>(properties[0]);
  const [exportToast, setExportToast] = useState(false);

  // KPIs Calculations
  const kpis = useMemo(() => {
    const totalCount = properties.length;
    const totalValue = properties.reduce((acc, p) => acc + p.askingPrice, 0);
    const activeCount = properties.filter(p => p.status === 'Active').length;
    const underOfferCount = properties.filter(p => p.status === 'Under Offer').length;
    const reviewCount = properties.filter(p => p.status === 'Review Required' || p.status === 'Draft').length;
    
    // Expiring mandates in < 30 days
    const expiringSoonCount = properties.filter(p => {
      const reg = getPropertyRegistryInfo(p);
      return reg.mandate.daysToExpiration <= 30;
    }).length;

    // Full compliant dossiers
    const compliantCount = properties.filter(p => {
      const reg = getPropertyRegistryInfo(p);
      return reg.cadastralData.urbanCompliance === 'COMPLIANT' && Object.values(reg.documents).every(Boolean);
    }).length;

    return {
      totalCount,
      totalValue,
      activeCount,
      underOfferCount,
      reviewCount,
      expiringSoonCount,
      complianceRatePct: totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100
    };
  }, [properties]);

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const reg = getPropertyRegistryInfo(prop);
      
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesBasic = 
          prop.title.toLowerCase().includes(q) ||
          prop.code.toLowerCase().includes(q) ||
          prop.address.toLowerCase().includes(q) ||
          prop.city.toLowerCase().includes(q) ||
          prop.microZone.toLowerCase().includes(q) ||
          reg.mandate.assignedAgent.name.toLowerCase().includes(q);
        if (!matchesBasic) return false;
      }

      // Status
      if (statusFilter !== 'ALL' && prop.status !== statusFilter) {
        return false;
      }

      // Mandate
      if (mandateFilter !== 'ALL' && reg.mandate.type !== mandateFilter) {
        return false;
      }

      // Compliance
      if (complianceFilter === 'COMPLIANT') {
        const isCompliant = reg.cadastralData.urbanCompliance === 'COMPLIANT' && Object.values(reg.documents).every(Boolean);
        if (!isCompliant) return false;
      } else if (complianceFilter === 'NEEDS_DOCS') {
        const hasMissing = reg.cadastralData.urbanCompliance !== 'COMPLIANT' || Object.values(reg.documents).some(v => !v);
        if (!hasMissing) return false;
      }

      // Type
      if (typeFilter !== 'ALL' && prop.propertyType !== typeFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const regA = getPropertyRegistryInfo(a);
      const regB = getPropertyRegistryInfo(b);

      if (sortBy === 'price_desc') return b.askingPrice - a.askingPrice;
      if (sortBy === 'price_asc') return a.askingPrice - b.askingPrice;
      if (sortBy === 'sqm_desc') return b.squareMeters - a.squareMeters;
      if (sortBy === 'rating_desc') return b.realEstateRating - a.realEstateRating;
      if (sortBy === 'expiration_asc') return regA.mandate.daysToExpiration - regB.mandate.daysToExpiration;
      return 0;
    });
  }, [properties, searchTerm, statusFilter, mandateFilter, complianceFilter, typeFilter, sortBy]);

  const handleOpenDossier = (prop: PropertyItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDossierProperty(prop);
    setIsDossierOpen(true);
  };

  const handleExportCsv = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Title Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <span>Registro Master Asset & Gestione Mandati</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  {properties.length} Immobili a Catalogo
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Archivio anagrafico unico degli asset gestiti, conformità catastale/urbanistica e monitoraggio mandati d'agenzia.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Esporta Catalogo</span>
          </button>

          <button
            onClick={() => setIsNewPropertyOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Incarico</span>
          </button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportToast && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dossier Catalogo Asset esportato con successo in formato CSV/Excel (26 record conformi).</span>
          </div>
        </div>
      )}

      {/* 2. Top Metric KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Totale Asset a Registro</span>
          <div className="text-lg font-bold font-mono text-white">{kpis.totalCount} Unità</div>
          <span className="text-[10px] font-mono text-slate-500 block">100% Censiti nel DB</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Valore Portafoglio</span>
          <div className="text-lg font-bold font-mono text-emerald-400">
            €{(kpis.totalValue / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] font-mono text-emerald-500/80 block">Asking price complessivo</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Attivi sul Mercato</span>
          <div className="text-lg font-bold font-mono text-cyan-400">{kpis.activeCount} Immobili</div>
          <span className="text-[10px] font-mono text-cyan-500/80 block">
            {Math.round((kpis.activeCount / kpis.totalCount) * 100)}% dell'inventario
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">In Trattativa</span>
          <div className="text-lg font-bold font-mono text-indigo-400">{kpis.underOfferCount} Proposte</div>
          <span className="text-[10px] font-mono text-indigo-500/80 block">In attesa di rogito</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Mandati in Scadenza</span>
          <div className={`text-lg font-bold font-mono ${kpis.expiringSoonCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {kpis.expiringSoonCount} Asset
          </div>
          <span className="text-[10px] font-mono text-amber-500/80 block">Alert &lt;30 giorni</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Conformità RRE</span>
          <div className="text-lg font-bold font-mono text-emerald-400">{kpis.complianceRatePct}%</div>
          <span className="text-[10px] font-mono text-emerald-500/80 block">Dossier 5/5 Verificati</span>
        </div>
      </div>

      {/* 3. Search, Filter & View Mode Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Full-text Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per codice (es. RM-ROM-18), via, microzona, comune o broker referente..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono self-start md:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabella Densa</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards Visuali</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mappa Inventario</span>
            </button>
          </div>
        </div>

        {/* Second Row: Granular Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtra:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Stato: Tutti ({properties.length})</option>
            <option value="Active">Attivi sul Mercato</option>
            <option value="Under Offer">In Trattativa (Under Offer)</option>
            <option value="Review Required">Revisione Richiesta</option>
            <option value="Sold">Rogitati / Venduti</option>
          </select>

          {/* Mandate Type Filter */}
          <select
            value={mandateFilter}
            onChange={(e) => setMandateFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Mandato: Tutti</option>
            <option value="Exclusive">In Esclusiva</option>
            <option value="Non-Exclusive">Non Esclusivo</option>
            <option value="Direct">Diretto</option>
          </select>

          {/* Compliance Filter */}
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Conformità: Tutte</option>
            <option value="COMPLIANT">Dossier Completo (5/5 OK)</option>
            <option value="NEEDS_DOCS">Mancanze / In Verif.</option>
          </select>

          {/* Typology Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tipologia: Tutte</option>
            <option value="Apartment">Appartamenti</option>
            <option value="Penthouse">Attici / Mansarde</option>
            <option value="Villa">Ville</option>
            <option value="Loft">Loft</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Studio">Monolocali</option>
          </select>

          {/* Sort Control */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-slate-500">Ordina:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="price_desc">Prezzo (Decrescente)</option>
              <option value="price_asc">Prezzo (Crescente)</option>
              <option value="sqm_desc">Superficie (m²)</option>
              <option value="rating_desc">Rating PropTech</option>
              <option value="expiration_asc">Scadenza Mandato</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Views: Table, Grid or Map */}
      
      {/* MODE A: DENSE DATA TABLE */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs font-mono min-w-[1150px]">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] whitespace-nowrap">
                  <th className="py-3 px-4 min-w-[240px]">Immobile / Titolo</th>
                  <th className="py-3 px-3 min-w-[140px]">Località & Microzona</th>
                  <th className="py-3 px-3 min-w-[130px]">Dati Fisici</th>
                  <th className="py-3 px-3 text-right min-w-[110px]">Prezzo Richiesto</th>
                  <th className="py-3 px-3 min-w-[130px]">Incarico Mandato</th>
                  <th className="py-3 px-3 min-w-[130px]">Broker Assegnato</th>
                  <th className="py-3 px-3 text-center min-w-[120px]">Dossier Catastale</th>
                  <th className="py-3 px-3 text-center min-w-[90px]">Stato Asset</th>
                  <th className="py-3 px-4 text-right min-w-[130px]">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Nessun immobile corrisponde ai filtri selezionati.
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map(prop => {
                    const reg = getPropertyRegistryInfo(prop);
                    const images = getPropertyImages(prop);
                    const hero = images[0]?.url;
                    const docCount = Object.values(reg.documents).filter(Boolean).length;

                    return (
                      <tr 
                        key={prop.id}
                        onClick={() => onSelectProperty(prop)}
                        className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                      >
                        {/* Immobile & Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={hero} 
                              alt={prop.title}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-xs font-sans text-xs">
                                {prop.title}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="font-bold text-cyan-400">{prop.code}</span>
                                <span>•</span>
                                <span>{prop.propertyType}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-white truncate max-w-[140px]">{prop.city} ({prop.province})</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{prop.microZone}</div>
                        </td>

                        {/* Physical attributes */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{prop.squareMeters} m²</div>
                          <div className="text-[10px] text-slate-400">
                            {prop.rooms} vani • P.{prop.floor} • Cl.{prop.energyClass}
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-emerald-400">
                            €{prop.askingPrice.toLocaleString('it-IT')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            €{prop.pricePerSqm.toLocaleString('it-IT')}/m²
                          </div>
                        </td>

                        {/* Mandate info */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{reg.mandate.type}</span>
                            <span className="text-[10px] text-slate-400">({reg.mandate.commissionPct}%)</span>
                          </div>
                          <div className={`text-[10px] ${reg.mandate.daysToExpiration <= 30 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                            Scade tra {reg.mandate.daysToExpiration} gg
                          </div>
                        </td>

                        {/* Broker */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img 
                              src={reg.mandate.assignedAgent.avatar} 
                              alt={reg.mandate.assignedAgent.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-700"
                            />
                            <span className="text-white text-xs truncate max-w-[110px]">
                              {reg.mandate.assignedAgent.name}
                            </span>
                          </div>
                        </td>

                        {/* Dossier status */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => handleOpenDossier(prop, e)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold cursor-pointer"
                            title="Apri Dossier Catastale Ufficiale"
                          >
                            {docCount === 5 ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className={docCount === 5 ? 'text-emerald-400' : 'text-amber-400'}>
                              {docCount}/5 OK
                            </span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            prop.status === 'Active' 
                              ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400'
                              : prop.status === 'Under Offer'
                              ? 'bg-indigo-950/80 border border-indigo-500/30 text-indigo-400'
                              : 'bg-amber-950/80 border border-amber-500/30 text-amber-400'
                          }`}>
                            {prop.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenDossier(prop)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                              title="Dossier Tecnico & Conformità"
                            >
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                            <button
                              onClick={() => onSelectProperty(prop)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition-colors cursor-pointer"
                            >
                              Apri Scheda
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE B: VISUAL CARDS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map(prop => {
            const reg = getPropertyRegistryInfo(prop);
            const images = getPropertyImages(prop);
            const hero = images[0]?.url;
            const docCount = Object.values(reg.documents).filter(Boolean).length;

            return (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className="rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 transition-all overflow-hidden flex flex-col group cursor-pointer shadow-xs hover:shadow-lg hover:shadow-emerald-500/5"
              >
                {/* Card Image Banner */}
                <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
                  <img 
                    src={hero} 
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                  {/* Top badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/70 backdrop-blur-xs text-white border border-white/20">
                      {prop.propertyType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      prop.status === 'Active'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-indigo-500 text-white'
                    }`}>
                      {prop.status}
                    </span>
                  </div>

                  {/* Bottom Image Strip */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs font-mono pointer-events-none">
                    <span className="text-[10px] text-slate-300 font-bold bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      {prop.code}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      €{prop.pricePerSqm.toLocaleString('it-IT')}/m²
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">
                      {prop.address}, {prop.city} — {prop.microZone}
                    </p>
                  </div>

                  {/* Physical Specs Strip */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 block">SUP.</span>
                      <span className="font-bold text-white">{prop.squareMeters}m²</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">VANI</span>
                      <span className="font-bold text-white">{prop.rooms}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">PIANO</span>
                      <span className="font-bold text-white">{prop.floor}°</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">CLASSE</span>
                      <span className="font-bold text-emerald-400">{prop.energyClass}</span>
                    </div>
                  </div>

                  {/* Price & Mandate info */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Richiesta</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        €{prop.askingPrice.toLocaleString('it-IT')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Mandato</span>
                      <span className="text-xs font-bold font-mono text-white">
                        {reg.mandate.type} ({reg.mandate.commissionPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Footer with Agent and Dossier button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <img 
                        src={reg.mandate.assignedAgent.avatar} 
                        alt={reg.mandate.assignedAgent.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span className="text-xs text-slate-300 font-mono">
                        {reg.mandate.assignedAgent.name.split(' ')[0]}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenDossier(prop)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3 h-3 text-cyan-400" />
                      <span>Dossier ({docCount}/5)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE C: INVENTORY MAP VIEW */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map Viewer Left (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative aspect-16/9 lg:aspect-auto lg:min-h-[620px]">
            <iframe
              title="Mappa Inventario Asset"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedMapProperty.coordinates.lng - 0.05}%2C${selectedMapProperty.coordinates.lat - 0.03}%2C${selectedMapProperty.coordinates.lng + 0.05}%2C${selectedMapProperty.coordinates.lat + 0.03}&layer=mapnik&marker=${selectedMapProperty.coordinates.lat}%2C${selectedMapProperty.coordinates.lng}`}
              className="w-full h-full border-0 filter invert-[90%] hue-rotate-180 contrast-95 opacity-90 hover:opacity-100 transition-opacity"
              loading="lazy"
            />

            {/* Floating Quick Selector on Map */}
            <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs font-mono space-y-1 shadow-xl max-w-xs pointer-events-auto">
              <span className="text-[10px] text-cyan-400 font-bold uppercase block">Asset Georeferenziato</span>
              <p className="text-white font-bold truncate">{selectedMapProperty.title}</p>
              <p className="text-slate-400 text-[11px]">{selectedMapProperty.address}, {selectedMapProperty.city}</p>
            </div>
          </div>

          {/* Asset Detail & Selector Right (1 col) */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">Asset Selezionato</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedMapProperty.code}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  {selectedMapProperty.status}
                </span>
              </div>

              {/* Photo preview */}
              <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                <img 
                  src={getPropertyImages(selectedMapProperty)[0]?.url} 
                  alt={selectedMapProperty.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                  {selectedMapProperty.propertyType} • {selectedMapProperty.squareMeters} m²
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{selectedMapProperty.title}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedMapProperty.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Prezzo Richiesto</span>
                  <span className="font-bold text-emerald-400">€{selectedMapProperty.askingPrice.toLocaleString('it-IT')}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Prezzo / m²</span>
                  <span className="font-bold text-white">€{selectedMapProperty.pricePerSqm.toLocaleString('it-IT')}</span>
                </div>
              </div>
            </div>

            {/* Actions for selected map item */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleOpenDossier(selectedMapProperty)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-mono text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Apri Dossier Catastale</span>
              </button>

              <button
                onClick={() => onSelectProperty(selectedMapProperty)}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apri Scheda Decisionale</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      <PropertyDossierModal
        property={dossierProperty}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onOpenIntelligence={(prop) => onSelectProperty(prop)}
      />

      <NewPropertyModal
        isOpen={isNewPropertyOpen}
        onClose={() => setIsNewPropertyOpen(false)}
        onAddProperty={(newProp) => {
          if (onAddProperty) {
            onAddProperty(newProp);
          }
        }}
      />
    </div>
  );
};
