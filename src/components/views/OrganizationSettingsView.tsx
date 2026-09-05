import React, { useState } from 'react';
import { 
  Building, 
  Sliders, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Save, 
  Check,
  Users,
  Award,
  Activity,
  Briefcase,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface OrganizationSettingsViewProps {
  mode?: 'organization' | 'settings';
}

export const OrganizationSettingsView: React.FC<OrganizationSettingsViewProps> = ({
  mode = 'organization'
}) => {
  const [saved, setSaved] = useState(false);
  const [minConfidenceThreshold, setMinConfidenceThreshold] = useState(70);
  const [targetMarginPct, setTargetMarginPct] = useState(3.5);
  const [autoFlagRepricingDays, setAutoFlagRepricingDays] = useState(45);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Agents data required by Section 15
  const agents = [
    {
      id: 'ag_1',
      name: 'Matteo Riva (Senior Partner)',
      role: 'Head of Advisory Roma',
      decisionsExecuted: 18,
      avgRealEstateRating: 82.4,
      activeListings: 9,
      decisionAccuracy: '94.2%',
      capacityPct: 85,
      specialization: 'Roma Centro, Prati, Nomentana'
    },
    {
      id: 'ag_2',
      name: 'Chiara Ferri (Senior Advisor)',
      role: 'Luxury Residential Lead Milano',
      decisionsExecuted: 14,
      avgRealEstateRating: 84.1,
      activeListings: 7,
      decisionAccuracy: '96.0%',
      capacityPct: 78,
      specialization: 'Milano Brera, Porta Nuova, CityLife'
    },
    {
      id: 'ag_3',
      name: 'Luca Moretti (Advisor)',
      role: 'Investment & Acquisitions',
      decisionsExecuted: 11,
      avgRealEstateRating: 77.8,
      activeListings: 6,
      decisionAccuracy: '90.5%',
      capacityPct: 65,
      specialization: 'Bologna Murri, Saragozza'
    },
    {
      id: 'ag_4',
      name: 'Elena D\'Amico (Associate)',
      role: 'Residential Specialist',
      decisionsExecuted: 8,
      avgRealEstateRating: 75.2,
      activeListings: 4,
      decisionAccuracy: '88.9%',
      capacityPct: 50,
      specialization: 'Torino Crocetta & San Salvario'
    }
  ];

  if (mode === 'organization') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
              Performance Organizzativa & Carichi Decisionali
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Organization & Team Intelligence
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              “Come sta performando l'agenzia? Quali agenti gestiscono le opportunità migliori? Come sono distribuiti i carichi decisionali?”
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Team Operativo:</span>
            <span className="text-emerald-400 font-bold">4 Advisor Attivi</span>
          </div>
        </div>

        {/* 1. AGENCY PERFORMANCE KPI STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Decisioni Eseguite Team</span>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">51</div>
            <p className="text-xs text-emerald-400 font-mono">100% validate con audit log</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Rating Medio Portafoglio Agenti</span>
            <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">79.9</div>
            <p className="text-xs text-slate-400 font-mono">Fascia Strong di eccellenza</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Accuratezza Media Decisionale</span>
            <div className="text-3xl font-mono font-extrabold text-cyan-300 mt-1">92.4%</div>
            <p className="text-xs text-slate-400 font-mono">Conformità predittiva a rogito</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Team Capacity Saturazione</span>
            <div className="text-3xl font-mono font-extrabold text-amber-400 mt-1">69%</div>
            <p className="text-xs text-slate-400 font-mono">Capacità per 12 nuovi mandati</p>
          </div>
        </div>

        {/* 2. AGENTS PERFORMANCE TABLE & CAPACITY (Richiesto da Section 15) */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Agents Performance & Decision Load
              </h3>
              <p className="text-xs text-slate-400">
                Ripartizione dei mandati, rating medio gestito, accuratezza delle delibere e saturazione della capacità operativa.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">Audit Real-Time</span>
          </div>

          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{agent.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {agent.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Territorio & Focus: <strong className="text-slate-200">{agent.specialization}</strong>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase block">Decisions Executed</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{agent.decisionsExecuted}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase block">Avg Rating Gestito</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{agent.avgRealEstateRating}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase block">Active Listings</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{agent.activeListings} mandati</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase block">Decision Accuracy</span>
                    <span className="font-bold text-cyan-300 text-sm mt-0.5 block">{agent.decisionAccuracy}</span>
                  </div>
                </div>

                {/* Team Capacity Progress */}
                <div className="lg:w-48 space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400 text-[10px] uppercase">Team Capacity</span>
                    <span className={`font-bold ${agent.capacityPct > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {agent.capacityPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${agent.capacityPct > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${agent.capacityPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // mode === 'settings'
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-slate-200">
      <div className="pb-6 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            Governance & Impostazioni di Sistema
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Settings & Parametri Algoritmici
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configurazione delle soglie di confidenza, regole di riposizionamento automatico e parametri fiduciari.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Configurazione Salvata' : 'Salva Parametri'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Fiduciary Decision Rules */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3>Soglie di Rischio e Degradazione Graziosa</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Confidenza Minima Richiesta per Azioni ad Alto Impatto:</span>
                <span className="font-mono text-emerald-400">{minConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={minConfidenceThreshold}
                onChange={(e) => setMinConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[11px] text-slate-400">
                Al di sotto della soglia minima, il sistema mostra 'LIMITED EVIDENCE' e attiva la modalità degradata a tutela fiduciaria dell'agenzia.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Giorni sul Mercato (DOM) per Attivazione Allerta Riposizionamento:</span>
                <span className="font-mono text-amber-400">{autoFlagRepricingDays} Giorni</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={autoFlagRepricingDays}
                onChange={(e) => setAutoFlagRepricingDays(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[11px] text-slate-400">
                Se un immobile supera questo periodo senza offerte congrue, viene generata una raccomandazione prioritaria nel Decision Center.
              </span>
            </div>
          </div>
        </div>

        {/* Closed-Loop Learning Protocol */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3>Protocollo di Apprendimento Closed-Loop</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            I feedback umani (Accept, Modify, Decline con motivazione) vengono aggregati a intervalli mensili per ricalibrare i residui delle stime di prezzo congruo e liquidità senza introdurre derive arbitrarie.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg">
            <span>Stato: Ciclo Closed-Loop Sincronizzato con Conservatoria Notarile</span>
          </div>
        </div>
      </div>
    </div>
  );
};
