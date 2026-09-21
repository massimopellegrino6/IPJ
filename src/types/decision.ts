/**
 * Real Estate Decision Intelligence Platform (REDIP)
 * Domain Models for Behavioral Learning & Implicit Feedback (Product Thesis v1.0)
 */

export type DecisionDivergenceCategory =
  | 'EXTERNAL_CONSTRAINT'    // Sottocategorie: OWNER_CONSTRAINT, CONTRACT_CONSTRAINT, FINANCIAL_CONSTRAINT
  | 'INFORMATION_GAP'        // Sottocategorie: ASSET_FEATURE_GAP, NEGOTIATION_INSIGHT
  | 'MODEL_DISAGREEMENT'      // Sottocategorie: PEER_GROUP_REJECTION, LOCAL_TREND_OVERRIDE
  | 'STRATEGIC_PREFERENCE'   // Sottocategorie: MARGIN_OVER_VELOCITY
  | 'COMMERCIAL_TIMING'      // Sottocategorie: PLANNED_DELAY
  | 'UNKNOWN';

export type BehavioralSignalType =
  | 'DOWNLOAD_OWNER_REPORT'
  | 'OPEN_COMPARABLES_DRILLDOWN'
  | 'CRM_OBJECTION_LOGGED'
  | 'SLIDER_TOLERANCE_TEST';

export interface BehavioralSignal {
  signalType: BehavioralSignalType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DecisionEventLog {
  eventId: string;
  timestamp: string;
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
    status: 'HYPOTHESIS' | 'CONSOLIDATED' | 'UNKNOWN';
  };
  outcomeTracking: {
    shortTermProxies: {
      leadsDelta14d?: string;
      visitsScheduled14d?: number;
      priceFeedbackSummary?: 'LOW' | 'FAIR' | 'EXCESSIVE';
      ctrPortalsDelta14d?: string;
      isPositive?: boolean;
    };
    finalOutcome?: {
      closed: boolean;
      salePrice?: number;
      daysOnMarketTotal?: number;
      mandateOutcome?: 'COMPLETED' | 'EXPIRED' | 'REVOKED';
    };
  };
}
