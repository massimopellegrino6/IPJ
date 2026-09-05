import React from 'react';
import { ShieldCheck, Database, Cpu, Activity, FileCode, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'workbench' | 'sql' | 'node' | 'decisions' | 'architecture';
  setActiveTab: (tab: 'workbench' | 'sql' | 'node' | 'decisions' | 'architecture') => void;
  decisionCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, decisionCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Meta */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">
                  GEO-INTEL <span className="font-light text-slate-400">// RE Decision Engine</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Supabase Live: Node v18.16
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dynamic Rating & Graceful Degradation Bento Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              id="nav-tab-workbench"
              onClick={() => setActiveTab('workbench')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'workbench'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Bento Workbench</span>
            </button>

            <button
              id="nav-tab-decisions"
              onClick={() => setActiveTab('decisions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === 'decisions'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Decision Log</span>
              {decisionCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
                  {decisionCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-sql"
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'sql'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Schema SQL</span>
            </button>

            <button
              id="nav-tab-node"
              onClick={() => setActiveTab('node')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'node'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Node.js API</span>
            </button>

            <button
              id="nav-tab-architecture"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Architecture</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
