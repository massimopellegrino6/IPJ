import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  MapPin, 
  Calendar, 
  Bot, 
  Cloud, 
  CloudCheck,
  CloudAlert,
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Sun, 
  Moon, 
  ChevronDown, 
  X, 
  Check, 
  SlidersHorizontal,
  Sparkles,
  Command,
  Database,
  ArrowRight
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  selectedTerritory: string;
  onTerritoryChange: (territory: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedTerritory,
  onTerritoryChange,
  selectedPeriod,
  onPeriodChange,
  searchQuery,
  onSearchChange,
  onOpenAssistant
}) => {
  const territories = [
    { id: 'Tutti i Territori', label: 'Tutti i Territori', badge: 'Nazionale' },
    { id: 'Roma', label: 'Roma Capitale', badge: 'RM · H501' },
    { id: 'Milano', label: 'Milano Hub', badge: 'MI · F205' },
    { id: 'Torino', label: 'Torino', badge: 'TO · L219' },
    { id: 'Bologna', label: 'Bologna', badge: 'BO · A944' },
    { id: 'Firenze', label: 'Firenze', badge: 'FI · D612' },
    { id: 'Campobasso', label: 'Campobasso', badge: 'CB · B519' },
  ];

  const periods = [
    { id: 'Q3 2026 (Attivo)', label: 'Q3 2026', desc: 'Trimestre corrente attivo' },
    { id: 'Ultimi 30 Giorni', label: 'Ultimi 30 Giorni', desc: 'Dati rolling mensili' },
    { id: 'Ultimi 90 Giorni', label: 'Ultimi 90 Giorni', desc: 'Dati rolling trimestrali' },
    { id: 'Da Inizio Anno', label: 'Da Inizio Anno (YTD)', desc: 'Anno fiscale 2026' }
  ];

  const {
    user,
    authLoading,
    isCloudConnected,
    syncState,
    cloudProperties,
    cloudTasks,
    signInWithGoogle,
    signOutUser
  } = useFirebase();

  const { theme, toggleTheme } = useTheme();

  // Active Dropdown State: 'none' | 'territory' | 'period' | 'notifications' | 'user'
  const [activeDropdown, setActiveDropdown] = useState<'none' | 'territory' | 'period' | 'notifications' | 'user'>('none');
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState<boolean>(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K to focus search omnibar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setActiveDropdown('none');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown('none');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: 'territory' | 'period' | 'notifications' | 'user') => {
    setActiveDropdown(prev => (prev === name ? 'none' : name));
  };

  // Mock notifications grounded in actual platform telemetry
  const notifications = [
    {
      id: 'notif-1',
      title: 'Audit Catastale Convalidato',
      desc: 'Asset Campobasso (Foglio 125, Part. 106, Sub. 14) aggiornato con dati OMI B519.',
      time: '10 min fa',
      unread: true,
      type: 'cadastral'
    },
    {
      id: 'notif-2',
      title: 'Nuova Raccomandazione Strategica',
      desc: 'Task decisionale generato per Via Nomentana (Fair Value € 354.000).',
      time: '45 min fa',
      unread: true,
      type: 'decision'
    },
    {
      id: 'notif-3',
      title: 'Cloud Firestore Sincronizzato',
      desc: `${cloudProperties.length} immobili e ${cloudTasks.length} task persistiti in cloud.`,
      time: '2 ore fa',
      unread: false,
      type: 'system'
    }
  ];

  const currentTerritoryObj = territories.find(t => t.id === selectedTerritory) || territories[0];
  const currentPeriodObj = periods.find(p => p.id === selectedPeriod) || periods[0];

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-30 h-16 w-full border-b backdrop-blur-md transition-colors
        bg-slate-950/90 border-slate-800/80 text-slate-100
        dark:bg-slate-950/90 dark:border-slate-800/80 dark:text-slate-100
        px-4 lg:px-6 flex items-center justify-between gap-4"
    >
      {/* =========================================================================
          ZONE 1: OMNIBAR SEARCH
          Clean, modern search with keyboard shortcut badge (Cmd+K)
          ========================================================================= */}
      <div className="flex-1 max-w-md min-w-[200px]">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca per indirizzo, OMI, microzona o ID..."
            className="w-full pl-9 pr-14 py-2 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                onSearchChange('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-white transition-colors"
              title="Cancella ricerca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[10px] text-slate-400 font-mono pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          ZONE 2: UNIFIED SCOPE CONTROL BAR
          Consolidated, elegant filter segment for Territorial and Period Scope
          ========================================================================= */}
      <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-xs gap-1">
        {/* Territory Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('territory')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeDropdown === 'territory'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/70'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Seleziona ambito territoriale"
            aria-expanded={activeDropdown === 'territory'}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold truncate max-w-[120px]">{currentTerritoryObj.label}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              activeDropdown === 'territory' ? 'rotate-180 text-emerald-400' : ''
            }`} />
          </button>

          {/* Territory Popover Menu */}
          {activeDropdown === 'territory' && (
            <div className="absolute left-0 mt-2 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
                <span>Ambito Territoriale</span>
                <span className="text-emerald-400 font-bold">{territories.length} Zone</span>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {territories.map((t) => {
                  const isSelected = selectedTerritory === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onTerritoryChange(t.id);
                        setActiveDropdown('none');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-800 transition-colors ${
                        isSelected ? 'bg-emerald-500/10 text-emerald-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs">{t.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{t.badge}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-800" />

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('period')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeDropdown === 'period'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/70'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Seleziona periodo temporale di analisi"
            aria-expanded={activeDropdown === 'period'}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate max-w-[110px]">{currentPeriodObj.label}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              activeDropdown === 'period' ? 'rotate-180 text-cyan-400' : ''
            }`} />
          </button>

          {/* Period Popover Menu */}
          {activeDropdown === 'period' && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono text-slate-400 border-b border-slate-800/80">
                Finestra Temporale Analisi
              </div>
              <div className="py-1">
                {periods.map((p) => {
                  const isSelected = selectedPeriod === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onPeriodChange(p.id);
                        setActiveDropdown('none');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-800 transition-colors ${
                        isSelected ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs">{p.label}</span>
                        <span className="text-[10px] text-slate-400">{p.desc}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          ZONE 3: UTILITIES & EXECUTIVE ACTION CENTER
          Co-pilot CTA, Cloud Status, Theme Switcher, Notifications, Profile
          ========================================================================= */}
      <div className="flex items-center gap-2">
        {/* AI Co-pilot Trigger */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-all font-medium text-xs shadow-xs hover:border-emerald-500/50 cursor-pointer"
          title="Apri Assistente Decisionale REDIP"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Co-pilota</span>
          <Sparkles className="w-2.5 h-2.5 text-emerald-400/70 hidden sm:inline" />
        </button>

        {/* Cloud Firestore Status Badge (Executive minimalism) */}
        {user ? (
          <div 
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
            title="Cloud Firestore Provisioned & Synchronized"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-medium">Cloud DB</span>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Connetti Google Cloud Firestore"
          >
            <Cloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Connetti Cloud</span>
          </button>
        )}

        <div className="h-5 w-px bg-slate-800 mx-0.5 hidden sm:block" />

        {/* Theme Toggle Button (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer relative group"
          title={theme === 'dark' ? 'Passa al Tema Chiaro' : 'Passa al Tema Scuro'}
          aria-label="Alterna tema Dark / Light"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 transition-transform group-hover:-rotate-12" />
          )}
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => {
              toggleDropdown('notifications');
              setHasUnreadAlerts(false);
            }}
            className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
              activeDropdown === 'notifications'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Centro Notifiche ed Eventi"
            aria-expanded={activeDropdown === 'notifications'}
          >
            <Bell className="w-4 h-4" />
            {hasUnreadAlerts && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-slate-950" />
            )}
          </button>

          {/* Notifications Popover */}
          {activeDropdown === 'notifications' && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-0 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">Eventi e Notifiche</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Tempo Reale</span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-xs">{n.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Sistema integrato con log audit decisionale (§1)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Area */}
        <div className="relative pl-1">
          <button
            onClick={() => toggleDropdown('user')}
            className={`flex items-center gap-2 p-1 pl-1.5 rounded-lg border transition-all cursor-pointer text-left ${
              activeDropdown === 'user'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
            }`}
            title="Menu Profilo e Cloud"
            aria-expanded={activeDropdown === 'user'}
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Utente'} 
                className="w-7 h-7 rounded-full border border-emerald-500/50 object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-200 shrink-0">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : 'MR'}
              </div>
            )}
            <div className="hidden xl:flex flex-col text-left max-w-[110px] leading-tight">
              <span className="text-xs font-semibold text-white truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'Marco Rossi'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono truncate">
                {user ? 'Operatore Cloud' : 'Sessione Locale'}
              </span>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${
              activeDropdown === 'user' ? 'rotate-180' : ''
            }`} />
          </button>

          {/* User Popover */}
          {activeDropdown === 'user' && (
            <div 
              className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pb-3 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5 mb-1.5">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="" 
                      className="w-9 h-9 rounded-full border border-emerald-500/50 object-cover" 
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                      {user?.email ? user.email.slice(0, 2).toUpperCase() : 'MR'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold truncate">
                      {user?.displayName || 'Marco Rossi'}
                    </p>
                    <p className="text-slate-400 text-[11px] truncate font-mono">
                      {user?.email || 'Acquisitions Partner'}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 text-[11px] text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Google Cloud Firestore Connesso</span>
                </div>
              </div>

              <div className="py-1 space-y-1">
                <div className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400">
                  Stato Database & Persistenza
                </div>
                <div className="px-2 py-1 text-slate-300 text-xs flex justify-between">
                  <span>Immobili sincronizzati</span>
                  <span className="font-mono font-bold text-white">{cloudProperties.length}</span>
                </div>
                <div className="px-2 py-1 text-slate-300 text-xs flex justify-between">
                  <span>Task deliberati</span>
                  <span className="font-mono font-bold text-white">{cloudTasks.length}</span>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800">
                {user ? (
                  <button
                    onClick={() => {
                      signOutUser();
                      setActiveDropdown('none');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnetti Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      signInWithGoogle();
                      setActiveDropdown('none');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Accedi con Google</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
