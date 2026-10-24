/**
 * ============================================================================
 * REDIP - PROPTECH DECISION INTELLIGENCE PLATFORM
 * MODULO M08: MARKET RESPONSE INDEX (MRI) & PROXY TRACKING
 * Specifiche Architetturali Product Thesis v1.0 (§10, §29)
 * ============================================================================
 * 
 * Checkpoint Temporale a 14–21 giorni:
 * Raccoglie e riconcilia i consuntivi intermedi empirici (Lead, Visite, CTR, Sentiment)
 * rispetto alle attese deliberate a Day 0, calcolando il Market Response Index (0-100)
 * e aggiornando il modello decisionale prima della maturazione del rogito finale (60-90gg).
 */

export interface ProxyMetricsInput {
  propertyId: string;
  daysSinceDecision: number;
  actualLeads: number;
  targetLeads: number;
  actualVisits: number;
  targetVisits: number;
  ctrDeltaPct: number;
  buyerFeedbackSummary: {
    lowCount: number;
    fairCount: number;
    highCount: number;
  };
}

export interface DimensionalMriScores {
  sVisits: number;      // 0 - 100 (Peso: 35%)
  sLeads: number;       // 0 - 100 (Peso: 30%)
  sCtr: number;         // 0 - 100 (Peso: 20%)
  sSentiment: number;   // 0 - 100 (Peso: 15%)
  weightedVisits: number;
  weightedLeads: number;
  weightedCtr: number;
  weightedSentiment: number;
}

export interface MarketResponseIndexResult {
  mriScore: number; // 0 - 100
  trajectoryStatus: 'TRAIETTORIA_VALIDATA' | 'ATTENZIONE_ATTRITO' | 'TRAIETTORIA_DEVIATA';
  confidenceBoost: number; // Incremento della confidenza (+0.05 / +0.10)
  actionScoreRecalibrated: number;
  rationale: string;
  dimensionalScores?: DimensionalMriScores;
}
