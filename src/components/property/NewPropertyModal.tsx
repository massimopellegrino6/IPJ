import React, { useState } from 'react';
import { X, Building2, Plus, Check, ShieldCheck, Euro, MapPin } from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { createStandardDimensions } from '../../data/mockIntelligenceDatabase';

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
  const [city, setCity] = useState<'Roma' | 'Milano' | 'Torino' | 'Bologna' | 'Firenze'>('Milano');
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) return;

    const code = `${city.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const priceDiffPct = Math.round(((askingPrice - estimatedFairValue) / estimatedFairValue) * 1000) / 10;
    const pricePerSqm = Math.round(askingPrice / squareMeters);

    // City coordinates base
    let lat = 45.4642;
    let lng = 9.1900;
    if (city === 'Roma') { lat = 41.9028; lng = 12.4964; }
    else if (city === 'Torino') { lat = 45.0703; lng = 7.6869; }
    else if (city === 'Bologna') { lat = 44.4949; lng = 11.3426; }
    else if (city === 'Firenze') { lat = 43.7696; lng = 11.2558; }

    const newProperty: PropertyItem = {
      id: `prop_custom_${Date.now()}`,
      code,
      title,
      address,
      city,
      province: city === 'Roma' ? 'RM' : city === 'Milano' ? 'MI' : city === 'Torino' ? 'TO' : city === 'Bologna' ? 'BO' : 'FI',
      microZone,
      macroZone: `${city} Centrale`,
      propertyType,
      typologyCategory: 'Residential',
      squareMeters,
      rooms,
      bathrooms,
      floor,
      totalFloors: floor + 2,
      hasElevator: true,
      hasBalcony: true,
      hasParking: false,
      energyClass,
      conservationState,
      askingPrice,
      estimatedFairValue,
      priceDifferencePct: priceDiffPct,
      pricePerSqm,
      estimatedSaleProbability90d: 58,
      estimatedTimeToSaleDays: 75,
      realEstateRating: 75,
      ratingClassification: 'STRONG',
      ratingTrend30d: 3,
      ratingConfidence: 85,
      ratingConfidenceLevel: 'HIGH',
      dimensions: createStandardDimensions({
        property: 76,
        location: 80,
        environment: 72,
        risk: 70,
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
        lat: lat + (Math.random() - 0.5) * 0.02,
        lng: lng + (Math.random() - 0.5) * 0.02
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
        sheet: '142',
        parcel: '512',
        subaltern: '18',
        cadastralCategory: 'A/2',
        annuity: Math.round(squareMeters * 8.5),
        urbanCompliance: 'COMPLIANT'
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
        className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
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
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs font-mono">
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

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Città</label>
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Milano">Milano (MI)</option>
                <option value="Roma">Roma (RM)</option>
                <option value="Torino">Torino (TO)</option>
                <option value="Bologna">Bologna (BO)</option>
                <option value="Firenze">Firenze (FI)</option>
              </select>
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

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Censisci Asset in Portafoglio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
