import React, { useState } from 'react';
import { 
  Layers, 
  Binary, 
  ChevronRight, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Sliders, 
  ShieldAlert,
  Info
} from 'lucide-react';

interface DimensionDetail {
  number: string;
  key: string;
  name: string;
  weight: number;
  weightLabel: string;
  desc: string;
  primaryIndicators: string[];
  benchmarkNorm: string;
  liquidityImpact: string;
  criticalRisks: string[];
}

export const MethodologyPillars: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('property');

  const dimensions: DimensionDetail[] = [
    {
      number: '01',
      key: 'property',
      name: 'Qualità Immobile & Architettura',
      weight: 0.18,
      weightLabel: '18%',
      desc: 'Valutazione intrinseca dell’asset: geometria, altezze interne, efficienza distributiva della pianta, stato degli impianti, finiture e classe energetica.',
      primaryIndicators: [
        'Rapporto superficie calpestabile/commerciale (efficienza distributiva > 85%)',
        'Altezza utile soffitti (standard 2.70m vs epoca > 3.20m)',
        'Esposizione solare e fattore medio di luce diurna (DF > 2%)',
        'Stato manutentivo impianti termoidraulici ed elettrici (certificazione di conformità)',
        'Classe energetica APE (A1-A4 bonus liquidità vs G penalizzazione tempo)'
      ],
      benchmarkNorm: 'UNI 11612:2015 & Linee Guida ABI per la valutazione degli immobili',
      liquidityImpact: 'Impatto elevato sul target di acquirenti e disponibilità all’over-asking.',
      criticalRisks: ['Impianti non certificabili', 'Difformità planimetrica strutturale', 'Assenza ascensore oltre il 3° piano']
    },
    {
      number: '02',
      key: 'location',
      name: 'Posizione, Trasporti & Microzona',
      weight: 0.20,
      weightLabel: '20%',
      desc: 'Analisi iper-locale della microzona: accessibilità al trasporto pubblico rapido, camminabilità verso servizi di prima necessità e decoro urbano.',
      primaryIndicators: [
        'Distanza a piedi da stazione Metro / Ferrovia Urbana (< 500m)',
        'Walkability Score verso farmacie, supermercati e scuole primarie (> 80/100)',
        'Prestigio dell’asse viario e continuità del tessuto commerciale attivo',
        'Rapporto domanda/offerta attivo nel raggio isocrono di 10 minuti a piedi',
        'Tasso di sicurezza urbana e vivibilità serale percepita'
      ],
      benchmarkNorm: 'Indice Isocrono di Accessibilità ISTAT / OpenStreetMap Network Analysis',
      liquidityImpact: 'Rappresenta il principale fattore di tenuta del valore nei cicli macroeconomici avversi.',
      criticalRisks: ['Isolamento da nodi di trasporto rapido', 'Degrado dell’arredo urbano circostante']
    },
    {
      number: '03',
      key: 'environment',
      name: 'Ambiente, Clima & Benessere',
      weight: 0.12,
      weightLabel: '12%',
      desc: 'Qualità dell’ambiente circostante: prossimità ad aree verdi fruibili, telemetria acustica, inquinanti atmosferici e resilienza a ondate di calore.',
      primaryIndicators: [
        'Distanza pedonale da parchi o giardini pubblici attrezzati (< 300m)',
        'Livello di inquinamento acustico diurno e notturno (dB Lden rilevati da mappe acustiche comunali)',
        'Concentrazione media annuale particolato PM2.5 e PM10 (telemetria stazioni ARPA)',
        'Indice di isola di calore urbana (UHI) e superficie permeabile di zona',
        'Esposizione a campi elettromagnetici o assi di traffico pesante'
      ],
      benchmarkNorm: 'Direttiva Europea Qualità dell’Aria 2008/50/CE & Standard OMS',
      liquidityImpact: 'Crescente incidenza sulla fascia di acquirenti famiglie e professionisti.',
      criticalRisks: ['Affaccio diretto su tangenziali/arterie ad alto scorrimento', 'Inquinamento acustico > 65 dB(A)']
    },
    {
      number: '04',
      key: 'risk',
      name: 'Rischio Tecnico, Giuridico & Conformità',
      weight: 0.14,
      weightLabel: '14%',
      desc: 'Audit legale e strutturale: regolarità edilizia e catastale, vincoli storico-paesaggistici, rischio idrogeologico/sismico e solvibilità condominiale.',
      primaryIndicators: [
        'Conformità tra stato di fatto, planimetria catastale e ultimo titolo abilitativo comunale',
        'Presenza di abusi edilizi sanabili vs insanabili',
        'Stato di conservazione delle parti comuni (facciate, tetto, colonne di scarico)',
        'Presenza di delibere condominiali per spese straordinarie o contenziosi legali attivi',
        'Mappa di pericolosità alluvione ISPRA (PAI) e classificazione sismica di zona'
      ],
      benchmarkNorm: 'DPR 380/2001 (Testo Unico Edilizia) & Norme Tecniche per le Costruzioni (NTC)',
      liquidityImpact: 'Fattore asimmetrico: un punteggio basso blocca la delibera e impedisce la compravendita.',
      criticalRisks: ['Difformità urbanistica insanabile', 'Spese straordinarie deliberate non accantonate']
    },
    {
      number: '05',
      key: 'market',
      name: 'Mercato, Concorrenza & Liquidità',
      weight: 0.16,
      weightLabel: '16%',
      desc: 'Dinamica commerciale della microzona: volume di annunci concorrenti attivi, giorni medi di assorbimento (DOM), tasso di sconto e pressione della domanda.',
      primaryIndicators: [
        'Giorni medi di permanenza sul mercato (DOM) per tipologia analoga nella microzona',
        'Stock di immobili concorrenti in vendita entro 800m con rapporto qualità/prezzo simile',
        'Tasso medio di sconto sul prezzo iniziale di richiesta (asking-to-close discount)',
        'Velocity Index: rapporto tra immobili compravenduti nel trimestre e offerta residua',
        'Elasticità della domanda locale rispetto a variazioni di prezzo dell’1-3%'
      ],
      benchmarkNorm: 'Banca Dati OMI Agenzia delle Entrate & Modello di Assorbimento REDIP',
      liquidityImpact: 'Determina l’orizzonte temporale ottimale di vendita e la probabilità di successo a 60gg.',
      criticalRisks: ['Saturazione di offerta concorrente a prezzi inferiori', 'DOM medio di zona > 180 giorni']
    },
    {
      number: '06',
      key: 'economics',
      name: 'Economia, Marginalità & Rendimento',
      weight: 0.12,
      weightLabel: '12%',
      desc: 'Sostenibilità economico-finanziaria: congruità del prezzo al mq rispetto alle curve edoniche, yield locativo potenziale e margine di sicurezza.',
      primaryIndicators: [
        'Prezzo al metro quadro commerciale rispetto alla mediana dei comparabili chiusi a rogito',
        'Rendimento locativo lordo potenziale a canone concordato o libero (Gross Yield %)',
        'Rapporto tra canone sostenibile medio e rata di mutuo standard (Affordability Ratio)',
        'Margine operativo di sicurezza (MOS) rispetto al worst-case scenario di svalutazione',
        'Costi stimati di riqualificazione o home staging per sbloccare il valore massimo'
      ],
      benchmarkNorm: 'International Valuation Standards (IVS) & Discounted Cash Flow Model',
      liquidityImpact: 'Cruciale per acquirenti investitori e acquirenti prima casa sensibili alla rata.',
      criticalRisks: ['Prezzo di acquisizione non coperto da comparabili bancari', 'Cap rate < 2.5% netto']
    },
    {
      number: '07',
      key: 'macro',
      name: 'Macroeconomia, Credito & Ciclo',
      weight: 0.08,
      weightLabel: '8%',
      desc: 'Fattori esogeni di sistema: andamento dei tassi BCE, disponibilità del credito bancario, inflazione dei costi di costruzione e trend demografici.',
      primaryIndicators: [
        'Livello del tasso Euribor a 3 mesi e IRS a 20 anni (impatto sulla capacità di indebitamento)',
        'Tasso medio di erogazione mutui residenziali e Loan-to-Value medio concesso dagli istituti',
        'Indice di fiducia dei consumatori e propensione all’acquisto di beni durevoli',
        'Tasso di inflazione ISTAT e impatto sul potere d’acquisto reale delle famiglie',
        'Fase del ciclo immobiliare zonale (Ripresa, Espansione, Picco, Rallentamento)'
      ],
      benchmarkNorm: 'Bollettino Economico Banca d’Italia & Statistiche BCE sui Mutui Residenziali',
      liquidityImpact: 'Condiziona la propensione generale all’acquisto e la rigidità negoziale degli istituti.',
      criticalRisks: ['Stretta creditizia con tassi oltre il 4.5%', 'Caduta delle erogazioni mutuo > 20% YoY']
    }
  ];

  const selectedDim = dimensions.find(d => d.key === selectedKey) || dimensions[0];

  return (
    <div className="space-y-6">
      {/* Formula Matematica Fondamentale */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Binary className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-tight uppercase font-mono text-[13px]">
            Equazione Fondamentale del Real Estate Rating REDIP
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Il <strong>Real Estate Rating</strong> è un indice sintetico, deterministico e cardinale scalato da 0 a 100.
          A differenza di un valore puramente estimativo, isola le caratteristiche intrinseche dell’asset dalla richiesta commerciale contingente:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 space-y-2 overflow-x-auto shadow-inner">
          <div className="font-bold text-emerald-400 text-sm">
            RATING = [ ∑ (Punteggio_Pilastro_i × Peso_i) ] × (1 - Penalità_Critica)
          </div>
          <div className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1 border-t border-slate-800">
            Dove <span className="font-mono text-cyan-300">∑ Peso_i = 1.00 (100%)</span> distribuito sulle 7 dimensioni canoniche. 
            La <span className="font-mono text-rose-400">Penalità_Critica</span> interviene in caso di difformità insanabile o rischio grave, applicando un cap asimmetrico sul punteggio finale per prevenire delibere su asset illiquidi o non compravendibili.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1 font-mono">Fascia AAA / AA (85-100)</span>
            <div className="font-bold text-emerald-400">Asset Prime / Trophy</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Liquidità immediata (&lt; 45gg), minimo sconto, massima resilienza.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1 font-mono">Fascia A / BBB (65-84)</span>
            <div className="font-bold text-cyan-400">Standard Istituzionale</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Commercializzazione standard (60-90gg) a prezzo allineato al mercato.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1 font-mono">Fascia BB / C (&lt; 65)</span>
            <div className="font-bold text-amber-400">Attenzione & Rischio</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Richiede sconto aggressivo, riqualificazione o audit tecnico integrativo.</div>
          </div>
        </div>
      </div>

      {/* Explorer Interattivo delle 7 Dimensioni */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              I 7 Pilastri di Valutazione Analitica
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Seleziona una dimensione per ispezionare gli indicatori e le norme di riferimento
          </span>
        </div>

        {/* Tab dei 7 Pilastri */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {dimensions.map((dim) => {
            const isSelected = dim.key === selectedKey;
            return (
              <button
                key={dim.key}
                onClick={() => setSelectedKey(dim.key)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {dim.number}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {dim.weightLabel}
                  </span>
                </div>
                <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {dim.name.split('&')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dettaglio Dimensione Selezionata */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">Pilastro {selectedDim.number}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                  Peso Ponderale: {selectedDim.weightLabel}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mt-1">
                {selectedDim.name}
              </h4>
            </div>

            <div className="text-right sm:max-w-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Norma & Standard</span>
              <span className="text-xs text-slate-300 font-mono">{selectedDim.benchmarkNorm}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedDim.desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Indicatori Primari Monitorati dal Motore
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedDim.primaryIndicators.map((ind, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-[10px] mt-1 font-mono">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Impatto sulla Liquidità & Velocità di Assorbimento
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDim.liquidityImpact}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Anomalie Bloccanti & Trigger di Allerta
                </span>
                <ul className="space-y-1 text-xs text-rose-300">
                  {selectedDim.criticalRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 text-[10px] mt-0.5 font-mono">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Box Scenari di Pricing Ottimale */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sliders className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-tight">
            I 3 Scenari di Pricing Algoritmico (Step 1)
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In sede di delibera, l'algoritmo non propone un unico prezzo fisso, ma una triplice curva di posizionamento commerciale con trade-off espliciti tra tempo di realizzo e marginalità:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400">SCENARIO A</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Target 30-45gg
              </span>
            </div>
            <div className="text-white font-bold text-sm">Massima Liquidità / Fast Sell</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Prezzo fissato leggermente sotto la mediana dei comparabili (-2% / -3%). Massimizza il volume di visite e genera offerte concorrenziali nei primi 14 giorni.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/50 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-400">SCENARIO B</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Target 60-90gg • Consigliato
              </span>
            </div>
            <div className="text-white font-bold text-sm">Allineamento di Mercato</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Equilibrio ottimale tra prezzo periziato e tempi standard di compravendita di zona. Assorbe le trattative senza rischiare l’invecchiamento dell’annuncio.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-400">SCENARIO C</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Target 120-180gg
              </span>
            </div>
            <div className="text-white font-bold text-sm">Massimizzazione del Valore</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Prezzo ambizioso per asset con caratteristiche uniche o per proprietari non pressati dal fattore tempo. Richiede budget marketing potenziato e tollera trattative più lunghe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
