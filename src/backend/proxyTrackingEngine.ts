/**
 * ============================================================================
 * REDIP - PROPTECH DECISION INTELLIGENCE PLATFORM
 * MODULO M08: ENGINE DETERMINISTICO MARKET RESPONSE INDEX & PROXY TRACKING
 * Conforme alla Product Thesis v1.0 (§10, §29)
 * ============================================================================
 */

import { ProxyMetricsInput, MarketResponseIndexResult, DimensionalMriScores } from '../types/proxyTracking';

/**
 * Pesi dimensionali standard IVS / REDIP M08 per il calcolo del Market Response Index (MRI):
 * - Visite sul campo (35%): proxy comportamentale ad altissima intenzione d'acquisto.
 * - Volume Leads qualificati (30%): ampiezza della domanda e attrattività dell'annuncio.
 * - Dinamica CTR Portali (20%): efficacia del pricing rispetto ai competitor d'area.
 * - Sentiment Prezzo Buyer (15%): feedback qualitativo raccolto dai consulenti in visita.
 */
export const MRI_DIMENSION_WEIGHTS = {
  VISITS: 0.35,
  LEADS: 0.30,
  CTR: 0.20,
  SENTIMENT: 0.15,
} as const;

/**
 * Calcola in modo deterministico il Market Response Index (0-100)
 * alla finestra temporale dei 14–21 giorni post-delibera.
 * 
 * @param input Metriche consuntivate rilevate sul campo e dai canali digitali
 * @returns Esito MRI, classificazione traiettoria, boost di confidenza e Action Score ricalibrato
 */
export function calculateMarketResponseIndex(input: ProxyMetricsInput): MarketResponseIndexResult {
  // 1. Score Visite (35%): rapporto actual vs target (normalizzato 0-100)
  const targetVisits = Math.max(1, input.targetVisits || 5);
  const sVisits = Math.min(100, Math.max(0, (input.actualVisits / targetVisits) * 100));

  // 2. Score Lead (30%): volume di lead acquisiti rispetto all'obiettivo stimato (0-100)
  const targetLeads = Math.max(1, input.targetLeads || 8);
  const sLeads = Math.min(100, Math.max(0, (input.actualLeads / targetLeads) * 100));

  // 3. Score CTR Portali (20%): variazione percentuale CTR rispetto al benchmark
  // Con input.ctrDeltaPct = 28% -> sCtr = 90.0
  const sCtr = Math.min(100, Math.max(0, Math.round(50 + (input.ctrDeltaPct * 1.42857))));

  // 4. Score Sentiment Prezzo (15%): aggregazione ponderata dei feedback buyer
  // Low (prezzo alto / offerta ribassata): 20 pt | Fair (congruo / allineato): 78 pt | High (alta intenzione / favorevole): 90 pt
  const feedback = input.buyerFeedbackSummary || { lowCount: 0, fairCount: 0, highCount: 0 };
  const totalFeedback = feedback.lowCount + feedback.fairCount + feedback.highCount;

  let sSentiment = 75;
  if (totalFeedback > 0) {
    const rawSentiment = ((feedback.lowCount * 20) + (feedback.fairCount * 78) + (feedback.highCount * 90)) / totalFeedback;
    sSentiment = Math.round(rawSentiment);
  }

  // Calcolo ponderato delle 4 componenti
  const weightedVisits = Number((sVisits * MRI_DIMENSION_WEIGHTS.VISITS).toFixed(2));
  const weightedLeads = Number((sLeads * MRI_DIMENSION_WEIGHTS.LEADS).toFixed(2));
  const weightedCtr = Number((sCtr * MRI_DIMENSION_WEIGHTS.CTR).toFixed(2));
  const weightedSentiment = Number((sSentiment * MRI_DIMENSION_WEIGHTS.SENTIMENT).toFixed(2));

  // MRI = (0.35 * sVisits) + (0.30 * sLeads) + (0.20 * sCtr) + (0.15 * sSentiment)
  const rawMri = (sVisits * MRI_DIMENSION_WEIGHTS.VISITS) +
                 (sLeads * MRI_DIMENSION_WEIGHTS.LEADS) +
                 (sCtr * MRI_DIMENSION_WEIGHTS.CTR) +
                 (sSentiment * MRI_DIMENSION_WEIGHTS.SENTIMENT);

  const mriScore = Number(rawMri.toFixed(1));

  const dimensionalScores: DimensionalMriScores = {
    sVisits: Number(sVisits.toFixed(1)),
    sLeads: Number(sLeads.toFixed(1)),
    sCtr: Number(sCtr.toFixed(1)),
    sSentiment: Number(sSentiment.toFixed(1)),
    weightedVisits,
    weightedLeads,
    weightedCtr,
    weightedSentiment
  };

  // Classificazione della traiettoria empirica (§10, §29)
  if (mriScore >= 65) {
    // TRAIETTORIA VALIDATA: Incrementa confidenza (+0.08) e riduce la priorità Action Score (non più in stasi)
    const confidenceBoost = 0.08;
    const actionScoreRecalibrated = 42; // Ridotto da 88 a 42: l'immobile risponde e non necessita correzione urgente
    const rationale = `Risposta di mercato empirica convalidata (MRI: ${mriScore}/100). Visite (${input.actualVisits}/${targetVisits}) e lead (${input.actualLeads}/${targetLeads}) confermano la congruità del prezzo deliberato. L'immobile non è più in stasi: priorità Action Score ridimensionata a ${actionScoreRecalibrated}/100 con avanzamento a monitoraggio offerte.`;

    return {
      mriScore,
      trajectoryStatus: 'TRAIETTORIA_VALIDATA',
      confidenceBoost,
      actionScoreRecalibrated,
      rationale,
      dimensionalScores
    };
  }

  if (mriScore >= 45) {
    // ATTENZIONE ATTRITO: Frizione moderata, finestra T+21
    const confidenceBoost = 0.00;
    const actionScoreRecalibrated = 68;
    const rationale = `Frizione moderata nella risposta del mercato (MRI: ${mriScore}/100). Le visite o i lead consuntivati risultano lievemente inferiori al corridor predittivo. Consigliato mantenimento e proroga monitoraggio fino alla finestra T+21.`;

    return {
      mriScore,
      trajectoryStatus: 'ATTENZIONE_ATTRITO',
      confidenceBoost,
      actionScoreRecalibrated,
      rationale,
      dimensionalScores
    };
  }

  // TRAIETTORIA DEVIATA: Stasi rilevata, genera nuovo trigger d'urgenza nel Decision Center
  const confidenceBoost = -0.15;
  const actionScoreRecalibrated = 94; // Urgenza elevatissima per rinegoziazione o escalation immediata
  const rationale = `Traiettoria deviata e stasi di mercato rilevata a 14gg (MRI: ${mriScore}/100). Consuntivi gravemente inferiori al modello predittivo con possibile rigetto del prezzo. Generato nuovo trigger d'urgenza nel Decision Center per revisione immediata del prezzo (Escalation Scenario A).`;

  return {
    mriScore,
    trajectoryStatus: 'TRAIETTORIA_DEVIATA',
    confidenceBoost,
    actionScoreRecalibrated,
    rationale,
    dimensionalScores
  };
}

/**
 * Restituisce i valori consuntivi standard certificati per Via Nomentana 221 (RM-NOM-221)
 * a completamento della finestra temporale dei 14 giorni.
 */
export function getViaNomentanaDefaultProxyInput(): ProxyMetricsInput {
  return {
    propertyId: 'prop_rm_nomentana_221',
    daysSinceDecision: 14,
    actualLeads: 7,
    targetLeads: 8,
    actualVisits: 4,
    targetVisits: 5,
    ctrDeltaPct: 28,
    buyerFeedbackSummary: {
      lowCount: 0,
      fairCount: 3,
      highCount: 1
    }
  };
}
