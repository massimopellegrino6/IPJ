/**
 * Real Estate Decision Intelligence Platform (REDIP)
 * Domain Models for Behavioral Learning & Implicit Feedback (Product Thesis v1.0)
 * 
 * Formal implementation of:
 * 1. Probabilistic Vector Inference P(M) [Observed Fact ≠ Inferred Motivation]
 * 2. Dual-Horizon Checkpoint State Machine (14-21d Proxy vs Rogito Final)
 * 3. Effort-Adjusted Attribution & Anti-Bias Model Segregation
 * 4. Graceful Degradation & Decision Fail-Safe Protocol
 */

export type DecisionDivergenceCategory =
  | 'EXTERNAL_CONSTRAINT'    // Sottocategorie: OWNER_CONSTRAINT, CONTRACT_CONSTRAINT, FINANCIAL_CONSTRAINT
  | 'INFORMATION_GAP'        // Sottocategorie: ASSET_FEATURE_GAP, NEGOTIATION_INSIGHT
  | 'MODEL_DISAGREEMENT'     // Sottocategorie: PEER_GROUP_REJECTION, LOCAL_TREND_OVERRIDE
  | 'STRATEGIC_PREFERENCE'   // Sottocategorie: MARGIN_OVER_VELOCITY, ALIGNED_WITH_MODEL
  | 'COMMERCIAL_TIMING'      // Sottocategorie: PLANNED_DELAY
  | 'UNKNOWN';               // Dominante in assenza di segnali comportamentali collaterali

/**
 * Probabilistic Vector Distribution for Latent Motivation:
 * P(M) = [P(EXTERNAL_CONSTRAINT), P(MODEL_DISAGREEMENT), P(COMMERCIAL_TIMING), P(STRATEGIC_PREFERENCE), P(INFORMATION_GAP), P(UNKNOWN)]
 * Invariance Constraint: sum(P(M)) = 1.00
 */
export interface MotivationProbabilityVector {
  EXTERNAL_CONSTRAINT: number;
  MODEL_DISAGREEMENT: number;
  COMMERCIAL_TIMING: number;
  STRATEGIC_PREFERENCE: number;
  INFORMATION_GAP: number;
  UNKNOWN: number;
}

export type BehavioralSignalType =
  | 'DOWNLOAD_OWNER_REPORT'        // Trojan horse PDF: proietta EXTERNAL_CONSTRAINT >= 0.80
  | 'OPEN_COMPARABLES_DRILLDOWN'   // Drilldown comparabili: proietta MODEL_DISAGREEMENT >= 0.75
  | 'REJECT_COMPARABLE'            // Scarto comparabile notarile: rinforza PEER_GROUP_REJECTION
  | 'FILTER_COMPARABLES'           // Filtraggio raggio/mq comparabili: rinforza MODEL_DISAGREEMENT
  | 'CRM_OBJECTION_LOGGED'         // Nota CRM o obiezione esplicita cliente
  | 'SLIDER_TOLERANCE_TEST'        // Manipolazione continua slider: UNKNOWN rimane dominante (>= 0.40)
  | 'PROXY_CHECKPOINT_CONFIRMED';  // Checkpoint T+14 confermato con validazione MRI

export interface BehavioralSignal {
  signalType: BehavioralSignalType;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Step 2 Decision Lifecycle State Machine:
 * Dual-Horizon tracking between Day 0 deliberation, 14-21d short-term proxies,
 * and 60-90d final outcome (rogito vs expired).
 */
export type DecisionLifecycleStatus = 
  | 'DELIBERATED_DAY_0'
  | 'MONITORING_PROXY_WINDOW'    // Giorni 1-13
  | 'AWAITING_14D_CHECKPOINT'     // Giorno 14-21: richiede riconciliazione empirica
  | 'PROXY_VALIDATED'             // Mercato reattivo, avanza verso il rogito (convergenza)
  | 'PROXY_STAGNATION_ALERT'      // Mancata risposta del mercato: allarme e ri-triage
  | 'AWAITING_FINAL_OUTCOME'
  | 'CLOSED_COMPLETED'
  | 'CLOSED_EXPIRED';

export type DecisionTrackingStatus =
  | 'AWAITING_14D_PROXY'
  | 'PROXY_EVALUATED'
  | 'AWAITING_FINAL_OUTCOME'
  | 'CLOSED';

export type ProxyOutcomeEvaluationStatus = 
  | 'PENDING'
  | 'PROXY_CONFIRMED'
  | 'PROXY_FAILED';

/**
 * Consuntivo empirico rilevato alla finestra dei 14 o 21 giorni
 */
export interface ProxyMetricsSnapshot {
  recordedAt: string;
  daysElapsed: number; // 14 o 21
  leadsCount: number;
  leadsDeltaPct: number;
  scheduledVisits: number;
  listingCtrPct: number;
  marketPriceSentiment: 'COMPETITIVE' | 'FAIR' | 'EXCESSIVE';
}

/**
 * Esito matematico della riconciliazione empirica tra previsione Day 0 e consuntivo Day 14-21
 */
export interface ProxyReconciliationResult {
  decisionId: string;
  marketResponseIndex: number; // 0 - 100 (MRI)
  status: 'REACTIVE_CONVERGING' | 'NEUTRAL_MONITORING' | 'STAGNATION_REJECTED';
  predictedVsObserved: {
    predictedLeads: number;
    observedLeads: number;
    leadsDeltaPct: number;
    predictedVisits: number;
    observedVisits: number;
  };
  bayesianConfidenceDelta: number; // es. +0.15 se positivo, -0.25 se fallito
  strategicPrescription: {
    alertRequired: boolean;
    headline: string;
    recommendedAction: 'MAINTAIN_CURRENT_STRATEGY' | 'TRIGGER_OPPORTUNITY_TRIAGE' | 'ESCALATE_TO_SCENARIO_A';
    rationale: string;
  };
}

export type FinalMandateOutcome = 
  | 'CLOSED_SALE_WON'      // Rogito perfezionato
  | 'MANDATE_EXPIRED_LOST'  // Scadenza incarico senza vendita
  | 'SELLER_REVOKED_LOST'   // Recesso anticipato del venditore
  | 'PRICE_WITHDRAWN';      // Ritiro dell'immobile dal mercato

export interface OperativeEffortSnapshot {
  avgLeadResponseHours: number;      // Tempo medio di risposta ai lead
  conductedVisitsCount: number;      // Visite effettuate
  requestedVisitsCount: number;      // Visite richieste dagli utenti
  marketingBudgetDeliveredEur: number; // Spesa marketing effettiva
  marketingBudgetCommittedEur: number; // Spesa marketing pattuita
  calculatedEffortScore: number;     // Indice normalizzato 0.0 - 1.0
  effortClassification: 'HIGH_EFFORT' | 'MODERATE_EFFORT' | 'LOW_INERTIA';
}

export interface FinalOutcomeReconciliation {
  decisionId: string;
  propertyId: string;
  outcomeType: FinalMandateOutcome;
  salePriceActual?: number;
  deltaVsInitialRecommendationPct?: number;
  totalDaysOnMarket: number;
  mandateRealizationRate: number; // Prezzo finale / Prezzo raccomandato
  effort: OperativeEffortSnapshot;
  attribution: {
    biasCategory: 'WORLD_MODEL_RECALIBRATION' | 'ORGANIZATIONAL_INERTIA_BIAS' | 'HUMAN_EXPERTISE_SURPLUS' | 'ALIGNED_EXECUTION';
    worldModelSterilized: boolean;
    explanation: string;
    decisionModelUpdate: {
      agencyFrictionFlag: boolean;
      pricingElasticityAdjustment: number;
    };
  };
}

/**
 * CRM Operative Effort Metrics:
 * Misura quantitativa della diligenza esecutiva per discriminare tra
 * rifiuto di mercato (World Model) e negligenza operativa (Decision Model).
 */
export interface OperativeEffortMetrics {
  leadResponseTimeHours: number;    // < 24h -> 1.0, 24-48h -> 0.7, 48-72h -> 0.4, > 72h -> 0.2
  visitsCompleted: number;          // Visite effettivamente svolte
  visitsRequested: number;          // Richieste di appuntamento registrate nel CRM
  marketingSpendDelivered: boolean; // Campagne portali / vetrina premium attivate
  computedEffortScore: number;      // Indice combinato normalizzato 0.0 - 1.0
}

/**
 * Model Attribution Segregation Category:
 * - WORLD_MODEL_RECALIBRATION: Effort >= 0.70 & invenduto -> Fallimento oggettivo, ricalibra curve assorbimento e fair value
 * - ORGANIZATIONAL_INERTIA_BIAS: Effort < 0.40 & invenduto -> Negligenza agenzia, STERILIZZA World Model per evitare bias
 * - BALANCED_ATTRIBUTION: Effort intermedio (0.40 - 0.70)
 * - SUCCESS_CONFIRMED: Rogito perfezionato, validazione congiunta positiva
 */
export type AttributionSegregation =
  | 'WORLD_MODEL_RECALIBRATION'
  | 'ORGANIZATIONAL_INERTIA_BIAS'
  | 'BALANCED_ATTRIBUTION'
  | 'SUCCESS_CONFIRMED';

export interface DecisionEventLog {
  eventId: string;
  timestamp: string;
  status: DecisionTrackingStatus;
  lifecycleStatus?: DecisionLifecycleStatus;
  decisionContext: {
    propertyId: string;
    propertyTitle?: string;
    agentId: string;
    agencyId: string;
    objective: 'MAX_LIQUIDITY_60D' | 'MAX_PROFIT' | 'BALANCED';
    mandateDaysRemaining: number;
  };
  ratingSnapshot: {
    realEstateRating: number;
    agencyFitScore: number;
    confidenceScore: number;
    dimensions: Record<string, number>;
  };
  recommendationIssued: {
    actionType: 'PRICE_REDUCTION' | 'MARKETING_BOOST' | 'STRATEGY_MAINTAIN';
    currentPrice: number;
    recommendedPrice: number;
    actionScore: number;
    predictedProbability60d: number;
    isActionScoreAvailable?: boolean;
    actionScoreUnavailableReason?: string;
    predictedLeadsDeltaPct?: number;
    predictedVisits14d?: number;
    expectedFeedback?: 'COMPETITIVE' | 'FAIR' | 'EXCESSIVE';
  };
  observedHumanDecision: {
    eventType: 'ACCEPTED' | 'PARTIAL_PRICE_ADJUSTMENT' | 'ACTION_OVERRIDE' | 'IGNORED';
    appliedPrice: number;
    deltaVsRecommendation: number;
    scenarioChosen?: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'CUSTOM_SLIDER';
  };
  behavioralSignals: BehavioralSignal[];
  inferredMotivation: {
    primaryCategory: DecisionDivergenceCategory;
    subCategory?: string;
    confidenceScore: number; // 0.0 - 1.0
    probabilityVector: MotivationProbabilityVector;
    status: 'HYPOTHESIS' | 'CONSOLIDATED' | 'UNKNOWN';
    attributionRationale?: string;
  };
  proxyMetricsSnapshot?: ProxyMetricsSnapshot;
  reconciliationResult?: ProxyReconciliationResult;
  finalOutcomeReconciliation?: FinalOutcomeReconciliation;
  outcomeTracking: {
    proxyStatus?: ProxyOutcomeEvaluationStatus;
    proxyAlert?: string;
    shortTermProxies: {
      targetLeads14d?: number;
      actualLeads14d?: number;
      leadsDelta14d?: string;
      visitsScheduled14d?: number;
      actualVisits14d?: number;
      priceFeedbackSummary?: 'LOW' | 'FAIR' | 'EXCESSIVE' | 'COMPETITIVE';
      ctrPortalsDelta14d?: string;
      isPositive?: boolean;
      evaluatedAt?: string;
    };
    operativeEffort?: OperativeEffortMetrics;
    attributionSegregation?: AttributionSegregation;
    finalOutcome?: {
      closed: boolean;
      salePrice?: number;
      daysOnMarketTotal?: number;
      mandateOutcome?: 'COMPLETED' | 'EXPIRED' | 'REVOKED';
      worldModelSterilized?: boolean;
      attributionNotes?: string;
      evaluatedAt?: string;
    };
  };
}
