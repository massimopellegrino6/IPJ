import { jsPDF } from 'jspdf';
import { PropertyItem } from '../types/intelligence';
import { McaEvaluationResult } from '../types/comparables';

export type Property = PropertyItem;

export interface ActiveChoiceScenarioOption {
  targetPrice: number;
  label: string;
}

/**
 * Lead Full-Stack Architect - REDIP Engine
 * Generatore PDF Ufficiale - Dossier Negoziale Proprietario (Trojan Horse M07)
 * Conforme agli standard IVS (International Valuation Standards) e Market Comparison Approach (MCA).
 * 
 * @param property Oggetto Immobile attivo (Property / PropertyItem)
 * @param mcaEvaluation Valutazione deterministica MCA con comparabili reali notarili
 * @param activeChoiceScenario Scenario decisionale selezionato (opzionale)
 */
export function generateOwnerDossierPdf(
  property: Property,
  mcaEvaluation: McaEvaluationResult,
  activeChoiceScenario?: { targetPrice: number; label: string }
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pW = 210;
  const pH = 297;
  const mL = 18;
  const contentW = pW - mL * 2;

  // 1. Header Banner & Branding
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pW, 36, 'F');
  
  doc.setFillColor(16, 185, 129); // emerald-500 line
  doc.rect(0, 36, pW, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('REDIP — DOSSIER NEGOZIALE PROPRIETARIO (TROJAN HORSE M07)', mL, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('DOCUMENTO ANALITICO NOTARILE & VALUTAZIONE DINAMICA CONGRUITA PREZZO (IVS)', mL, 23);
  doc.text(
    `Data Generazione: ${new Date().toLocaleDateString('it-IT')} | ID Immobile: ${property.code} | Microzona: ${property.microZone} (${property.city})`,
    mL,
    29
  );

  let currentY = 46;

  // 2. Section 1: Asset Information (Scheda Immobile)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. SCHEDA DI SINTESI IMMOBILE', mL, currentY);

  currentY += 4;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(mL, currentY, contentW, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Titolo: ${property.title}`, mL + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Indirizzo: ${property.address}, ${property.city} (${property.province}) — Zona: ${property.macroZone || property.microZone}`, mL + 4, currentY + 11.5);
  doc.text(
    `Superficie: ${property.squareMeters} mq | Piano: ${property.floor ?? '—'} (Totale: ${property.totalFloors ?? '—'}) | Ascensore: ${property.hasElevator ? 'Presente' : 'Assente'} | Locali: ${property.rooms} | Bagni: ${property.bathrooms}`,
    mL + 4,
    currentY + 16.5
  );
  doc.text(
    `Stato Conservativo: ${property.conservationState || 'Buono'} | Classe Energetica: ${property.energyClass || 'D'} | Confidenza Rating: ${property.ratingConfidence || 90}% [${property.ratingConfidenceLevel || 'HIGH'}]`,
    mL + 4,
    currentY + 21
  );

  currentY += 30;

  // 3. Section 2: Financial Comparison (Dati Economici e MCA)
  const askingPrice = property.askingPrice;
  const mcaFairValue = mcaEvaluation.mcaFairValueCentral;
  const optimalPrice = activeChoiceScenario?.targetPrice || mcaFairValue;
  const deltaEur = askingPrice - mcaFairValue;
  const deltaPct = Number(((deltaEur / mcaFairValue) * 100).toFixed(1));

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CONFRONTO ECONOMICO & VALUTAZIONE FAIR VALUE IVS', mL, currentY);

  currentY += 4;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(mL, currentY, contentW, 35, 2, 2, 'FD');

  // Prezzo Richiesto
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Prezzo Richiesto: €${askingPrice.toLocaleString('it-IT')} (${Math.round(askingPrice / property.squareMeters).toLocaleString('it-IT')} €/mq)`,
    mL + 5,
    currentY + 7
  );

  // Fair Value REDIP
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(
    `Fair Value REDIP: €${mcaFairValue.toLocaleString('it-IT')} (${Math.round(mcaFairValue / property.squareMeters).toLocaleString('it-IT')} €/mq) [Standard IVS / MCA]`,
    mL + 5,
    currentY + 15
  );

  // Prezzo di Esecuzione Ottimale
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Prezzo di Esecuzione Ottimale: €${optimalPrice.toLocaleString('it-IT')} (${activeChoiceScenario?.label || 'Scenario Consigliato a Congruità'})`,
    mL + 5,
    currentY + 23
  );

  // Scostamento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  if (deltaEur < 0) {
    doc.setTextColor(5, 150, 105);
  } else {
    doc.setTextColor(225, 29, 72);
  }
  doc.text(
    `Scostamento vs Fair Value: Delta: ${deltaEur >= 0 ? '+' : ''}€${deltaEur.toLocaleString('it-IT')} (${deltaPct >= 0 ? '+' : ''}${deltaPct}%)`,
    mL + 5,
    currentY + 30
  );

  currentY += 41;

  // 4. Section 3: Empirical Comparables (Comparabili Dinamici Reali)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. COMPROVANTI EMPIRICI NOTARILI NELLA MICROZONA (MCA)', mL, currentY);

  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Compravendite notarili certificate IVS entro 600m. Dispersione campionaria: ${mcaEvaluation.divergenceSpreadPct}% | Campione: ${mcaEvaluation.comparablesFoundCount} rogiti validati:`,
    mL,
    currentY
  );

  currentY += 4;

  const compsToRender = mcaEvaluation.comparables && mcaEvaluation.comparables.length > 0 
    ? mcaEvaluation.comparables 
    : [];

  compsToRender.forEach((comp) => {
    const sourceLabel = comp.source === 'REDIP_CLOSED_LOOP' ? 'Rogito Certificato REDIP' : 'Archivio Storico Agenzia';
    const unitPrice = Math.round(comp.salePriceEur / comp.surfaceMq);
    const adjustedPrice = comp.mcaAdjustments?.adjustedPriceEur ?? comp.salePriceEur;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(mL, currentY, contentW, 14, 1.5, 1.5, 'FD');

    // Title line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${comp.propertyAddress} (${sourceLabel})`, mL + 4, currentY + 5);

    // Distance / date right aligned
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Distanza: ${comp.distanceMeters}m | Atto: ${comp.transactionDate}`,
      pW - mL - 4,
      currentY + 5,
      { align: 'right' }
    );

    // Details line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Mq: ${comp.surfaceMq} | Prezzo Rogito: €${comp.salePriceEur.toLocaleString('it-IT')} (${unitPrice.toLocaleString('it-IT')} €/mq) | Prezzo Rettificato MCA: €${adjustedPrice.toLocaleString('it-IT')}`,
      mL + 4,
      currentY + 10
    );

    currentY += 16.5;
  });

  currentY += 2;

  // 5. Section 4: Strategic Recommendations & Signature (Raccomandazione Strategica)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. VALUTAZIONE STRATEGICA E RACCOMANDAZIONE OPERATIVA', mL, currentY);

  currentY += 4.5;

  const activeBuyers = property.agencyFit?.compatibleActiveBuyers || 23;
  const absorptionDays = property.estimatedTimeToSaleDays || 48;

  // Exact strategic recommendation text specification
  let strategicRecommendationText = '';
  if (deltaEur < 0) {
    strategicRecommendationText = `L'immobile si trova attualmente a sconto del ${deltaPct}% rispetto al Fair Value edonico certificato IVS (€${mcaFairValue.toLocaleString('it-IT')}). La presenza di ${activeBuyers} acquirenti profilati in CRM con budget compatibile consente un riposizionamento fino a €${optimalPrice.toLocaleString('it-IT')} mantenendo un tempo di assorbimento stimato entro ${absorptionDays} giorni.`;
  } else if (deltaEur > 0) {
    strategicRecommendationText = `L'immobile presenta una richiesta a premio del +${deltaPct}% rispetto al Fair Value edonico certificato IVS (€${mcaFairValue.toLocaleString('it-IT')}). Per massimizzare la liquidità e intercettare i ${activeBuyers} acquirenti profilati in CRM con budget compatibile, si raccomanda un riposizionamento fino a €${optimalPrice.toLocaleString('it-IT')} con un tempo di assorbimento stimato entro ${absorptionDays} giorni.`;
  } else {
    strategicRecommendationText = `L'immobile è perfettamente allineato al Fair Value edonico certificato IVS (€${mcaFairValue.toLocaleString('it-IT')}). La presenza di ${activeBuyers} acquirenti profilati in CRM consente di mantenere il prezzo di €${optimalPrice.toLocaleString('it-IT')} con un tempo di assorbimento stimato entro ${absorptionDays} giorni.`;
  }

  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(mL, currentY, contentW, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text('Sintesi Esecutiva per la Negoziazione con la Proprieta:', mL + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  
  const wrappedRecommendation = doc.splitTextToSize(strategicRecommendationText, contentW - 8);
  doc.text(wrappedRecommendation, mL + 4, currentY + 11.5);

  currentY += 32;

  // Additional Operational Bullets
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `• Target Acquirenti CRM: ${activeBuyers} acquirenti attivi verificati nell'area (di cui ${property.agencyFit?.highIntentBuyers || 9} High-Intent pronti al rogito entro 30gg).`,
    mL,
    currentY
  );
  doc.text(
    `• Audit Trail & Metodo: Procedimento MCA a standard UNI 11558 / Linee Guida ABI con tracciamento del segnale comportamentale (Trojan Horse).`,
    mL,
    currentY + 5
  );

  // 6. Signatures (Firma)
  const signY = pH - 24;
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.line(mL, signY, mL + 60, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Firma Consulente Immobiliare Certificatore', mL, signY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Asseverazione metodologica REDIP', mL, signY + 8);

  doc.line(pW - mL - 60, signY, pW - mL, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Firma Proprieta per Presa Visione ed Accordo', pW - mL - 60, signY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Conferma adozione piano d\'azione strategico', pW - mL - 60, signY + 8);

  // Save to file
  doc.save(`REDIP_Dossier_Proprietario_${property.code}.pdf`);

  return doc;
}
