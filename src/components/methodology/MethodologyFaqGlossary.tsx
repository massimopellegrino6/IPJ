import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  BookMarked, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  Info,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Tag,
  Filter,
  ExternalLink,
  Scale,
  FileCheck,
  Compass,
  Cpu,
  Building2,
  Calendar,
  Zap,
  BarChart3,
  Key
} from 'lucide-react';

export type AcronymCategory = 'ALL' | 'ESTIMO' | 'CATASTO' | 'MERCATO' | 'ALGORITMO';

export interface GlossaryAcronymItem {
  acronym: string;
  fullName: string;
  category: 'ESTIMO' | 'CATASTO' | 'MERCATO' | 'ALGORITMO';
  categoryLabel: string;
  definition: string;
  operationalContext: string;
  regulatoryReference?: string;
  practicalExample?: string;
}

export interface FaqItem {
  question: string;
  category: 'RATING' | 'DELIBERA' | 'CHECKPOINT' | 'GOVERNANCE';
  answer: string;
  ruleReference: string;
  relatedAcronyms?: string[];
}

export const ACRONYMS_DATABASE: GlossaryAcronymItem[] = [
  {
    acronym: 'REDIP',
    fullName: 'Real Estate Decision Intelligence Platform',
    category: 'ALGORITMO',
    categoryLabel: 'Algoritmo & Piattaforma',
    definition: 'Piattaforma software istituzionale di Decision Intelligence Immobiliare che unifica modelli di rating deterministico, evidenze probatorie catastali, stime comparative e loop di telemetria empirica.',
    operationalContext: 'È il sistema centrale che guida l\'agente dall\'ingestion del mandato fino alla delibera di prezzo e alla conciliazione a T+90 giorni.',
    regulatoryReference: 'Standard Architetturale Closed-Loop v1.4',
    practicalExample: 'REDIP formula una raccomandazione su 3 scenari (A, B, C) e registra l\'eventuale deviazione decisa dal broker per calibrare i pesi futuri.'
  },
  {
    acronym: 'RER',
    fullName: 'Real Estate Rating (Rating Immobiliare Integrato)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Punteggio cardinale normalizzato da 0 a 100 che sintetizza la qualità intrinseca, il contesto territoriale, la conformità tecnica e l\'elasticità commerciale di un immobile.',
    operationalContext: 'Parametro dirimente per autorizzare la firma del mandato in esclusiva e per calibrare lo sconto massimo raccomandato in negoziazione.',
    regulatoryReference: 'Formula Deterministica a 7 Pilastri REDIP • Linee Guida ABI',
    practicalExample: 'Un RER di 82/100 ("STRONG") indica un immobile con alta commerciabilità, conformità catastale verificata e tempo medio di vendita previsto inferiore a 60 giorni.'
  },
  {
    acronym: 'CONF',
    fullName: 'Rating Confidence Score (Grado di Confidenza Informativa)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Misura probabilistica (0–100%) che quantifica la solidità, granularità e freschezza dei dati a supporto della stima e del rating assegnato all\'immobile.',
    operationalContext: 'Se CONF < 50%, il sistema inibisce automaticamente l\'Action Score prescrittivo («Prescrizione non disponibile: evidenza empirica insufficiente»). Con rogiti verificati e Audit Catastale validato sale a >= 90%.',
    regulatoryReference: 'Protocollo di Graceful Degradation (§28 Product Thesis)',
    practicalExample: 'Asset censito solo con dati OMI generici: CONF = 48% (Action Score inibito); con caricamento Visura AdE e comparabili notarili: CONF = 93%.'
  },
  {
    acronym: 'MCA',
    fullName: 'Market Comparison Approach (Stima per Comparazione di Mercato)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Metodo estimativo internazionale a rigore scientifico che determina il valore di mercato confrontando l\'immobile oggetto di stima con immobili comparabili recentemente compravenduti, applicando coefficienti marginali di correzione.',
    operationalContext: 'Calcola il Valore Congruo di Perizia (€ e €/m²) all\'interno della scheda Intelligence, rettificando differenze di piano, superficie, esposizione e classe energetica.',
    regulatoryReference: 'Standard IVS 105 • Norma UNI 11612:2015 • Linee Guida ABI 2018',
    practicalExample: 'Un comparabile a 200m venduto a 4.100 €/m² al piano 1 senza ascensore genera un valore rettificato di 4.450 €/m² per il nostro soggetto al piano 3 con ascensore.'
  },
  {
    acronym: 'OMI',
    fullName: 'Osservatorio del Mercato Immobiliare (Banca Dati Ufficiale AdE)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Banca dati ufficiale gestita dall\'Agenzia delle Entrate che rileva semestralmente i valori minimi e massimi di mercato e di locazione per metro quadro (€/m²) per ciascuna zona omogenea censuaria.',
    operationalContext: 'Rappresenta l\'ancora macrozonale di sicurezza nel Pilastro 5 (Mercato) per verificare che il prezzo di perizia rientri nelle forchette fiscali e statistiche di zona.',
    regulatoryReference: 'Agenzia delle Entrate • D.P.R. 138/1998',
    practicalExample: 'Per la microzona "Prati / Delle Vittorie" a Roma, OMI stabilisce una fascia tra 3.800 €/m² e 4.700 €/m² per abitazioni civili in stato normale.'
  },
  {
    acronym: 'AdE',
    fullName: 'Agenzia delle Entrate',
    category: 'CATASTO',
    categoryLabel: 'Catasto & Normativa',
    definition: 'Ente pubblico che vigila sull\'amministrazione tributaria, gestisce il Catasto Terreni ed Edilizio Urbano e conserva gli atti traslativi di proprietà e rogiti notarili.',
    operationalContext: 'REDIP si interfaccia con i tracciati AdE per l\'auto-compilazione da visura, l\'estrazione dei dati censuari e il riscontro del valore fiscale degli atti.',
    regulatoryReference: 'Ministero dell\'Economia e delle Finanze • D.Lgs. 300/1999',
    practicalExample: 'Il pulsante "Auto-compila da Visura AdE" estrae istantaneamente foglio, particella, subalterno, categoria A/2 e rendita catastale di 395,09 €.'
  },
  {
    acronym: 'DOCFA',
    fullName: 'Documenti Catasto Fabbricati (Aggiornamento Planimetrie & Schede)',
    category: 'CATASTO',
    categoryLabel: 'Catasto & Normativa',
    definition: 'Procedura informatica e modello ministeriale per la redazione e l\'inoltro telematico delle variazioni catastali (accatastamenti, frazionamenti, rettifiche planimetriche e attribuzione rendita).',
    operationalContext: 'Nel Dossier Tecnico di REDIP è verificata la conformità dell\'ultimo DOCFA registrato rispetto allo stato di fatto reale dei locali (Pilastro 4: Rischio Tecnico).',
    regulatoryReference: 'Circolare Ministero delle Finanze n. 9/2001 • D.M. 701/1994',
    practicalExample: 'Se è stata rimossa una parete interna ma manca la pratica DOCFA, REDIP segnala "Difformità Scheda Catastale" imponendo la sanatoria prima del rogito.'
  },
  {
    acronym: 'APE',
    fullName: 'Attestato di Prestazione Energetica',
    category: 'CATASTO',
    categoryLabel: 'Catasto & Normativa',
    definition: 'Documento ufficiale asseverato da tecnico abilitato che certifica il consumo energetico dell\'edificio (indice EPgl,nren in kWh/m² anno) assegnando una classe da G ad A4.',
    operationalContext: 'Alimenta il Pilastro 6 (Environment & Sustainability, 12%) e incide come coefficiente marginale di correzione edonica nel calcolo comparativo MCA.',
    regulatoryReference: 'D.Lgs. 192/2005 • D.M. 26/06/2015 "Linee Guida Nazionali per l\'APE"',
    practicalExample: 'Un trilocale di 95 m² in classe A2 registra un abbattimento stimato delle spese di riscaldamento del 65% rispetto a un omologo in classe F.'
  },
  {
    acronym: 'DOM',
    fullName: 'Days on Market (Tempo di Permanenza sul Mercato)',
    category: 'MERCATO',
    categoryLabel: 'Mercato & Telemetria',
    definition: 'Numero di giorni solari intercorrenti tra la prima pubblicazione dell\'annuncio di vendita e la firma della proposta di acquisto accettata e vincolante.',
    operationalContext: 'REDIP stima il DOM per ciascuno dei 3 scenari commerciali (es. Scenario A: 30-45gg, Scenario B: 60-90gg, Scenario C: 120-180gg) monitorando l\'invecchiamento dell\'annuncio.',
    regulatoryReference: 'Metrica Econometrica di Liquidità REDIP',
    practicalExample: 'Un DOM superiore a 120 giorni nella microzona Prati segnala rigetto del prezzo e fa scattare l\'alert arancione di riposizionamento strategico.'
  },
  {
    acronym: 'MRI',
    fullName: 'Market Response Index (Indice di Risposta del Mercato)',
    category: 'MERCATO',
    categoryLabel: 'Mercato & Telemetria',
    definition: 'Indice sintetico (0–100) calcolato automaticamente a 14–21 giorni dalla delibera del prezzo. Pondera volume di contatti (lead), visite effettuate e sentiment del prezzo espresso dai compratori.',
    operationalContext: 'Se MRI < 40/100, la piattaforma avvisa che il mercato sta rifiutando il prezzo deliberato, suggerendo la prescrizione di ribasso contrattuale concordata col venditore.',
    regulatoryReference: 'Algoritmo Closed-Loop Checkpoint T+14 (§4 Manuale Operativo)',
    practicalExample: 'Dopo 14 giorni: 8 leads ricevuti (+33%), 4 visite concluse, feedback "Prezzo Equo" -> MRI = 78/100 (Stato: PROXY_CONFIRMED).'
  },
  {
    acronym: 'OES',
    fullName: 'Operative Effort Score (Indice di Impegno Operativo dell\'Agenzia)',
    category: 'ALGORITMO',
    categoryLabel: 'Algoritmo & Piattaforma',
    definition: 'Punteggio normalizzato (0.00–1.00) calcolato a consuntivo (T+90gg) che misura l\'effettiva diligenza dell\'agenzia mandataria (tempo medio di risposta lead, visite svolte, canali adv attivati).',
    operationalContext: 'Fondamentale per la World Model Sterilization: se l\'immobile non si vende ma l\'OES è basso (< 0.40), la colpa è dell\'agenzia e il valore stimato dell\'immobile NON viene penalizzato.',
    regulatoryReference: 'Product Thesis v1.0 • Segregazione Bias Organizzativo',
    practicalExample: 'OES = 0.88 (tempo risposta 15 min, 12 visite, vetrina sponsorizzata attiva): dimostra che la mancata vendita dipende dal prezzo eccessivo voluto dal proprietario.'
  },
  {
    acronym: 'ARI',
    fullName: 'Asset Risk Index (Indice di Rischio Catastale & Urbanistico)',
    category: 'CATASTO',
    categoryLabel: 'Catasto & Normativa',
    definition: 'Pilastro analitico cardinale (0–100, peso 15%) che sintetizza la conformità tecnico-giuridica, la sicurezza dello stabile e i vincoli gravanti sull\'asset.',
    operationalContext: 'Integrato con il modulo Audit Documentale (5/5 check), i cui stati di qualifica (VERIFIED, NEEDS_AUDIT, AMNESTY_IN_PROGRESS) determinano la regolarità contrattuale e assegnano un boost di confidenza del +8% in caso di verifica completa.',
    regulatoryReference: 'Pilastro 4 REDIP • Audit Catastale • D.P.R. 380/2001',
    practicalExample: 'Asset con ARI = VERIFIED e rendita verificata: garantisce la totale regolarità urbanistica per l\'erogazione del mutuo notarile.'
  },
  {
    acronym: 'IVS',
    fullName: 'International Valuation Standards (Standard Internazionali di Stima)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Principi e norme tecniche internazionali emesse dall\'International Valuation Standards Council (IVSC) per l\'elaborazione di valutazioni immobiliari asseverate, comparabili e scientificamente solide.',
    operationalContext: 'Costituisce il fondamento metodologico su cui è costruito l\'algoritmo di calcolo del Valore Congruo e il report peritale esportabile in PDF.',
    regulatoryReference: 'IVS 104 "Basi di Valore" • IVS 105 "Approcci Estimativi"',
    practicalExample: 'Il dossier PDF esportato da REDIP include l\'asseverazione di conformità agli standard IVS per l\'utilizzo bancario e giudiziale.'
  },
  {
    acronym: 'ABI',
    fullName: 'Associazione Bancaria Italiana (Linee Guida Perizie Immobiliari)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Linee Guida ufficiali sottoscritte dall\'ABI con gli Ordini Professionali per la stima degli immobili posti a garanzia dei crediti bancari (mutui ipotecari).',
    operationalContext: 'Garantisce che il Valore Congruo stimato da REDIP sia accettato senza contestazioni dagli istituti di credito per l\'erogazione del mutuo agli acquirenti.',
    regulatoryReference: 'Linee Guida ABI per la valutazione degli immobili 2018',
    practicalExample: 'La stima di REDIP rispetta la trasparenza richiesta dall\'ABI, indicando espressamente le fonti dei comparabili e l\'analisi di sensibilità sul prezzo.'
  },
  {
    acronym: 'POI',
    fullName: 'Point of Interest (Punti di Interesse Geospaziali)',
    category: 'MERCATO',
    categoryLabel: 'Mercato & Telemetria',
    definition: 'Infrastrutture, servizi e presidi pubblici/privati (stazioni metropolitane, fermate tram, scuole, parchi urbani, farmacie, supermercati) geolocalizzati attorno all\'immobile nel raggio di 500-1500m.',
    operationalContext: 'Alimentano il Pilastro 2 (Location & Connettività) calcolando l\'indice di camminabilità (Walkability Score) e l\'accessibilità al trasporto rapido di massa.',
    regulatoryReference: 'Database Geospaziale OpenStreetMap & Overpass API',
    practicalExample: 'Immobile con 12 POI entro 400 metri (Metro B a 250m, 2 farmacie, parco pubblico): punteggio Location = 88/100.'
  },
  {
    acronym: 'CTR',
    fullName: 'Click-Through Rate (Tasso di Clic Annunci Portali)',
    category: 'MERCATO',
    categoryLabel: 'Mercato & Telemetria',
    definition: 'Rapporto percentuale tra gli utenti che aprono la scheda dettagliata dell\'annuncio sui portali (Immobiliare.it, Idealista, Casa.it) e il numero totale di impression (visualizzazioni in elenco).',
    operationalContext: 'Monitorato nel Checkpoint T+14 per verificare se la foto di copertina e il prezzo attirano l\'attenzione del target. Un CTR > 3.0% indica forte appeal iniziale.',
    regulatoryReference: 'Telemetria Portali Immobiliari Partner',
    practicalExample: 'CTR medio di microzona = 1.8%; l\'annuncio di Via Nomentana registra un CTR del 3.4% (+32% rispetto al benchmark).'
  },
  {
    acronym: 'CRM',
    fullName: 'Customer Relationship Management (Gestione Acquirenti & Matching)',
    category: 'MERCATO',
    categoryLabel: 'Mercato & Telemetria',
    definition: 'Modulo integrato in REDIP che archivia e profila la domanda reale di acquirenti qualificati (budget massimo, timeline di acquisto, cluster familiare e preferenze di zona).',
    operationalContext: 'Determina l\'Agency Fit Score: calcola quanti clienti del database agenziale sono immediatamente pronti all\'acquisto dell\'immobile senza dover attendere i portali.',
    regulatoryReference: 'Modulo Demand Matching & Agency Fit REDIP',
    practicalExample: 'Immobile censito in Via Nomentana: il CRM rileva 23 acquirenti attivi compatibili con budget medio di 480.000 €, assegnando Agency Fit = 94/100.'
  },
  {
    acronym: 'SOP',
    fullName: 'Standard Operating Procedure (Procedure Operative Standard)',
    category: 'ALGORITMO',
    categoryLabel: 'Algoritmo & Piattaforma',
    definition: 'Insieme codificato di 5 regole e protocolli comportamentali obbligatori per il personale di agenzia (Ingestion, Delibera con comitato, Checkpoint T+14, Audit T+90, Feedback loop).',
    operationalContext: 'Garantisce l\'uniformità della qualità peritale e standardizza il comportamento degli agenti, eliminando la variabilità soggettiva nella gestione del cliente.',
    regulatoryReference: 'Capitolo 03 Methodology: Manuale Operativo SOP',
    practicalExample: 'SOP 02 impone che ogni delibera con prezzo > 15% rispetto allo Scenario B richieda la validazione scritta dell\'Head of Acquisitions.'
  },
  {
    acronym: 'DEL',
    fullName: 'Decision Event Log (Registro Immutabile degli Eventi Decisionali)',
    category: 'ALGORITMO',
    categoryLabel: 'Algoritmo & Piattaforma',
    definition: 'Registro digitale sequenziale e immutabile che traccia ogni decisione umana presa sulla piattaforma: timestamp, raccomandazione AI, delibera scelta, note periziali e scostamento.',
    operationalContext: 'Fornisce l\'audit trail completo per l\'analisi bayesiana a posteriori, permettendo di quantificare l\'Alpha generato dall\'intuito dell\'agente rispetto alla macchina.',
    regulatoryReference: 'Architettura Closed-Loop Audit Trail • Firestore Collection decision_logs',
    practicalExample: 'Evento `del_log_001`: Agente sceglie Scenario B a 395.000 € (+15k su raccomandazione) motivando "Venditore rigido in fase di trattativa iniziale".'
  },
  {
    acronym: 'RBAC',
    fullName: 'Role-Based Access Control (Controllo Accessi Basato sui Ruoli)',
    category: 'ALGORITMO',
    categoryLabel: 'Algoritmo & Piattaforma',
    definition: 'Modello di sicurezza che vincola la lettura e la scrittura dei dati in piattaforma in base al ruolo dell\'operatore (Junior Broker, Listing Partner, Head of Acquisitions, Super Admin).',
    operationalContext: 'Protegge i dati sensibili dei clienti e garantisce che solo figure autorizzate possano validare override di prezzo o sterilizzare bias nel World Model.',
    regulatoryReference: 'Sicurezza Zero-Trust & Firestore Security Rules',
    practicalExample: 'Un Junior Broker può censire un immobile ed elaborare la stima, ma la firma della delibera oltre 1 milione di euro richiede il ruolo Head of Acquisitions.'
  },
  {
    acronym: 'FGL / PART / SUB',
    fullName: 'Foglio, Particella, Subalterno (Coordinate Catastali Univoche)',
    category: 'CATASTO',
    categoryLabel: 'Catasto & Normativa',
    definition: 'Identificatori alfanumerici univoci attribuiti dal Catasto Fabbricati a ciascuna unità immobiliare autonoma presente sul territorio del comune censuario.',
    operationalContext: 'Costituiscono la chiave primaria di georeferenziazione e riscontro peritale; indispensabili per collegare l\'immobile alle visure AdE e alle planimetrie storiche.',
    regulatoryReference: 'Catasto Edilizio Urbano (CEU) • R.D.L. 652/1939',
    practicalExample: 'Comune di Campobasso (CB), Foglio 125, Particella 106, Subalterno 14: identifica in modo inequivocabile l\'appartamento al piano 2 scala A.'
  },
  {
    acronym: 'SLA',
    fullName: 'Service Level Agreement (Tempi di Risposta & Standard di Servizio)',
    category: 'MERCATO',
    categoryLabel: 'Mercato & Telemetria',
    definition: 'Standard contrattuale interno che stabilisce i tempi massimi di reazione dell\'agenzia su ciascun contatto o richiesta di visita proveniente dai canali marketing.',
    operationalContext: 'Monitorato nell\'Operative Effort Score (OES): contattare un lead entro 120 minuti garantisce un tasso di conversione in visita 4 volte superiore a una risposta tardiva.',
    regulatoryReference: 'Matrice di Efficienza Commerciale REDIP',
    practicalExample: 'SLA target: primo contatto telefonico al compratore entro 60 minuti dalla ricezione del form online.'
  },
  {
    acronym: 'LTV',
    fullName: 'Loan-to-Value (Rapporto Mutuo su Valore di Perizia)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Rapporto percentuale tra l\'importo del mutuo concesso dalla banca e il valore cauzionale/congruo dell\'immobile accertato dal perito.',
    operationalContext: 'Se il prezzo deliberato eccede di molto il Valore Congruo stimato da REDIP, la perizia bancaria risulterà inferiore al prezzo concordato, facendo fallire la delibera del mutuo (LTV cap a 80%).',
    regulatoryReference: 'Normativa di Vigilanza Bancaria Banca d\'Italia / BCE',
    practicalExample: 'Prezzo pattuito 500k €, perizia banca 440k €: la banca eroga l\'80% di 440k (352k €), costringendo l\'acquirente a un extra anticipo di 48k € o facendo saltare l\'affare.'
  },
  {
    acronym: 'CAPEX',
    fullName: 'Capital Expenditure (Spese Straordinarie di Ristrutturazione)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Investimenti in conto capitale necessari per riqualificare un immobile in stato conservativo degradato o per adeguamenti straordinari delle parti comuni condominiali (facciata, tetto, ascensore).',
    operationalContext: 'Nel Pilastro 1 (Immobile) e nella stima del Valore Congruo Netto, i CAPEX stimati vengono decurtati per riflettere il reale onere finanziario a carico dell\'acquirente.',
    regulatoryReference: 'Analisi Finanziaria Estimativa DCF & Cost Approach',
    practicalExample: 'Immobile stimato a 3.500 €/m² in buone condizioni: per stato "Da Ristrutturare" con CAPEX di 650 €/m², il valore di perizia congruo scende a 2.850 €/m².'
  },
  {
    acronym: 'OPEX',
    fullName: 'Operating Expense (Spese Ordinarie di Gestione)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Spese correnti ordinarie sostenute periodicamente dal proprietario per il mantenimento in efficienza dell\'immobile (quote ordinarie di condominio, IMU, assicurazione incendio, riscaldamento centralizzato).',
    operationalContext: 'Valutate nel Pilastro 6 (Economics): spese condominiali sproporzionate (> 250 €/mese per trilocale) riducono il potere di acquisto dell\'acquirente e penalizzano il rating di liquidità.',
    regulatoryReference: 'Rendicontazione Condominiale ex L. 220/2012',
    practicalExample: 'Condominio d\'epoca con portineria 24h e OPEX di 4.800 €/anno: il modello applica una rettifica negativa del -3.5% sul valore per compensare l\'elevato costo ricorrente.'
  },
  {
    acronym: 'DPR 380/01',
    fullName: 'D.P.R. 6 giugno 2001, n. 380 (Testo Unico dell\'Edilizia)',
    category: 'CATASTO',
    categoryLabel: 'Catasto & Normativa',
    definition: 'Legge quadro nazionale che disciplina i titoli abilitativi edilizi (Permesso di Costruire, SCIA, CILA), la conformità urbanistica e le procedure di accertamento di conformità (art. 36) e tolleranze costruttive (art. 34-bis).',
    operationalContext: 'Costituisce il riferimento normativo vincolante per l\'Audit Catastale di REDIP. Qualsiasi difformità strutturale priva di titolo edilizio fa scattare l\'Hard Stop di conformità.',
    regulatoryReference: 'Gazzetta Ufficiale n. 245 del 20 ottobre 2001',
    practicalExample: 'Verifica dello stato legittimo dell\'immobile rispetto al progetto originario depositato in Comune (licenza edilizia o concessione).'
  },
  {
    acronym: 'UNI 11612',
    fullName: 'Norma UNI 11612:2015 (Stima del Valore di Mercato degli Immobili)',
    category: 'ESTIMO',
    categoryLabel: 'Estimo & Prezzo',
    definition: 'Norma tecnica emanata dall\'Ente Italiano di Normazione (UNI) che codifica i metodi estimativi riconosciuti per la perizia di stima degli immobili residenziali e commerciali in Italia.',
    operationalContext: 'Garantisce la trasparenza e scientificità del motore di stima REDIP, certificando l\'assenza di formule arbitrarie o "black-box" non asseverabili in tribunale.',
    regulatoryReference: 'Ente Nazionale Italiano di Unificazione (UNI) • Edizione 2015',
    practicalExample: 'Tutti i coefficienti correttivi applicati ai comparabili MCA in REDIP sono conformi alle tabelle di ponderazione della norma UNI 11612.'
  }
];

export const FAQS_DATABASE: FaqItem[] = [
  {
    question: 'Come si comporta REDIP se l’immobile presenta una difformità planimetrica non sanata?',
    category: 'RATING',
    answer: 'Il Pilastro 4 (Rischio Tecnico & Conformità) applica una penalità asimmetrica che riduce il rating sotto 50/100 e attiva la bandiera rossa di STOP fiduciario. La piattaforma consente di procedere alla delibera solo dopo aver caricato la stima dei costi di sanatoria o dopo la rettifica della scheda catastale DOCFA.',
    ruleReference: 'Protocollo Fiduciario Hard Stop 2 • DPR 380/2001',
    relatedAcronyms: ['DOCFA', 'ARI', 'RER', 'DPR 380/01']
  },
  {
    question: 'Cosa accade se un agente delibera un prezzo di oltre il 15% superiore allo Scenario B consigliato?',
    category: 'DELIBERA',
    answer: 'Il sistema attiva lo stato di OVERRIDE_SUPERIORE. La delibera richiede la compilazione obbligatoria delle note periziali strutturate (indicazione di ristrutturazioni eccezionali, arredi su misura, o acquirenti già qualificati in portafoglio). Il record viene archiviato nell’audit trail immutabile DEL (Decision Event Log) e monitorato con priorità al Checkpoint T+14.',
    ruleReference: 'SOP 02 • Delibera e Human-in-the-Loop Audit',
    relatedAcronyms: ['DEL', 'SOP', 'MRI', 'DOM']
  },
  {
    question: 'Qual è il momento esatto per eseguire il Checkpoint Empirico e come incide sul Market Response Index (MRI)?',
    category: 'CHECKPOINT',
    answer: 'La finestra ideale è tra il 14° e il 21° giorno di pubblicazione. Eseguire il checkpoint permette di calcolare l\'indice MRI a partire da contatti reali, CTR dei portali e visite effettuate, intervenendo con un ribasso contrattuale concordato prima che l’annuncio subisca l\'invecchiamento dei portali (Listing Decay).',
    ruleReference: 'SOP 04 • Checkpoint Empirico T+14',
    relatedAcronyms: ['MRI', 'CTR', 'DOM', 'SOP']
  },
  {
    question: 'Perché una mancata vendita con basso impegno dell’agenzia (OES < 0.40) non riduce la stima dell’immobile?',
    category: 'GOVERNANCE',
    answer: 'Perché l’insuccesso è attribuibile all\'inerzia operativa dell\'agenzia (tempo di risposta lead lento, visite non effettuate, budget non speso). Se l’algoritmo svalutasse l’immobile, registrerebbe un falso segnale avvelenando le stime future. Attraverso la World Model Sterilization, l\'errore viene computato solo sulla metrica interna dell\'agenzia, preservando l\'oggettività del valore dell\'immobile.',
    ruleReference: 'Product Thesis v1.0 • Segregazione Attribuzione & World Model',
    relatedAcronyms: ['OES', 'REDIP', 'SLA']
  },
  {
    question: 'Il report peritale generato da REDIP ha validità formale per banche, acquirenti e notai?',
    category: 'GOVERNANCE',
    answer: 'Sì. Il report esportabile in PDF include l’audit trail completo delle fonti, i comparabili MCA certificati, le fasce OMI dell\'Agenzia delle Entrate, la conformità alle Linee Guida ABI e alla norma UNI 11612:2015. Costituisce un dossier periziale asseverabile ad alto rigore metodologico conforme agli standard IVS (International Valuation Standards).',
    ruleReference: 'Standard Normativo UNI 11612:2015 & IVS 105 • Linee Guida ABI',
    relatedAcronyms: ['IVS', 'ABI', 'UNI 11612', 'MCA', 'OMI', 'AdE']
  }
];

export const MethodologyFaqGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<AcronymCategory>('ALL');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('ALL');
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);
  const [copiedAcronym, setCopiedAcronym] = useState<string | null>(null);

  const toggleFaq = (idx: number) => {
    if (openFaqIndices.includes(idx)) {
      setOpenFaqIndices(openFaqIndices.filter(i => i !== idx));
    } else {
      setOpenFaqIndices([...openFaqIndices, idx]);
    }
  };

  const handleCopyDefinition = (item: GlossaryAcronymItem) => {
    const textToCopy = `${item.acronym} - ${item.fullName}\nDefinizione: ${item.definition}\nRuolo Operativo: ${item.operationalContext}${item.regulatoryReference ? `\nRiferimento: ${item.regulatoryReference}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAcronym(item.acronym);
    setTimeout(() => {
      setCopiedAcronym(null);
    }, 2500);
  };

  // Filtered Acronyms
  const filteredAcronyms = useMemo(() => {
    return ACRONYMS_DATABASE.filter(item => {
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchCategory;

      const matchSearch = 
        item.acronym.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.operationalContext.toLowerCase().includes(q) ||
        (item.regulatoryReference && item.regulatoryReference.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQS_DATABASE.filter(f => {
      const matchCat = selectedFaqCategory === 'ALL' || f.category === selectedFaqCategory;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchCat;

      const matchSearch = 
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        (f.relatedAcronyms && f.relatedAcronyms.some(a => a.toLowerCase().includes(q)));

      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedFaqCategory]);

  const categoryCounts = useMemo(() => {
    return {
      ALL: ACRONYMS_DATABASE.length,
      ESTIMO: ACRONYMS_DATABASE.filter(a => a.category === 'ESTIMO').length,
      CATASTO: ACRONYMS_DATABASE.filter(a => a.category === 'CATASTO').length,
      MERCATO: ACRONYMS_DATABASE.filter(a => a.category === 'MERCATO').length,
      ALGORITMO: ACRONYMS_DATABASE.filter(a => a.category === 'ALGORITMO').length,
    };
  }, []);

  const getCategoryColor = (cat: GlossaryAcronymItem['category']) => {
    switch (cat) {
      case 'ESTIMO':
        return {
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
          border: 'border-cyan-500/30 hover:border-cyan-500/60',
          icon: <Scale className="w-3.5 h-3.5 text-cyan-400" />
        };
      case 'CATASTO':
        return {
          badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          border: 'border-amber-500/30 hover:border-amber-500/60',
          icon: <FileCheck className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'MERCATO':
        return {
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
          icon: <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'ALGORITMO':
        return {
          badge: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
          border: 'border-purple-500/30 hover:border-purple-500/60',
          icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />
        };
    }
  };

  return (
    <div className="space-y-8 text-slate-200">
      {/* 1. Header Banner & Strumento di Ricerca Unificata */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookMarked className="w-5 h-5" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono uppercase">
                Glossario Istituzionale delle Sigle & Acronimi REDIP
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Dizionario metodologico e normativo di tutte le sigle utilizzate nei report, negli algoritmi di stima, nell'audit catastale e nel Decision Loop.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <span className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 shadow-xs">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>{ACRONYMS_DATABASE.length} Sigle Censite</span>
            </span>
          </div>
        </div>

        {/* Barra di ricerca con feedback real-time */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca qualsiasi sigla o termine (es. MCA, OMI, RER, MRI, DOCFA, DOM, APE, ARI, IVS, OES)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-24 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 font-mono transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              Azzera
            </button>
          )}
        </div>

        {/* Quick Acronym Chips Strip: cliccando qualsiasi sigla si filtra istantaneamente */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="font-semibold uppercase flex items-center gap-1 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Accesso Rapido per Sigla:</span>
            </span>
            <span>Clicca per filtrare istantaneamente</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ACRONYMS_DATABASE.map(item => {
              const isSelected = searchTerm.toUpperCase() === item.acronym;
              return (
                <button
                  key={item.acronym}
                  onClick={() => setSearchTerm(isSelected ? '' : item.acronym)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                  title={`${item.acronym}: ${item.fullName}`}
                >
                  {item.acronym}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Sezione Principale: Filtri per Categoria & Elenco Schede Glossario */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white tracking-tight">
              Tavola Sinottica degli Acronimi
            </h4>
            <span className="text-xs font-mono text-slate-400">
              ({filteredAcronyms.length} di {ACRONYMS_DATABASE.length} visualizzati)
            </span>
          </div>

          {/* Filtro per categoria tematica */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'ALL', label: `Tutte (${categoryCounts.ALL})` },
              { id: 'ESTIMO', label: `Estimo (${categoryCounts.ESTIMO})` },
              { id: 'CATASTO', label: `Catasto (${categoryCounts.CATASTO})` },
              { id: 'MERCATO', label: `Mercato (${categoryCounts.MERCATO})` },
              { id: 'ALGORITMO', label: `Algoritmo (${categoryCounts.ALGORITMO})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as AcronymCategory)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Griglia delle Sigle Censite */}
        {filteredAcronyms.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <Info className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">Nessuna sigla corrispondente a "{searchTerm}"</p>
            <p className="text-xs text-slate-400">Prova a cercare con un altro termine o reimposta i filtri.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-300 border border-slate-700 cursor-pointer"
            >
              Reimposta Tutti i Filtri
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAcronyms.map((item) => {
              const catStyle = getCategoryColor(item.category);
              const isCopied = copiedAcronym === item.acronym;

              return (
                <div 
                  key={item.acronym}
                  className={`p-5 rounded-2xl bg-slate-950 border ${catStyle.border} transition-all duration-200 flex flex-col justify-between space-y-3.5 group shadow-sm hover:shadow-md`}
                >
                  <div className="space-y-2.5">
                    {/* Header Scheda: Sigla + Categoria + Copia */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-extrabold text-white tracking-wider group-hover:text-cyan-300 transition-colors">
                            {item.acronym}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-bold flex items-center gap-1 ${catStyle.badge}`}>
                            {catStyle.icon}
                            <span>{item.categoryLabel}</span>
                          </span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">
                          {item.fullName}
                        </h5>
                      </div>

                      {/* Pulsante Copia */}
                      <button
                        onClick={() => handleCopyDefinition(item)}
                        className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                          isCopied 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                        }`}
                        title="Copia definizione negli appunti"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px]">Copiato</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Definizione Chiara & Istituzionale */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.definition}
                    </p>

                    {/* Come e dove si usa in REDIP */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs font-mono space-y-1">
                      <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        <span>Ruolo Operativo nel Sistema:</span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs leading-relaxed">
                        {item.operationalContext}
                      </p>
                    </div>

                    {/* Esempio Pratico / Calcolo */}
                    {item.practicalExample && (
                      <div className="text-[11px] text-slate-400 font-sans border-l-2 border-cyan-500/50 pl-2.5 py-0.5">
                        <strong className="text-cyan-300 font-mono text-[10px] uppercase block">Esempio d'uso:</strong>
                        <span>{item.practicalExample}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer con Riferimento Normativo */}
                  {item.regulatoryReference && (
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-slate-500 uppercase font-semibold">Standard:</span>
                      <span className="text-cyan-400 font-bold truncate max-w-[280px]">
                        {item.regulatoryReference}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Sezione FAQ Operative (Domande & Risposte del Team di Valutazione) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <HelpCircle className="w-5 h-5" />
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Domande Frequenti del Team di Valutazione & Delibera (FAQ)
            </h4>
          </div>

          {/* Filtri Categoria FAQ */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {['ALL', 'RATING', 'DELIBERA', 'CHECKPOINT', 'GOVERNANCE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFaqCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedFaqCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Tutte' : cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Procedure operative, risoluzione di anomalie peritali e casistiche di disallineamento tra intelligenza artificiale e trattativa sul campo.
        </p>

        {/* Accordion FAQ */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndices.includes(idx);
            return (
              <div 
                key={idx}
                className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/90 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {faq.category}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {faq.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 bg-slate-950/70 border-t border-slate-800/60 text-xs space-y-3">
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {faq.answer}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      <div className="text-cyan-400 flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Riferimento: {faq.ruleReference}</span>
                      </div>

                      {faq.relatedAcronyms && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>Sigle correlate:</span>
                          <div className="flex items-center gap-1">
                            {faq.relatedAcronyms.map(acr => (
                              <button
                                key={acr}
                                onClick={() => setSearchTerm(acr)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:text-white font-bold cursor-pointer"
                              >
                                {acr}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
