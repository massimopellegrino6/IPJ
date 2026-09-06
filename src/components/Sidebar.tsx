import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Building2, 
  MapPinned, 
  Compass, 
  PieChart, 
  Users, 
  LineChart, 
  Database, 
  ShieldCheck, 
  Sliders, 
  Building
} from 'lucide-react';

export type MainNavTab = 
  | 'overview' 
  | 'opportunities' 
  | 'properties' 
  | 'market_intelligence' 
  | 'portfolio' 
  | 'decision_center' 
  | 'analytics' 
  | 'clients_demand' 
  | 'property_intelligence'
  | 'organization' 
  | 'data_integrations' 
  | 'methodology' 
  | 'settings';

interface SidebarProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  decisionCount?: number;
}

interface NavSection {
  title: string;
  items: Array<{
    id: MainNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  decisionCount = 6
}) => {
  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'opportunities', label: 'Opportunities', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'properties', label: 'Properties', icon: <Building2 className="w-4 h-4" /> },
        { id: 'market_intelligence', label: 'Market Intelligence', icon: <MapPinned className="w-4 h-4" /> },
        { id: 'portfolio', label: 'Portfolio Intelligence', icon: <PieChart className="w-4 h-4" /> }
      ]
    },
    {
      title: 'DECISIONS',
      items: [
        { id: 'decision_center', label: 'Decision Center', icon: <Compass className="w-4 h-4" />, badge: decisionCount },
        { id: 'analytics', label: 'Analytics & Outcomes', icon: <LineChart className="w-4 h-4" /> }
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { id: 'clients_demand', label: 'Clients / Demand', icon: <Users className="w-4 h-4" /> },
        { id: 'organization', label: 'Organization', icon: <Building className="w-4 h-4" /> }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'data_integrations', label: 'Data & Integrations', icon: <Database className="w-4 h-4" /> },
        { id: 'methodology', label: 'Methodology', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between select-none z-30 flex-shrink-0 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xs sticky top-0 z-10">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <span className="font-mono text-emerald-400 font-bold text-sm tracking-tighter">DI</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5 uppercase font-mono">
              IPJ
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Prototype v0.1 • Demo data
            </span>
          </div>
        </div>

        {/* Structured Navigation Groups */}
        <div className="px-3 py-3 space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-[11px] text-slate-400 font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Prototype Engine
          </span>
          <span className="text-amber-300 font-medium">Simulazione</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Dataset dimostrativo: 26 asset
        </div>
      </div>
    </aside>
  );
};
