import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Binary,
  ArrowRight,
  BrainCircuit,
  Compass,
  Check,
  BookOpen,
  FileText,
  Workflow,
  Sparkles,
  Printer,
  ChevronRight,
  Search,
  Sliders,
  Scale,
  Lock,
  Download,
  Loader2
} from 'lucide-react';
import { MethodologyPillars } from '../methodology/MethodologyPillars';
import { ConfidenceAndDegradationGuide } from '../methodology/ConfidenceAndDegradationGuide';
import { OperatingManualSOP } from '../methodology/OperatingManualSOP';
import { BiasAttributionTheory } from '../methodology/BiasAttributionTheory';
import { DataSourcesCatalogSection } from '../methodology/DataSourcesCatalogSection';
import { MethodologyFaqGlossary } from '../methodology/MethodologyFaqGlossary';
import { generateMethodologyPdf } from '../../utils/generateMethodologyPdf';

export const MethodologyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PILLARS' | 'CONFIDENCE' | 'SOP' | 'BIAS' | 'SOURCES' | 'FAQ_GLOSSARY' | 'ALL'>('PILLARS');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const chapters = [
    {
      id: 'PILLARS',
      number: '01',
      title: 'I 7 Pilastri & Formula Rating',
      subtitle: 'Formulazione matematica e scenari di pricing',
      icon: <Layers className="w-4 h-4" />,
      tag: 'MATEMATICA & RATING',
      color: 'cyan',
      borderColor: 'border-cyan-500/40',
      activeBg: 'bg-cyan-950/30 border-cyan-500 shadow-cyan-500/10',
      badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-800'
    },
    {
      id: 'CONFIDENCE',
      number: '02',
      title: 'Confidence & Degradazione',
      subtitle: 'Evidenza probatoria e fallback bayesiano',
      icon: <ShieldCheck className="w-4 h-4" />,
      tag: 'SICUREZZA & FALLBACK',
      color: 'emerald',
      borderColor: 'border-emerald-500/40',
      activeBg: 'bg-emerald-950/30 border-emerald-500 shadow-emerald-500/10',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    {
      id: 'SOP',
      number: '03',
      title: 'Manuale Operativo (SOP)',
      subtitle: 'Guida passo-passo per agenti e comitato',
      icon: <Workflow className="w-4 h-4" />,
      tag: 'PROCEDURE SUL CAMPO',
      color: 'blue',
      borderColor: 'border-blue-500/40',
      activeBg: 'bg-blue-950/30 border-blue-500 shadow-blue-500/10',
      badgeBg: 'bg-blue-950 text-blue-300 border-blue-800'
    },
    {
      id: 'BIAS',
      number: '04',
      title: 'World Model & Segregazione Bias',
      subtitle: 'Product Thesis v1.0 e protezione dati',
      icon: <Scale className="w-4 h-4" />,
      tag: 'TESI DI PRODOTTO',
      color: 'purple',
      borderColor: 'border-purple-500/40',
      activeBg: 'bg-purple-950/30 border-purple-500 shadow-purple-500/10',
      badgeBg: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    {
      id: 'SOURCES',
      number: '05',
      title: 'Fonti Dati & Telemetria',
      subtitle: 'Catasto, OMI, ARPA e dati macro',
      icon: <Database className="w-4 h-4" />,
      tag: 'DATA PIPELINE',
      color: 'amber',
      borderColor: 'border-amber-500/40',
      activeBg: 'bg-amber-950/30 border-amber-500 shadow-amber-500/10',
      badgeBg: 'bg-amber-950 text-amber-300 border-amber-800'
    },
    {
      id: 'FAQ_GLOSSARY',
      number: '06',
      title: 'Glossario Sigle & FAQ',
      subtitle: 'Tutte le sigle (MCA, OMI, RER, MRI, DOCFA, DOM, APE...) e risposte operative',
      icon: <BookOpen className="w-4 h-4" />,
      tag: 'GLOSSARIO SIGLE (27)',
      color: 'rose',
      borderColor: 'border-rose-500/40',
      activeBg: 'bg-rose-950/30 border-rose-500 shadow-rose-500/10',
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-800'
    }
  ] as const;

  const handleExportPdf = () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const generatedFileName = generateMethodologyPdf();
      setExportSuccessMsg(`PDF "${generatedFileName}" generato con successo!`);
      setTimeout(() => {
        setExportSuccessMsg(null);
      }, 5000);
    } catch (err) {
      console.error('Errore generazione PDF:', err);
      // Fallback sicuro alla stampa di sistema
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header con Titolo, Metadati e Azioni */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Governance, Trasparenza & Manuale Operativo Ufficiale</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">REDIP v1.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Methodology & Manuale Operativo del Decision Loop
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Documento metodologico unificato e standard operativo per agenti, analisti e comitato investimenti.
            Definisce la formulazione del Real Estate Rating, il modello probabilistico di confidenza e i protocolli del ciclo closed-loop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto relative">
          {/* Scorciatoia Diretta Glossario Sigle */}
          <button
            onClick={() => setActiveTab('FAQ_GLOSSARY')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              activeTab === 'FAQ_GLOSSARY'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-rose-500/30'
            }`}
            title="Apri il Glossario Completo delle Sigle e Acronimi (MCA, OMI, RER, MRI, DOCFA, DOM, APE, ARI...)"
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Glossario Sigle (27)</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'ALL' ? 'PILLARS' : 'ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Visualizza tutti i capitoli in un unico documento continuo"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeTab === 'ALL' ? 'Vista a Schede' : 'Leggi Tutto'}</span>
          </button>

          {/* Pulsante Principale Stampa / Scarica PDF */}
          <div className="relative">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 border border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/40 cursor-pointer disabled:opacity-60"
              title="Scarica immediatamente il Manuale Ufficiale in formato PDF ad alta definizione"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-950" />
              )}
              <span>{isExporting ? 'Generazione...' : 'Scarica PDF'}</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center transition-all cursor-pointer"
            title="Apri finestra di stampa del browser (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messaggio toast di conferma generazione PDF */}
      {exportSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono font-semibold">{exportSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-500/80">Salvataggio automatico completato</span>
        </div>
      )}

      {/* BANNER CARDINE: AI RECOMMENDS -> HUMAN DECIDES -> SYSTEM LEARNS */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
            Il Principio Fiduciario Cardine della Piattaforma
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Human-in-the-Loop Governance
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm lg:text-base font-bold text-white font-mono whitespace-nowrap shrink-0 overflow-x-auto">
            <span className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 whitespace-nowrap">
              1. AI recommends
            </span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
            <span className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 whitespace-nowrap">
              2. Human decides
            </span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
            <span className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 whitespace-nowrap">
              3. System learns
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed pt-1 border-t border-slate-800/60">
            L'intelligenza artificiale propone scenari quantitativi e intervalli di incertezza basati su dati oggettivi verificabili. 
            La decisione commerciale finale compete esclusivamente all'agente o al comitato investimenti. 
            Il tracciamento dell'esito contrattuale reale a rogito (T+90gg) chiude il loop di apprendimento continuo proteggendo il modello da inquinamento sistemico.
          </p>
        </div>
      </div>

      {/* Navigatore a Capitoli / Selettore Schede (Se non in modalità ALL) */}
      {activeTab !== 'ALL' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {chapters.map((chap) => {
            const isCurrent = activeTab === chap.id;
            return (
              <button
                key={chap.id}
                onClick={() => setActiveTab(chap.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isCurrent
                    ? `${chap.activeBg} text-white shadow-md`
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                {/* Accent top stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                  isCurrent ? `bg-${chap.color}-400` : 'bg-transparent'
                }`} />

                <div>
                  <div className="flex items-center justify-between mb-1.5 pt-0.5">
                    <span className={`text-[10px] font-mono font-bold ${isCurrent ? `text-${chap.color}-400` : 'text-slate-500'}`}>
                      CAP. {chap.number}
                    </span>
                    <div className={isCurrent ? `text-${chap.color}-400` : 'text-slate-500'}>
                      {chap.icon}
                    </div>
                  </div>
                  <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                    {chap.title}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider block truncate ${
                    isCurrent ? `${chap.badgeBg}` : 'bg-slate-900 text-slate-500'
                  }`}>
                    {chap.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Contenuto Dinamico: Singolo Capitolo o Intero Manuale (ALL) */}
      <div className="space-y-12">
        {/* CAPITOLO 01 */}
        {(activeTab === 'PILLARS' || activeTab === 'ALL') && (
          <section id="capitolo-1" className="space-y-4 p-5 sm:p-7 rounded-3xl bg-slate-950/70 border-2 border-cyan-500/30 shadow-xl shadow-cyan-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  CAPITOLO 01
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold hidden sm:inline">
                  MATEMATICA & RATING
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  I 7 Pilastri Analitici & Formulazione Matematica del Rating
                </h2>
              </div>
              <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-900/60 self-start sm:self-auto">
                Norma UNI 11612:2015 & IVS
              </span>
            </div>
            <MethodologyPillars />
          </section>
        )}

        {/* CAPITOLO 02 */}
        {(activeTab === 'CONFIDENCE' || activeTab === 'ALL') && (
          <section id="capitolo-2" className="space-y-4 p-5 sm:p-7 rounded-3xl bg-slate-950/70 border-2 border-emerald-500/30 shadow-xl shadow-emerald-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  CAPITOLO 02
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold hidden sm:inline">
                  SICUREZZA & FALLBACK
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  La Confidence & Il Principio di Graceful Degradation
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400/80 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-900/60 self-start sm:self-auto">
                Protocollo Fiduciario & Anti-Allucinazione
              </span>
            </div>
            <ConfidenceAndDegradationGuide />
          </section>
        )}

        {/* CAPITOLO 03 */}
        {(activeTab === 'SOP' || activeTab === 'ALL') && (
          <section id="capitolo-3" className="space-y-4 p-5 sm:p-7 rounded-3xl bg-slate-950/70 border-2 border-blue-500/30 shadow-xl shadow-blue-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-500/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                  CAPITOLO 03
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold hidden sm:inline">
                  PROCEDURE SUL CAMPO
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Manuale Operativo: Standard Operating Procedures (SOP) per il Team
                </h2>
              </div>
              <span className="text-xs font-mono text-blue-400/80 bg-blue-950/40 px-3 py-1 rounded-lg border border-blue-900/60 self-start sm:self-auto">
                Workflow Ciclico T0 → T14 → T90
              </span>
            </div>
            <OperatingManualSOP />
          </section>
        )}

        {/* CAPITOLO 04 */}
        {(activeTab === 'BIAS' || activeTab === 'ALL') && (
          <section id="capitolo-4" className="space-y-4 p-5 sm:p-7 rounded-3xl bg-slate-950/70 border-2 border-purple-500/30 shadow-xl shadow-purple-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  CAPITOLO 04
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold hidden sm:inline">
                  TESI DI PRODOTTO
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Product Thesis v1.0 — Segregazione Bias & World Model Sterilization
                </h2>
              </div>
              <span className="text-xs font-mono text-purple-400/80 bg-purple-950/40 px-3 py-1 rounded-lg border border-purple-900/60 self-start sm:self-auto">
                Architettura Anti-Inquinamento Dati
              </span>
            </div>
            <BiasAttributionTheory />
          </section>
        )}

        {/* CAPITOLO 05 */}
        {(activeTab === 'SOURCES' || activeTab === 'ALL') && (
          <section id="capitolo-5" className="space-y-4 p-5 sm:p-7 rounded-3xl bg-slate-950/70 border-2 border-amber-500/30 shadow-xl shadow-amber-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  CAPITOLO 05
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold hidden sm:inline">
                  DATA PIPELINE
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Catalogo Dati, Telemetria & Livelli di Integrazione
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-400/80 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-900/60 self-start sm:self-auto">
                6 Categorie Dati Certificate
              </span>
            </div>
            <DataSourcesCatalogSection />
          </section>
        )}

        {/* CAPITOLO 06 */}
        {(activeTab === 'FAQ_GLOSSARY' || activeTab === 'ALL') && (
          <section id="capitolo-6" className="space-y-4 p-5 sm:p-7 rounded-3xl bg-slate-950/70 border-2 border-rose-500/30 shadow-xl shadow-rose-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-500/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  CAPITOLO 06
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold hidden sm:inline">
                  GLOSSARIO SIGLE & FAQ
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Glossario Istituzionale delle Sigle & Domande Frequenti
                </h2>
              </div>
              <span className="text-xs font-mono text-rose-400/80 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-900/60 self-start sm:self-auto">
                27 Acronimi Censiti & Standard Normativi
              </span>
            </div>
            <MethodologyFaqGlossary />
          </section>
        )}
      </div>

      {/* Footer Metodologico & Compliance Note */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-bold">Standard Metodologico REDIP v1.4</span>
            <span>• Conforme alle Linee Guida ABI & Standard UNI 11612:2015</span>
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            Revisione Documento: 22 Settembre 2026
          </div>
        </div>

        <p className="text-slate-500 text-[11px] leading-relaxed">
          Le stime fornite da REDIP costituiscono valutazioni probabili e scenari quantitativi formulati a supporto del giudizio periziale dell’agente o del comitato investimenti. 
          Il sistema non sostituisce la perizia tecnica asseverata di legge nei procedimenti giudiziari o nelle formalizzazioni notarili ove espressamente richiesta.
        </p>
      </div>
    </div>
  );
};
