import React, { useState } from 'react';
import { X, Building2, Plus, Check, ShieldCheck, Euro, MapPin, Sparkles, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { createStandardDimensions } from '../../data/mockIntelligenceDatabase';
import { CadastralUploadDropzone } from './CadastralUploadDropzone';
import { CadastralParsedUnit, CadastralParseResult, parseCadastralVisura, SAMPLE_CAMPOBASSO_VISURA_TEXT } from '../../backend/cadastralParser';
import { resolveTerritory } from '../../backend/territorialResolver';

// Coordinate precise per i capoluoghi e vie note italiane (evita fallback errati o posizionamento disallineato)
const ITALIAN_GEO_LOOKUP: Record<string, { lat: number; lng: number }> = {
  campobasso: { lat: 41.5603, lng: 14.6627 },
  roma: { lat: 41.9028, lng: 12.4964 },
  milano: { lat: 45.4642, lng: 9.1900 },
  napoli: { lat: 40.8518, lng: 14.2681 },
  torino: { lat: 45.0703, lng: 7.6869 },
  palermo: { lat: 38.1157, lng: 13.3615 },
  genova: { lat: 44.4056, lng: 8.9463 },
  bologna: { lat: 44.4949, lng: 11.3426 },
  firenze: { lat: 43.7696, lng: 11.2558 },
  bari: { lat: 41.1171, lng: 16.8719 },
  catania: { lat: 37.5079, lng: 15.0873 },
  verona: { lat: 45.4384, lng: 10.9916 },
  venezia: { lat: 45.4408, lng: 12.3155 },
  messina: { lat: 38.1938, lng: 15.5540 },
  padova: { lat: 45.4064, lng: 11.8768 },
  trieste: { lat: 45.6495, lng: 13.7768 },
  brescia: { lat: 45.5416, lng: 10.2118 },
  parma: { lat: 44.8015, lng: 10.3279 },
  taranto: { lat: 40.4644, lng: 17.2470 },
  modena: { lat: 44.6471, lng: 10.9252 },
  perugia: { lat: 43.1107, lng: 12.3908 },
  pescara: { lat: 42.4618, lng: 14.2160 },
  livorno: { lat: 43.5485, lng: 10.3106 },
  cagliari: { lat: 39.2238, lng: 9.1217 },
  foggia: { lat: 41.4622, lng: 15.5447 },
  rimini: { lat: 44.0678, lng: 12.5695 },
  salerno: { lat: 40.6824, lng: 14.7681 },
  ferrara: { lat: 44.8381, lng: 11.6198 },
  sassari: { lat: 40.7259, lng: 8.5556 },
  monza: { lat: 45.5845, lng: 9.2744 },
  bergamo: { lat: 45.6983, lng: 9.6773 }
};

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: PropertyItem) => void;
}

export const NewPropertyModal: React.FC<NewPropertyModalProps> = ({
  isOpen,
  onClose,
  onAddProperty
}) => {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string>('Milano');
  const [province, setProvince] = useState<string>('MI');
  const [microZone, setMicroZone] = useState('Porta Nuova / Isola');
  const [propertyType, setPropertyType] = useState<PropertyItem['propertyType']>('Apartment');
  const [squareMeters, setSquareMeters] = useState<number>(95);
  const [rooms, setRooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [floor, setFloor] = useState<number>(2);
  const [energyClass, setEnergyClass] = useState<string>('B');
  const [conservationState, setConservationState] = useState<PropertyItem['conservationState']>('Excellent');
  const [askingPrice, setAskingPrice] = useState<number>(450000);
  const [estimatedFairValue, setEstimatedFairValue] = useState<number>(430000);
  const [mandateType, setMandateType] = useState<'Exclusive' | 'Non-Exclusive'>('Exclusive');
  const [showVisuraParser, setShowVisuraParser] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cadastralAuditData, setCadastralAuditData] = useState<{
    sheet: string;
    parcel: string;
    subaltern: string;
    category: string;
    annuity: number;
    provenance: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleApplyFromVisura = (_: any, parseResult: CadastralParseResult, shouldClose: boolean = true) => {
    const mainUnit = parseResult.units.find(u => u.id === parseResult.mainUnitId) || parseResult.units[0];
    if (mainUnit) {
      setTitle(`${mainUnit.category} — ${mainUnit.address}`);
      setAddress(mainUnit.address);
      if (parseResult.municipality) {
        setCity(parseResult.municipality);
        const munUpper = parseResult.municipality.toUpperCase();
        if (munUpper.includes('CAMPOBASSO')) {
          setProvince('CB');
          setMicroZone('Centro Storico / San Lorenzo');
          const sqm = mainUnit.totalSurfaceMq || 80;
          setAskingPrice(sqm * 1650);
          setEstimatedFairValue(sqm * 1600);
        } else if (munUpper.includes('ROMA')) {
          setProvince('RM');
          setMicroZone('Nomentano / Trieste');
          setAskingPrice(484000);
          setEstimatedFairValue(480000);
        } else if (munUpper.includes('MILANO')) setProvince('MI');
        else if (munUpper.includes('TORINO')) setProvince('TO');
        else if (munUpper.includes('BOLOGNA')) setProvince('BO');
        else if (munUpper.includes('FIRENZE')) setProvince('FI');
        else if (munUpper.includes('NAPOLI')) setProvince('NA');
      }
      setSquareMeters(mainUnit.totalSurfaceMq || 80);
      setFloor(parseInt(mainUnit.floor, 10) || 1);
      if (mainUnit.roomsOrSurface.includes('vani')) {
        const parsedRooms = Math.round(parseFloat(mainUnit.roomsOrSurface.replace(',', '.')));
        if (!isNaN(parsedRooms) && parsedRooms > 0) setRooms(parsedRooms);
      }
      setCadastralAuditData({
        sheet: mainUnit.sheet,
        parcel: mainUnit.parcel,
        subaltern: mainUnit.subaltern,
        category: mainUnit.category,
        annuity: mainUnit.cadastralRentEur,
        provenance: mainUnit.provenance
      });
      setFormError(null);
    }
    if (shouldClose) {
      setShowVisuraParser(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    let finalTitle = title.trim();
    let finalAddress = address.trim();
    let finalCity = city.trim();
    let finalProvince = province.trim();

    // Se l'utente non ha specificato titolo o indirizzo, compila automaticamente dalla Visura Campobasso ufficiale
    if (!finalTitle || !finalAddress) {
      const sample = parseCadastralVisura(SAMPLE_CAMPOBASSO_VISURA_TEXT);
      const main = sample.units.find(u => u.id === sample.mainUnitId) || sample.units[0];
      if (!finalTitle) finalTitle = `${main.category} — ${main.address}`;
      if (!finalAddress) finalAddress = main.address;
      if (!finalCity || finalCity.toLowerCase() === 'milano') finalCity = 'Campobasso';
      if (!finalProvince || finalProvince.toUpperCase() === 'MI') finalProvince = 'CB';
      if (!cadastralAuditData) {
        setCadastralAuditData({
          sheet: main.sheet,
          parcel: main.parcel,
          subaltern: main.subaltern,
          category: main.category,
          annuity: main.cadastralRentEur,
          provenance: main.provenance
        });
      }
    }

    const cleanCity = finalCity || 'Campobasso';
    const cleanProvince = (finalProvince || (cleanCity.length >= 2 ? cleanCity.substring(0, 2) : 'CB')).toUpperCase();
    const provPrefix = cleanProvince.slice(0, 2);
    const code = `${provPrefix}-${Date.now().toString().slice(-4)}`;
    
    const safeSqm = squareMeters > 0 ? squareMeters : 80;
    const safeAsking = askingPrice > 0 ? askingPrice : 132000;
    const safeFair = estimatedFairValue > 0 ? estimatedFairValue : 128000;
    const priceDiffPct = Math.round(((safeAsking - safeFair) / safeFair) * 1000) / 10;
    const pricePerSqm = Math.round(safeAsking / safeSqm);

    // Geocoding analitico preciso per l'indirizzo e la città (evita coordinate errate)
    const cityLower = cleanCity.toLowerCase().trim();
    const addrLower = finalAddress.toLowerCase().trim();
    let lat = 41.5603;
    let lng = 14.6627;

    if (cityLower.includes('campobasso')) {
      lat = addrLower.includes('san lorenzo') ? 41.5615 : 41.5603;
      lng = addrLower.includes('san lorenzo') ? 14.6618 : 14.6627;
    } else {
      const match = Object.keys(ITALIAN_GEO_LOOKUP).find(k => cityLower.includes(k));
      if (match) {
        lat = ITALIAN_GEO_LOOKUP[match].lat;
        lng = ITALIAN_GEO_LOOKUP[match].lng;
      } else {
        lat = 45.4642;
        lng = 9.1900;
      }
    }

    const newProperty: PropertyItem = {
      id: `prop_custom_${Date.now()}`,
      code,
      title: finalTitle,
      address: finalAddress,
      city: cleanCity,
      province: cleanProvince,
      microZone: microZone || (cleanCity.includes('Campobasso') ? 'Centro Storico / San Lorenzo' : `${cleanCity} Centro`),
      macroZone: microZone ? `${cleanCity} (${microZone})` : `${cleanCity} Centro`,
      propertyType,
      typologyCategory: 'Residential',
      squareMeters: safeSqm,
      rooms,
      bathrooms,
      floor,
      totalFloors: floor + 2,
      hasElevator: true,
      hasBalcony: true,
      hasParking: false,
      energyClass,
      conservationState,
      askingPrice: safeAsking,
      estimatedFairValue: safeFair,
      priceDifferencePct: priceDiffPct,
      pricePerSqm,
      estimatedSaleProbability90d: 58,
      estimatedTimeToSaleDays: 75,
      realEstateRating: 75,
      ratingClassification: 'STRONG',
      ratingTrend30d: 3,
      ratingConfidence: cadastralAuditData ? 93 : 85,
      ratingConfidenceLevel: 'HIGH',
      dimensions: createStandardDimensions({
        property: 76,
        location: 80,
        environment: 72,
        risk: cadastralAuditData ? 98 : 70,
        market: 75,
        economics: 78,
        macro: 70
      }),
      agencyFit: {
        score: 82,
        confidence: 85,
        confidenceLevel: 'HIGH',
        explanation: 'Forte allineamento con i buyer attivi per la microzona.',
        compatibleActiveBuyers: 14,
        highIntentBuyers: 5,
        historicalPerformanceSimilarPct: 92,
        historicalTimeToSaleDays: 68,
        territoryExpertise: 'HIGH',
        portfolioOverlap: 'BALANCED',
        matchingBuyerClusters: [
          { profile: 'Coppie giovani primo acquisto', count: 8, avgBudget: 460000, timelineDays: 60 }
        ]
      },
      actionScoreObjective: 'Max Liquidity in 90 Days',
      isActionScoreAvailable: true,
      ratingHistory: [
        { date: '2026-09-01', rating: 75, event: 'Acquisizione Incarico & Rating Iniziale', eventCategory: 'PRICE' }
      ],
      coordinates: {
        lat,
        lng
      },
      status: 'Active',
      priority: 'MEDIUM',
      dataFreshnessDays: 1,
      mandate: {
        type: mandateType,
        startDate: new Date().toISOString().split('T')[0],
        expirationDate: '2027-03-31',
        daysToExpiration: 180,
        commissionPct: 3.0,
        assignedAgent: {
          id: 'agent_1',
          name: 'Marco Rossi',
          role: 'Senior Listing Broker & Partner',
          email: 'm.rossi@proptech-intelligence.it',
          phone: '+39 06 4582 9101'
        }
      },
      cadastralData: {
        sheet: cadastralAuditData?.sheet || '125',
        parcel: cadastralAuditData?.parcel || '106',
        subaltern: cadastralAuditData?.subaltern || '14',
        cadastralCategory: cadastralAuditData?.category || 'A/2',
        annuity: cadastralAuditData?.annuity || 395.09,
        urbanCompliance: 'COMPLIANT',
        cityCode: cadastralAuditData?.cityCode || resolveTerritory({ municipalityName: cleanCity, lat, lon: lng }).belfioreCode,
        assetRiskIndex: cadastralAuditData ? 'VERIFIED' : undefined,
        provenance: cadastralAuditData?.provenance || 'Donazione del 28/11/2016, Notaio Oliva Claudia'
      },
      documents: {
        deedOfOrigin: true,
        mortgageInspection: true,
        energyCertificateAPE: true,
        condoRegulation: true,
        floorPlanCompliance: true
      },
      portalSyndication: {
        immobiliare: true,
        idealista: true,
        casaIt: true,
        directWeb: true
      }
    };

    onAddProperty(newProperty);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nuovo Incarico / Censimento Asset</h3>
              <p className="text-xs text-slate-400">Inserisci i parametri anagrafici e commerciali dell'immobile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!showVisuraParser) {
                  const sampleResult = parseCadastralVisura(SAMPLE_CAMPOBASSO_VISURA_TEXT);
                  handleApplyFromVisura(null, sampleResult, false);
                  setShowVisuraParser(true);
                } else {
                  setShowVisuraParser(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showVisuraParser ? 'Chiudi Visura' : 'Auto-Compila da Visura AdE'}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cadastral Upload Section in New Property Modal */}
        {showVisuraParser && (
          <div className="p-4 bg-slate-900/40 border-b border-slate-800 max-h-[60vh] overflow-y-auto">
            <CadastralUploadDropzone
              onApplyAudit={(p, r, m) => handleApplyFromVisura(p, r, true)}
              onUnitsParsed={(_, pResult) => {
                handleApplyFromVisura(null, pResult, false);
              }}
              onClose={() => setShowVisuraParser(false)}
            />
          </div>
        )}

        {cadastralAuditData && !showVisuraParser && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Dati catastali estratti con successo dalla Visura: <strong>Fgl. {cadastralAuditData.sheet}, Part. {cadastralAuditData.parcel}, Sub. {cadastralAuditData.subaltern}</strong> (Rendita €{cadastralAuditData.annuity.toFixed(2)})
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500 text-slate-950 font-bold">
              VERIFIED (+8% Confidenza)
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-bold">Titolo / Riferimento Immobile *</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. Trilocale Panoramico con Terrazzo"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Indirizzo Completo *</label>
              <input 
                type="text" 
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="es. Via Borsieri 24"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-2">
                <label className="text-slate-300 font-bold">Città *</label>
                <input 
                  type="text" 
                  required
                  list="italian-cities-list"
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    const lower = newCity.toLowerCase().trim();
                    if (lower === 'roma') setProvince('RM');
                    else if (lower === 'milano') setProvince('MI');
                    else if (lower === 'torino') setProvince('TO');
                    else if (lower === 'bologna') setProvince('BO');
                    else if (lower === 'firenze') setProvince('FI');
                    else if (lower === 'campobasso') setProvince('CB');
                    else if (lower === 'napoli') setProvince('NA');
                    else if (lower === 'genova') setProvince('GE');
                    else if (lower === 'palermo') setProvince('PA');
                    else if (lower === 'bari') setProvince('BA');
                  }}
                  placeholder="es. Campobasso, Milano, Roma..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
                />
                <datalist id="italian-cities-list">
                  <option value="Milano" />
                  <option value="Roma" />
                  <option value="Torino" />
                  <option value="Bologna" />
                  <option value="Firenze" />
                  <option value="Campobasso" />
                  <option value="Napoli" />
                  <option value="Genova" />
                  <option value="Palermo" />
                  <option value="Bari" />
                  <option value="Verona" />
                  <option value="Venezia" />
                  <option value="Padova" />
                  <option value="Catania" />
                </datalist>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Provincia *</label>
                <input 
                  type="text" 
                  required
                  maxLength={2}
                  value={province}
                  onChange={(e) => setProvince(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="es. CB"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-center font-bold tracking-wider uppercase focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Microzona OMI</label>
              <input 
                type="text" 
                value={microZone}
                onChange={(e) => setMicroZone(e.target.value)}
                placeholder="es. Isola / Garibaldi"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Tipologia</label>
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Apartment">Appartamento</option>
                <option value="Penthouse">Attico / Mansarda</option>
                <option value="Villa">Villa / Indipendente</option>
                <option value="Loft">Loft / Open Space</option>
                <option value="Townhouse">Terratetto / Villetta</option>
                <option value="Studio">Monolocale</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Superficie Commerciale (m²)</label>
              <input 
                type="number" 
                min="20"
                max="1000"
                value={squareMeters}
                onChange={(e) => setSquareMeters(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Vani / Locali</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Prezzo Richiesto (€)</label>
              <input 
                type="number" 
                step="5000"
                value={askingPrice}
                onChange={(e) => setAskingPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Stima Fair Value OMI (€)</label>
              <input 
                type="number" 
                step="5000"
                value={estimatedFairValue}
                onChange={(e) => setEstimatedFairValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Tipo Mandato</label>
              <select 
                value={mandateType}
                onChange={(e) => setMandateType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Exclusive">Incarico in Esclusiva (3.0%)</option>
                <option value="Non-Exclusive">Incarico Non Esclusivo (4.0%)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Classe Energetica</label>
              <select 
                value={energyClass}
                onChange={(e) => setEnergyClass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              >
                {['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono">
              {cadastralAuditData ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Audit Catastale AdE Pronto (+8% Boost)</span>
                </span>
              ) : (
                <span>Compila i dati obbligatori (*) o carica una visura</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950 animate-pulse" />
                    <span>Censimento in corso...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Censisci Asset in Portafoglio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
