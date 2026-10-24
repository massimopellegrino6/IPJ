import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Save, 
  MapPin, 
  Euro, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Layers,
  Compass
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { resolveTerritory } from '../../backend/territorialResolver';
import { getOmiBandsForProperty } from '../../backend/omiClient';
import { CadastralUploadDropzone } from './CadastralUploadDropzone';
import { CadastralParseResult } from '../../backend/cadastralParser';

interface EditPropertyModalProps {
  property: PropertyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProperty: (updatedProperty: PropertyItem) => void;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  onUpdateProperty
}) => {
  if (!isOpen || !property) return null;

  // Local Form State initialized from active property
  const [title, setTitle] = useState(property.title || '');
  const [address, setAddress] = useState(property.address || '');
  const [city, setCity] = useState(property.city || '');
  const [province, setProvince] = useState(property.province || '');
  const [microZone, setMicroZone] = useState(property.microZone || '');
  const [squareMeters, setSquareMeters] = useState<number>(property.squareMeters || 80);
  const [rooms, setRooms] = useState<number>(property.rooms || 3);
  const [bathrooms, setBathrooms] = useState<number>(property.bathrooms || 1);
  const [floor, setFloor] = useState<number>(property.floor || 1);
  const [totalFloors, setTotalFloors] = useState<number>(property.totalFloors || 4);
  const [energyClass, setEnergyClass] = useState<string>(property.energyClass || 'C');
  const [conservationState, setConservationState] = useState<PropertyItem['conservationState']>(
    property.conservationState || 'Good'
  );
  const [status, setStatus] = useState<PropertyItem['status']>(property.status || 'Active');
  const [askingPrice, setAskingPrice] = useState<number>(property.askingPrice || 200000);
  
  // Cadastral data
  const [sheet, setSheet] = useState(property.cadastralData?.sheet || '');
  const [parcel, setParcel] = useState(property.cadastralData?.parcel || '');
  const [subaltern, setSubaltern] = useState(property.cadastralData?.subaltern || '');
  const [cadastralCategory, setCadastralCategory] = useState(
    property.cadastralData?.cadastralCategory || 'A/2'
  );
  const [annuity, setAnnuity] = useState<number>(property.cadastralData?.annuity || 0);

  // Visura Parser Drawer
  const [showVisuraParser, setShowVisuraParser] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state whenever property prop changes
  useEffect(() => {
    if (property) {
      setTitle(property.title || '');
      setAddress(property.address || '');
      setCity(property.city || '');
      setProvince(property.province || '');
      setMicroZone(property.microZone || '');
      setSquareMeters(property.squareMeters || 80);
      setRooms(property.rooms || 3);
      setBathrooms(property.bathrooms || 1);
      setFloor(property.floor || 1);
      setTotalFloors(property.totalFloors || 4);
      setEnergyClass(property.energyClass || 'C');
      setConservationState(property.conservationState || 'Good');
      setStatus(property.status || 'Active');
      setAskingPrice(property.askingPrice || 200000);
      setSheet(property.cadastralData?.sheet || '');
      setParcel(property.cadastralData?.parcel || '');
      setSubaltern(property.cadastralData?.subaltern || '');
      setCadastralCategory(property.cadastralData?.cadastralCategory || 'A/2');
      setAnnuity(property.cadastralData?.annuity || 0);
    }
  }, [property]);

  const handleApplyVisura = (_: any, parseResult: CadastralParseResult) => {
    const mainUnit = parseResult.units.find(u => u.id === parseResult.mainUnitId) || parseResult.units[0];
    if (mainUnit) {
      if (mainUnit.address) setAddress(mainUnit.address);
      if (parseResult.municipality) {
        setCity(parseResult.municipality);
        const resolved = resolveTerritory({ municipalityName: parseResult.municipality });
        setProvince(resolved.provinceCode);
      }
      if (mainUnit.sheet) setSheet(mainUnit.sheet);
      if (mainUnit.parcel) setParcel(mainUnit.parcel);
      if (mainUnit.subaltern) setSubaltern(mainUnit.subaltern);
      if (mainUnit.category) setCadastralCategory(mainUnit.category);
      if (mainUnit.cadastralRentEur) setAnnuity(mainUnit.cadastralRentEur);
      if (mainUnit.totalSurfaceMq) setSquareMeters(mainUnit.totalSurfaceMq);
      if (mainUnit.floor) setFloor(parseInt(mainUnit.floor, 10) || floor);
      
      setShowVisuraParser(false);
      setSuccessMsg('Dati estratti con successo dalla Visura Catastale!');
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanAddress = address.trim() || property.address;
    const cleanCity = city.trim() || property.city;
    const cleanProvince = province.trim().toUpperCase() || property.province;
    const safeSqm = Math.max(10, Number(squareMeters) || 80);
    const safeAsking = Math.max(1000, Number(askingPrice) || 100000);

    // Risoluzione territoriale unificata (Product Thesis §28, §29)
    const resolvedTerritory = resolveTerritory({
      municipalityName: cleanCity,
      belfioreCode: property.cadastralData?.cityCode,
      lat: property.coordinates?.lat,
      lon: property.coordinates?.lng
    });

    const omiBands = getOmiBandsForProperty(resolvedTerritory, cadastralCategory, microZone);
    const cleanMicroZone = microZone.trim() || omiBands.microzoneDescription;

    // Ricalcolo coordinate se la città è cambiata
    const newCoords = {
      lat: resolvedTerritory.lat || property.coordinates?.lat || 41.9028,
      lng: resolvedTerritory.lon || property.coordinates?.lng || 12.4964
    };

    const calculatedPricePerSqm = Math.round(safeAsking / safeSqm);
    const estimatedFairValue = property.estimatedFairValue > 0 
      ? property.estimatedFairValue 
      : Math.round(safeSqm * omiBands.medianEurMq);
    const priceDiffPct = Number((((safeAsking - estimatedFairValue) / estimatedFairValue) * 100).toFixed(1));

    const updatedProperty: PropertyItem = {
      ...property,
      title: title.trim() || `${cadastralCategory} — ${cleanAddress}`,
      address: cleanAddress,
      city: cleanCity,
      province: cleanProvince,
      microZone: cleanMicroZone,
      macroZone: `${cleanCity} (${cleanMicroZone})`,
      squareMeters: safeSqm,
      rooms: Number(rooms) || 3,
      bathrooms: Number(bathrooms) || 1,
      floor: Number(floor) || 1,
      totalFloors: Math.max(Number(floor) || 1, Number(totalFloors) || 4),
      energyClass,
      conservationState,
      status,
      askingPrice: safeAsking,
      pricePerSqm: calculatedPricePerSqm,
      priceDifferencePct: priceDiffPct,
      coordinates: newCoords,
      cadastralData: {
        ...(property.cadastralData || { urbanCompliance: 'COMPLIANT' }),
        sheet: sheet.trim() || property.cadastralData?.sheet || '1',
        parcel: parcel.trim() || property.cadastralData?.parcel || '1',
        subaltern: subaltern.trim() || property.cadastralData?.subaltern || '1',
        cadastralCategory: cadastralCategory.trim() || 'A/2',
        annuity: Number(annuity) || property.cadastralData?.annuity || 0,
        cityCode: resolvedTerritory.belfioreCode,
        address: cleanAddress,
        totalSurfaceMq: safeSqm
      }
    };

    onUpdateProperty(updatedProperty);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Modifica Dati Immobile</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-normal">
                  {property.code}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Aggiorna anagrafica, indirizzo, superficie e parametri catastali dell'asset.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVisuraParser(!showVisuraParser)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Compila automaticamente da Visura Catastale"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Carica Visura AdE</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visura Parser Accordion/Drawer */}
        {showVisuraParser && (
          <div className="p-4 bg-slate-900/90 border-b border-indigo-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Aggiornamento Asseverato da Visura Catastale Ufficiale
              </span>
              <button
                type="button"
                onClick={() => setShowVisuraParser(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Chiudi
              </button>
            </div>
            <CadastralUploadDropzone
              currentProperty={property}
              onApplyAudit={handleApplyVisura}
              onClose={() => setShowVisuraParser(false)}
            />
          </div>
        )}

        {/* Success toast */}
        {successMsg && (
          <div className="p-3 mx-6 mt-4 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-200">
          
          {/* Section: Localizzazione & Indirizzo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>1. Localizzazione & Indirizzo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-mono text-slate-400">Indirizzo Completo *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="es. Via San Lorenzo 40, Corso Vittorio Emanuele..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Titolo Scheda Immobile</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Trilocale Panoramico"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Comune *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Campobasso, Roma, Milano..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Provincia (Sigla) *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={province}
                  onChange={(e) => setProvince(e.target.value.toUpperCase())}
                  placeholder="CB, RM, MI..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white uppercase focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Microzona / Quartiere</label>
                <input
                  type="text"
                  value={microZone}
                  onChange={(e) => setMicroZone(e.target.value)}
                  placeholder="Centro Storico, Vazzieri, Prati..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section: Valore Economico & Superficie */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <Euro className="w-4 h-4" />
              <span>2. Parametri Economici & Spaziali</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Prezzo Richiesto (€) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Superficie (m²) *</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={2000}
                  value={squareMeters}
                  onChange={(e) => setSquareMeters(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Piano</label>
                <input
                  type="number"
                  min={-2}
                  max={50}
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Piani Totali</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Vani / Locali</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Bagni</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Stato Conservativo</label>
                <select
                  value={conservationState}
                  onChange={(e) => setConservationState(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Excellent">Ottimo / Ristrutturato</option>
                  <option value="Good">Buono</option>
                  <option value="Habitable">Abitabile</option>
                  <option value="Needs Renovation">Da Ristrutturare</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Classe APE</label>
                <select
                  value={energyClass}
                  onChange={(e) => setEnergyClass(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                >
                  {['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'].map(cls => (
                    <option key={cls} value={cls}>Classe {cls}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Identificativi Catastali */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>3. Identificativi Catastali (Catasto Fabbricati)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Foglio</label>
                <input
                  type="text"
                  value={sheet}
                  onChange={(e) => setSheet(e.target.value)}
                  placeholder="125"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Particella</label>
                <input
                  type="text"
                  value={parcel}
                  onChange={(e) => setParcel(e.target.value)}
                  placeholder="106"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Subalterno</label>
                <input
                  type="text"
                  value={subaltern}
                  onChange={(e) => setSubaltern(e.target.value)}
                  placeholder="4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Categoria</label>
                <select
                  value={cadastralCategory}
                  onChange={(e) => setCadastralCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="A/1">A/1 (Signorile)</option>
                  <option value="A/2">A/2 (Civile)</option>
                  <option value="A/3">A/3 (Economica)</option>
                  <option value="A/4">A/4 (Popolare)</option>
                  <option value="A/7">A/7 (Villini)</option>
                  <option value="A/8">A/8 (Ville)</option>
                  <option value="A/10">A/10 (Uffici)</option>
                  <option value="C/1">C/1 (Negozi)</option>
                  <option value="C/2">C/2 (Depositi/Cantine)</option>
                  <option value="C/6">C/6 (Box/Garage)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Rendita (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={annuity}
                  onChange={(e) => setAnnuity(Number(e.target.value))}
                  placeholder="395.09"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section: Stato Gestione Incarico */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400">Stato Commerciale</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Active">Attivo (Sul Mercato)</option>
                <option value="Under Offer">Proposta in Corso</option>
                <option value="Review Required">Revisione Richiesta</option>
                <option value="Sold">Venduto / Rogitato</option>
              </select>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Annulla
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salva Modifiche Immobile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
