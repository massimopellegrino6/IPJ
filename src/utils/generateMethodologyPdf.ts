import { jsPDF } from 'jspdf';

/**
 * Generatore PDF Ufficiale - Manuale Metodologico & Decision Loop
 * Real Estate Decision Intelligence Platform (REDIP)
 * Conforme Linee Guida ABI & Standard UNI 11612:2015
 */
export const generateMethodologyPdf = (): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const fileTimestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `REDIP_Manuale_Metodologico_v1.4_${fileTimestamp}.pdf`;

  // Color Palette
  const colors = {
    bgDark: [15, 23, 42] as [number, number, number],
    cardDark: [30, 41, 59] as [number, number, number],
    borderDark: [51, 65, 85] as [number, number, number],
    cyan: [6, 182, 212] as [number, number, number],
    emerald: [16, 185, 129] as [number, number, number],
    purple: [168, 85, 247] as [number, number, number],
    amber: [245, 158, 11] as [number, number, number],
    blue: [59, 130, 246] as [number, number, number],
    rose: [244, 63, 94] as [number, number, number],
    textWhite: [255, 255, 255] as [number, number, number],
    textSlate200: [226, 232, 240] as [number, number, number],
    textSlate400: [148, 163, 184] as [number, number, number],
    textSlate500: [100, 116, 139] as [number, number, number],
  };

  const drawHeaderFooter = (pageNumber: number, totalPagesPlaceholder = false) => {
    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setDrawColor(colors.borderDark[0], colors.borderDark[1], colors.borderDark[2]);
    doc.setLineWidth(0.3);
    doc.line(0, 12, pageWidth, 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.text('REDIP v1.4 | MANUALE METODOLOGICO E DECISION LOOP', margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
    doc.text('UNI 11612:2015 & IVS Standard', pageWidth - margin, 8, { align: 'right' });

    // Footer bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setTextColor(colors.textSlate500[0], colors.textSlate500[1], colors.textSlate500[2]);
    doc.text('DOCUMENTO CONFIDENZIALE - AD USO ESCLUSIVO DEL COMITATO INVESTIMENTI E RETE AGENTI', margin, pageHeight - 5);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Pagina ${pageNumber}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number): boolean => {
    if (cursorY + neededHeight > pageHeight - 18) {
      doc.addPage();
      const currentPage = doc.getNumberOfPages();
      drawHeaderFooter(currentPage);
      cursorY = margin + 4;
      return true;
    }
    return false;
  };

  // ================= PAGE 1 =================
  drawHeaderFooter(1);
  cursorY = 20;

  // Title Box
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, cursorY, contentWidth, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.text('GOVERNANCE, TRASPARENZA & MANUALE OPERATIVO UFFICIALE', margin + 6, cursorY + 8);

  doc.setFontSize(16);
  doc.setTextColor(colors.textWhite[0], colors.textWhite[1], colors.textWhite[2]);
  doc.text('Methodology & Manuale Operativo del Decision Loop', margin + 6, cursorY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
  doc.text(
    'Specifiche dell\'algoritmo di rating su 7 pilastri, matrice di confidenza bayesiana e protocollo closed-loop (T0 - T14 - T90).',
    margin + 6,
    cursorY + 24
  );

  doc.setFontSize(8);
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.text(`Data Emissione: ${dateStr}   |   Revisione: v1.4   |   Stato: APPROVATO COMITATO`, margin + 6, cursorY + 32);

  cursorY += 44;

  // The 3 Core Principles Banner
  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(colors.borderDark[0], colors.borderDark[1], colors.borderDark[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.textWhite[0], colors.textWhite[1], colors.textWhite[2]);
  doc.text('PRINCIPIO CARDINE: HUMAN-IN-THE-LOOP GOVERNANCE', margin + 6, cursorY + 7);

  const stepBoxWidth = (contentWidth - 16) / 3;
  
  // Step 1
  doc.setFillColor(16, 185, 129, 0.15);
  doc.setDrawColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.roundedRect(margin + 4, cursorY + 11, stepBoxWidth, 9, 1.5, 1.5, 'FD');
  doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.setFontSize(8);
  doc.text('1. AI Recommends', margin + 6, cursorY + 17);

  // Step 2
  doc.setFillColor(6, 182, 212, 0.15);
  doc.setDrawColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.roundedRect(margin + 6 + stepBoxWidth, cursorY + 11, stepBoxWidth, 9, 1.5, 1.5, 'FD');
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.text('2. Human Decides', margin + 8 + stepBoxWidth, cursorY + 17);

  // Step 3
  doc.setFillColor(168, 85, 247, 0.15);
  doc.setDrawColor(colors.purple[0], colors.purple[1], colors.purple[2]);
  doc.roundedRect(margin + 8 + stepBoxWidth * 2, cursorY + 11, stepBoxWidth, 9, 1.5, 1.5, 'FD');
  doc.setTextColor(colors.purple[0], colors.purple[1], colors.purple[2]);
  doc.text('3. System Learns', margin + 10 + stepBoxWidth * 2, cursorY + 17);

  cursorY += 30;

  // Chapter 1 Section
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.text('CAPITOLO 01: I 7 PILASTRI ANALITICI & MATEMATICA DEL RATING', margin + 4, cursorY + 5.5);
  cursorY += 12;

  const pillars = [
    { num: 'P1', name: 'Location & Micro-Zona', weight: '20%', desc: 'Accessibilita, servizi nel raggio di 500m, attrattivita del quartiere e trend di espansione urbana.' },
    { num: 'P2', name: 'Caratteristiche Immobile', weight: '18%', desc: 'Stato manutentivo, classe energetica, efficienza del layout, piano e orientamento solare.' },
    { num: 'P3', name: 'Dinamica di Mercato', weight: '18%', desc: 'Velocita di assorbimento, indice di domanda/offerta, densita di compravendite recenti.' },
    { num: 'P4', name: 'Profittabilita & Rendita', weight: '14%', desc: 'Rendimento locativo lordo e netto atteso, gap canone stimato vs attuale, potenziale upside.' },
    { num: 'P5', name: 'Rischio & Stabilita', weight: '12%', desc: 'Volatilita storica dei prezzi, probabilita di svalutazione e rischio vacancy/morosita.' },
    { num: 'P6', name: 'ESG & Sostenibilita', weight: '10%', desc: 'Conformita direttiva Green UE (Case Green), rischio idrogeologico e indice di decarbonizzazione.' },
    { num: 'P7', name: 'Fattore Temporale / Ciclo', weight: '8%', desc: 'Posizionamento nel ciclo macroeconomico dei tassi, stagionalita e prospettiva a 36 mesi.' }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textSlate200[0], colors.textSlate200[1], colors.textSlate200[2]);

  pillars.forEach(p => {
    checkPageBreak(13);
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(colors.borderDark[0], colors.borderDark[1], colors.borderDark[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 11, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.text(`${p.num} - ${p.name}`, margin + 4, cursorY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.text(`Peso: ${p.weight}`, margin + contentWidth - 25, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
    doc.setFontSize(7.5);
    doc.text(p.desc, margin + 4, cursorY + 9);

    cursorY += 13;
  });

  cursorY += 4;

  // Chapter 2 Section
  checkPageBreak(30);
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.text('CAPITOLO 02: CONFIDENCE & GRACEFUL DEGRADATION', margin + 4, cursorY + 5.5);
  cursorY += 12;

  const confidenceTiers = [
    { level: 'LIVELLO ALTO (80% - 100%)', desc: '>=12 comparabili verificati rogito negli ultimi 6 mesi, telemetria catastale completa, ispezione periziale diretta.' },
    { level: 'LIVELLO MEDIO (55% - 79%)', desc: '5-11 comparabili, interpolazione OMI zonale, dati energetici parziali. Si applica un margine di confidenza allargato (+-8%).' },
    { level: 'LIVELLO CAUTELATIVO (<55%)', desc: 'Scarsita di comparabili o anomalie tipologiche. Intervento obbligatorio del Comitato prima di formulare la delibera.' }
  ];

  confidenceTiers.forEach(t => {
    checkPageBreak(14);
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(colors.borderDark[0], colors.borderDark[1], colors.borderDark[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 12, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.text(t.level, margin + 4, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
    doc.text(t.desc, margin + 4, cursorY + 9.5);

    cursorY += 14;
  });

  cursorY += 4;

  // Chapter 3 Section: SOP
  checkPageBreak(35);
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(colors.blue[0], colors.blue[1], colors.blue[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.blue[0], colors.blue[1], colors.blue[2]);
  doc.text('CAPITOLO 03: MANUALE OPERATIVO (SOP) & CRONOPROGRAMMA DECISIONALE', margin + 4, cursorY + 5.5);
  cursorY += 12;

  const sopSteps = [
    { t: 'FASE T0 (Acquisizione)', task: 'Inserimento immobile, estrazione visure catastali, calcolo rating automatico e intervallo di confidenza.' },
    { t: 'FASE T+14 (Audit Strategico)', task: 'Analisi feedback prime visite, tracking interazioni portali, ricalcolo scoring reattivita del prezzo.' },
    { t: 'FASE T+45 (Revisione Prezzo)', task: 'In caso di assenza di proposte conformi, trigger automatico raccomandazione sconto o riposizionamento.' },
    { t: 'FASE T+90 (Chiusura a Rogito)', task: 'Registrazione prezzo contrattualizzato definitivo, scostamento da stima iniziale e feed back-testing.' }
  ];

  sopSteps.forEach(s => {
    checkPageBreak(13);
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(colors.borderDark[0], colors.borderDark[1], colors.borderDark[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 11, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.blue[0], colors.blue[1], colors.blue[2]);
    doc.text(s.t, margin + 4, cursorY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
    doc.text(s.task, margin + 4, cursorY + 9);

    cursorY += 13;
  });

  cursorY += 4;

  // Chapter 4: Bias & World Model
  checkPageBreak(35);
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(colors.purple[0], colors.purple[1], colors.purple[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.purple[0], colors.purple[1], colors.purple[2]);
  doc.text('CAPITOLO 04: PRODUCT THESIS & STERILIZZAZIONE DEL BIAS', margin + 4, cursorY + 5.5);
  cursorY += 12;

  const biasPoints = [
    { title: 'Segregazione Prezzi Richiesti vs Transati', text: 'I portali contengono prezzi di richiesta con markup medio 8-15%. REDIP sterilizza il dato ancorandosi a prezzi di effettivo rogito.' },
    { title: 'Prevenzione dell\'Allucinazione da Trend', text: 'I dati storici sono ponderati con decadimento esponenziale (Half-life = 180 giorni) per non riflettere inerzie passate.' },
    { title: 'Sterilizzazione dell\'Overconfidence dell\'Agente', text: 'Se l\'agente forza un prezzo eccedente la fascia calcolata, il sistema richiede motivazione strutturata e traccia il delta.' }
  ];

  biasPoints.forEach(b => {
    checkPageBreak(13);
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(colors.borderDark[0], colors.borderDark[1], colors.borderDark[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 11, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.purple[0], colors.purple[1], colors.purple[2]);
    doc.text(b.title, margin + 4, cursorY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
    doc.text(b.text, margin + 4, cursorY + 9);

    cursorY += 13;
  });

  cursorY += 4;

  // Chapter 5 & 6: Data Sources & Acronym Glossary
  checkPageBreak(30);
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(colors.amber[0], colors.amber[1], colors.amber[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.amber[0], colors.amber[1], colors.amber[2]);
  doc.text('CAPITOLO 05 & 06: FONTI DATI CERTIFICATE & GLOSSARIO DELLE SIGLE', margin + 4, cursorY + 5.5);
  cursorY += 12;

  const dataSources = [
    'Agenzia delle Entrate / OMI: Valori semestrali minimi e massimi per microzona catastale.',
    'Banca d\'Italia & BCE: Serie storiche tassi mutui, inflazione programmata, indice di fiducia famiglie.',
    'ISTAT & ARPA: Censimento demografico zonale, qualita dell\'aria, rischio acustico e sismico.',
    'Comparabili Rogito Certificati: Database interno normalizzato delle transazioni effettuate a studio notarile.'
  ];

  dataSources.forEach(ds => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textSlate200[0], colors.textSlate200[1], colors.textSlate200[2]);
    doc.text(`* ${ds}`, margin + 4, cursorY);
    cursorY += 5.5;
  });

  cursorY += 4;
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.text('Tavola Sinottica delle Principali Sigle del Sistema (REDIP):', margin, cursorY);
  cursorY += 5;

  const acronymSummary = [
    { sigla: 'MCA', nome: 'Market Comparison Approach', desc: 'Metodo estimativo a comparabili reali recenti con correzioni marginali (IVS 105).' },
    { sigla: 'OMI', nome: 'Osservatorio Mercato Immobiliare', desc: 'Quotazioni min/max ufficiali Agenzia delle Entrate per zona censuaria.' },
    { sigla: 'RER', nome: 'Real Estate Rating (0-100)', desc: 'Punteggio sintetico cardinale su 7 pilastri quantitativi di qualita e liquidita.' },
    { sigla: 'CONF', nome: 'Rating Confidence Score', desc: 'Misura probabilistica (0-100%). Se <50% inibisce l\'Action Score prescrittivo.' },
    { sigla: 'MRI', nome: 'Market Response Index', desc: 'Indice di risposta reale del mercato al Checkpoint T+14 (leads, visite, sentiment).' },
    { sigla: 'DOCFA', nome: 'Documenti Catasto Fabbricati', desc: 'Aggiornamento planimetrico e conformita catastale rispetto allo stato di fatto.' },
    { sigla: 'DOM', nome: 'Days on Market', desc: 'Tempo totale stimato ed effettivo di permanenza dell\'annuncio prima del vincolo.' },
    { sigla: 'APE', nome: 'Attestato Prestazione Energetica', desc: 'Certificazione energetica (A4-G), alimenta Pilastro 6 (12%) e correzione edonica MCA.' },
    { sigla: 'ARI', nome: 'Asset Risk Index', desc: 'Pilastro 4 (15%) su conformita tecnico-giuridica con boost confidenza +8% se VERIFIED.' },
    { sigla: 'OES', nome: 'Operative Effort Score', desc: 'Misura dell\'impegno agenziale a T+90gg per la sterilizzazione del World Model.' },
    { sigla: 'IVS / ABI', nome: 'Standard Estimativi & Linee Guida', desc: 'Standard di valutazione internazionale e bancaria per validita cauzionale.' }
  ];

  acronymSummary.forEach(item => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.text(`[${item.sigla}]`, margin + 2, cursorY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textWhite[0], colors.textWhite[1], colors.textWhite[2]);
    doc.text(item.nome, margin + 24, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
    doc.text(`: ${item.desc}`, margin + 75, cursorY);

    cursorY += 5;
  });

  // Final Sign-off Box
  cursorY += 4;
  checkPageBreak(22);
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, cursorY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
  doc.text('CONFORMITA NORMATIVA & VALIDITA SCIENTIFICA', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colors.textSlate400[0], colors.textSlate400[1], colors.textSlate400[2]);
  doc.text(
    'Il presente manuale recepisce integralmente gli standard IVS (International Valuation Standards) e la norma UNI 11612:2015. ' +
    'Generato automaticamente dalla piattaforma REDIP.',
    margin + 4,
    cursorY + 11
  );

  // Trigger download
  doc.save(fileName);
  return fileName;
};
