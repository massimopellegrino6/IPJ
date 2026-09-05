import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  DollarSign, 
  Target, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';

interface ClientsCrmViewProps {
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
}

export const ClientsCrmView: React.FC<ClientsCrmViewProps> = ({
  properties,
  onSelectProperty
}) => {
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('ALL');

  // Buyer Clusters from Section 13
  const buyerClusters = [
    {
      id: 'cluster_embassy',
      name: 'University / Embassy Professionals',
      buyerCount: 15,
      avgBudget: 380000,
      mortgageStatus: 'Pre-Delibera Bancaria Erogata',
      preferredZones: 'Roma Trieste, Porta Pia, Prati',
      targetType: 'Trilocali prestigiosi, palazzi d\'epoca',
      matchedPropertyIds: ['prop_rm_nomentana_221', 'prop_rm_roma_18']
    },
    {
      id: 'cluster_hnw',
      name: 'High Net Worth Families',
      buyerCount: 8,
      avgBudget: 950000,
      mortgageStatus: 'Fondi Propri Immediati (No mutuo)',
      preferredZones: 'Milano Brera, Quadrilatero, CityLife',
      targetType: 'Attici, quadrilocali con doppi servizi e terrazzo',
      matchedPropertyIds: ['prop_mi_gioia_35', 'prop_rm_francia_42']
    },
    {
      id: 'cluster_tech',
      name: 'Young Tech Professionals',
      buyerCount: 24,
      avgBudget: 290000,
      mortgageStatus: 'Mutuo Consap 100% Pre-Approvato',
      preferredZones: 'Torino Crocetta, Bologna Saragozza',
      targetType: 'Bilocali ristrutturati ad alta efficienza energetica',
      matchedPropertyIds: ['prop_bo_saragozza_14', 'prop_to_francia_88']
    }
  ];

  // Specific high intent buyers
  const individualBuyers = [
    {
      id: 'b1',
      name: 'Dott. Marco Valenti (Funzionario FAO)',
      cluster: 'University / Embassy Professionals',
      budget: '€380,000 – €440,000',
      hasPreApprovedMortgage: true,
      bestMatchId: 'prop_rm_nomentana_221',
      matchScore: 98,
      readiness: 'Pronto al Rogito (30gg)'
    },
    {
      id: 'b2',
      name: 'Famiglia De Angelis',
      cluster: 'High Net Worth Families',
      budget: '€800,000 – €1,100,000',
      hasPreApprovedMortgage: true,
      bestMatchId: 'prop_rm_francia_42',
      matchScore: 95,
      readiness: 'Acquisto Immediato'
    },
    {
      id: 'b3',
      name: 'Ing. Sofia Bianchi',
      cluster: 'Young Tech Professionals',
      budget: '€340,000 – €390,000',
      hasPreApprovedMortgage: true,
      bestMatchId: 'prop_rm_appia_245',
      matchScore: 94,
      readiness: 'Pronto al Rogito'
    },
    {
      id: 'b4',
      name: 'Studio Associato Rinaldi',
      cluster: 'University / Embassy Professionals',
      budget: '€300,000 – €360,000',
      hasPreApprovedMortgage: true,
      bestMatchId: 'prop_rm_roma_18',
      matchScore: 91,
      readiness: 'In Negoziazione'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Intelligence Lato Domanda & Matching Immediato
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Clients & Demand Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Scenario demo di cluster acquirenti, stato finanziario e matching immobiliare.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>CRM simulato:</span>
          <span className="text-amber-300 font-bold">148 acquirenti demo</span>
        </div>
      </div>

      {/* 1. THREE CORE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Buyers */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Active Buyers</span>
          <div className="text-3xl font-mono font-extrabold text-white mt-1">148</div>
          <p className="text-xs text-slate-400 font-mono">Profili profilati nel database agenzia</p>
        </div>

        {/* High Intent Buyers */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 ring-1 ring-emerald-500/30">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">High Intent Buyers</span>
          <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">42 Acquirenti</div>
          <p className="text-xs text-emerald-300 font-mono">Delibera mutuo bancario pre-approvata</p>
        </div>

        {/* Average Budget */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Budget Medio Richiesto</span>
          <div className="text-3xl font-mono font-extrabold text-cyan-300 mt-1">€410,000</div>
          <p className="text-xs text-slate-400 font-mono">Allineato con l'offerta attiva in portafoglio</p>
        </div>
      </div>

      {/* 2. BUYER CLUSTERS (Richiesti esplicitamente: Embassy/University, HNW Families, Tech) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Buyer Clusters Strategici
          </h2>
          <span className="text-xs font-mono text-slate-400">Classificazione Comportamentale & Finanziaria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buyerClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{cluster.name}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    {cluster.buyerCount} acquirenti
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Budget Medio: <strong className="text-emerald-400">€{cluster.avgBudget.toLocaleString()}</strong>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs space-y-1 font-mono">
                  <div className="text-[10px] uppercase text-slate-500">Stato Finanziario:</div>
                  <div className="text-white text-[11px] font-semibold">{cluster.mortgageStatus}</div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-400">Target Ricercato:</strong> {cluster.targetType}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-xs">
                <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5">Asset in Portafoglio Compatibili:</div>
                <div className="flex flex-wrap gap-1.5">
                  {cluster.matchedPropertyIds.map((propId) => {
                    const p = properties.find(item => item.id === propId);
                    if (!p) return null;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectProperty(p)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-emerald-300 transition-colors flex items-center gap-1"
                      >
                        <span>{p.title}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MATCHING IMMEDIATO (Acquirenti Singoli Pronti vs Immobili Consigliati) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Matching Dimostrativo con Acquirenti Simulati
            </h3>
            <p className="text-xs text-slate-400">
              Acquirenti con punteggio di affinità superiore al 90% con delibera mutuo attiva.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">Matching Istantaneo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {individualBuyers.map((buyer) => {
            const matchedProp = properties.find(p => p.id === buyer.bestMatchId) || properties[0];

            return (
              <div
                key={buyer.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{buyer.name}</h4>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        {buyer.readiness}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Cluster: {buyer.cluster} • Budget: {buyer.budget}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Affinità</span>
                    <div className="text-xl font-mono font-extrabold text-cyan-300">{buyer.matchScore}%</div>
                  </div>
                </div>

                {/* Matched Property Card */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                    <span>Immobile Consigliato per Visita Immediata</span>
                    <span className="text-emerald-400 font-bold">Rating: {matchedProp.realEstateRating}</span>
                  </div>
                  <div className="font-bold text-white">{matchedProp.title}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    €{matchedProp.askingPrice.toLocaleString()} • {matchedProp.squareMeters} m² • {matchedProp.microZone}
                  </div>
                  <button
                    onClick={() => onSelectProperty(matchedProp)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Apri Scheda Immobile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
