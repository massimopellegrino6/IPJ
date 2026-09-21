/**
 * Real Estate Decision Intelligence Platform
 * Core Type Definitions - Institutional & Quantitative Architecture
 */

export type RatingClassification = 'CRITICAL' | 'WEAK' | 'NEUTRAL' | 'STRONG' | 'EXCEPTIONAL';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'LIMITED_EVIDENCE';
export type PriorityLevel = 'HIGH' | 'OPPORTUNITY' | 'MEDIUM' | 'LOW';
export type DecisionType = 'ACQUISITION' | 'PRICING' | 'REPRICING' | 'CLIENT_MATCHING' | 'STRATEGIC_REVIEW';

export interface SubDimension {
  id: string;
  name: string;
  score: number;
  weight: number;
  trend: number; // e.g. +2, -1
  summary: string;
  benchmark: number;
  evidenceCount: number;
}

export interface DimensionBreakdown {
  id: string;
  name: string;
  key: 'property' | 'location' | 'environment' | 'risk' | 'market' | 'economics' | 'macro';
  score: number;
  weight: number;
  trend: number;
  subDimensions: SubDimension[];
}

export interface DimensionEvidence {
  dimensionId: string;
  dimensionName: string;
  score: number;
  confidence: number;
  askingPrice: number;
  estimatedFairValue: number;
  differencePct: number;
  comparablesCount: number;
  verifiedTransactionsCount: number;
  medianComparablePriceSqm: number;
  propertyPriceSqm: number;
  dataFreshnessDays: number;
  modelVersion: string;
  positiveFactors: string[];
  negativeFactors: string[];
  dataSources: string[];
}

export interface RatingHistoryEvent {
  date: string;
  rating: number;
  event?: string;
  eventCategory?: 'PRICE' | 'MARKET' | 'TRANSACTION' | 'INVENTORY';
  impact?: number;
}

export interface ActionScenario {
  id: string;
  label: string;
  targetPrice: number;
  priceDeltaPct: number;
  actionScore: number;
  saleProbability90d: number;
  expectedTimeToSaleDays: number;
  isRecommended?: boolean;
  warning?: string;
  rationale: string;
}

export interface AgencyFitData {
  score: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  explanation: string;
  compatibleActiveBuyers: number;
  highIntentBuyers: number;
  historicalPerformanceSimilarPct: number;
  historicalTimeToSaleDays: number;
  territoryExpertise: 'HIGH' | 'MEDIUM' | 'LOW';
  portfolioOverlap: 'HIGH' | 'BALANCED' | 'LOW';
  matchingBuyerClusters: Array<{
    profile: string;
    count: number;
    avgBudget: number;
    timelineDays: number;
  }>;
}

export interface DecisionHistoryItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  date?: string;
  decisionType?: 'ACCEPTED' | 'MODIFIED' | 'DECLINED';
  recommendedAction?: string;
  executedPrice?: number;
  humanNotes?: string;
  executedBy?: string;
  timestamp?: string;
  confidenceScore?: number;
  systemRecommendation?: {
    action: string;
    details: string;
    actionScore: number;
    confidence: number;
  };
  humanDecision?: {
    decisionType: 'ACCEPTED' | 'MODIFIED' | 'DECLINED';
    finalPrice?: number;
    decisionMaker: string;
    reason: string;
    date: string;
  };
  execution?: {
    date: string;
    actionTaken: string;
  };
  milestones?: Array<{
    date: string;
    description: string;
    metric?: string;
  }>;
  outcome?: {
    status: 'SUCCESSFUL' | 'IN_PROGRESS' | 'REVISED' | 'SUB_OPTIMAL';
    soldPrice?: number;
    timeToSaleDays?: number;
    notes: string;
  };
}

export interface PropertyImage {
  id: string;
  url: string;
  caption: string;
  tag: 'Living' | 'Cucina' | 'Camera' | 'Bagno' | 'Esterno' | 'Vista' | 'Planimetria';
  isHero?: boolean;
}

export interface CadastralInfo {
  sheet: string; // Foglio
  parcel: string; // Particella
  subaltern: string; // Subalterno
  cadastralCategory: string; // es. A/2, A/3
  annuity: number; // Rendita catastale in €
  urbanCompliance: 'COMPLIANT' | 'NEEDS_VERIFICATION' | 'AMNESTY_IN_PROGRESS';
}

export interface MandateInfo {
  type: 'Exclusive' | 'Non-Exclusive' | 'Direct' | 'Under Review';
  startDate: string;
  expirationDate: string;
  daysToExpiration: number;
  commissionPct: number;
  assignedAgent: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar?: string;
  };
}

export interface DocumentChecklist {
  deedOfOrigin: boolean; // Atto di provenienza
  mortgageInspection: boolean; // Visura ipotecaria
  energyCertificateAPE: boolean; // APE registrato
  condoRegulation: boolean; // Regolamento condominio & verbali
  floorPlanCompliance: boolean; // Scheda catastale conforme
}

export interface PortalSyndication {
  immobiliare: boolean;
  idealista: boolean;
  casaIt: boolean;
  directWeb: boolean;
}

export interface PropertyItem {
  id: string;
  code: string;
  title: string;
  address: string;
  city: string;
  province: string;
  microZone: string;
  macroZone: string;
  propertyType: 'Apartment' | 'Penthouse' | 'Villa' | 'Loft' | 'Townhouse' | 'Studio';
  typologyCategory: 'Residential' | 'Commercial' | 'Mixed';
  squareMeters: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  hasElevator: boolean;
  hasBalcony: boolean;
  hasParking: boolean;
  energyClass: string;
  conservationState: 'Excellent' | 'Good' | 'Habitable' | 'Needs Renovation';
  images?: PropertyImage[];
  floorPlanUrl?: string;

  // Extended Master Registry Data
  cadastralData?: CadastralInfo;
  mandate?: MandateInfo;
  documents?: DocumentChecklist;
  portalSyndication?: PortalSyndication;
  
  // Valuation & Financials
  askingPrice: number;
  estimatedFairValue: number;
  priceDifferencePct: number; // e.g. -7.7%
  pricePerSqm: number;
  estimatedSaleProbability90d: number;
  estimatedTimeToSaleDays: number;

  // Real Estate Rating Core
  realEstateRating: number;
  ratingClassification: RatingClassification;
  ratingTrend30d: number; // e.g. +4
  ratingConfidence: number;
  ratingConfidenceLevel: ConfidenceLevel;

  // Dimensions
  dimensions: DimensionBreakdown[];

  // Agency Fit Core
  agencyFit: AgencyFitData;

  // Action Score & Decision Intelligence
  actionScenarios?: ActionScenario[];
  actionScoreObjective: string;
  actionScoreConfidence?: number;
  isActionScoreAvailable: boolean;
  actionScoreUnavailableReason?: string;

  // History & Geospatial
  ratingHistory: RatingHistoryEvent[];
  coordinates: {
    lat: number;
    lng: number;
  };

  // Status & Priority
  status: 'Active' | 'Under Offer' | 'Sold' | 'Review Required' | 'Draft';
  priority?: PriorityLevel;
  priorityReason?: string;
  dataFreshnessDays: number;
  isDegraded?: boolean;
  degradationNote?: string;
}

export interface DecisionCenterTask {
  id: string;
  propertyId: string;
  propertyTitle: string;
  location: string;
  decisionType: DecisionType;
  currentRating: number;
  ratingClassification: RatingClassification;
  agencyFit: number;
  recommendedAction: string;
  actionScore: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  priority: PriorityLevel;
  deadline: string;
  status: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'DECLINED';
  notes: string;
}

export type DecisionTask = DecisionCenterTask;


export interface DataSourceItem {
  id: string;
  category: string;
  name: string;
  provider: string;
  status: 'SIMULATED' | 'CONNECTED' | 'PARTIAL' | 'MISSING';
  freshness: string;
  coveragePct: number;
  qualityScore: number;
  confidenceImpact: string;
  recordsCount: string;
  lastSync: string;
}

export interface TerritoryMetric {
  id: string;
  name: string;
  city: string;
  medianPriceSqm: number;
  demandIndex: number; // 0-100
  supplyIndex: number; // 0-100
  liquidityIndex: number; // 0-100
  avgTimeToSaleDays: number;
  transactionVolumeQuarter: number;
  avgRating: number;
  priceTrendYoyPct: number;
  opportunityCount: number;
}

/**
 * ====================================================================
 * SPECIFICHE ARCHITETTURALI v1.0 - FORMAL ONTHOLOGY & DECISION ENGINE
 * ====================================================================
 */

/**
 * Formal Decision Context:
 * D = f(Actor, Object, Context, Objective, Constraints, Evidence, Uncertainty, Time Horizon, Alternatives)
 */
export interface FormalDecisionContext {
  actor: {
    id: string;
    role: 'AGENT' | 'TEAM_LEADER' | 'INVESTOR';
    name: string;
    agencyBranch: string;
  };
  object: {
    propertyId: string;
    propertyTitle: string;
    microZone: string;
    assetType: string;
  };
  context: {
    historicalSales18m: number;
    microzoneLiquidityScore: number;
    agentWorkloadRatio: number; // saturazione operativa
    marketCyclePhase: string;
  };
  objective: 'MAX_LIQUIDITY_60D' | 'MAX_REALIZATION_PRICE' | 'PORTFOLIO_ROTATION' | 'COMMISSION_MARGIN';
  constraints: {
    ownerMinPrice: number;
    mandateDaysRemaining: number;
    exclusiveContract: boolean;
    financialConstraintNote?: string;
  };
  evidence: {
    comparablesCount: number;
    verifiedTransactionsCount: number;
    pastVisitsCount: number;
    registeredPriceObjections: number;
  };
  uncertainty: {
    dataVariance: number;
    missingFeaturesRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    confidenceScore: number; // 0.00 - 1.00
  };
  timeHorizonDays: number;
  alternativesCount: number;
}

/**
 * Tassonomia delle Divergenze Decisionali (Sezione 5.2)
 */
export type DivergencePrimaryCategory = 
  | 'EXTERNAL_CONSTRAINT'
  | 'INFORMATION_GAP'
  | 'MODEL_DISAGREEMENT'
  | 'STRATEGIC_PREFERENCE'
  | 'COMMERCIAL_TIMING'
  | 'UNKNOWN';

export type DivergenceSubCategory =
  | 'OWNER_CONSTRAINT'       // Rigidità negoziale o aspettativa economica proprietario
  | 'CONTRACT_CONSTRAINT'    // Mandato prossimo alla scadenza: rischio recesso
  | 'FINANCIAL_CONSTRAINT'   // Necessità realizzo minimo legata a mutui/debiti
  | 'ASSET_FEATURE_GAP'      // Pregi o difetti interni non censiti nei dati descrittivi
  | 'NEGOTIATION_INSIGHT'    // Trattativa riservata già in corso con acquirente target
  | 'PEER_GROUP_REJECTION'   // L'agente contesta la comparabilità del paniere adottato
  | 'LOCAL_TREND_OVERRIDE'   // Percezione locale di dinamiche non intercettate dal dato
  | 'MARGIN_OVER_VELOCITY'   // Priorità alla marginalità provvigionale anziché ai tempi
  | 'PLANNED_DELAY'          // Attesa pianificata: stagionalità, delibere assembleari
  | 'UNPROVEN_EVIDENCE';     // Evidenza insufficiente per formulare un'ipotesi affidabile

export interface BehavioralSignalItem {
  signal: string;
  timestamp: string;
  duration_seconds?: number;
  intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface InferredMotivation {
  primary_category: DivergencePrimaryCategory;
  sub_category: DivergenceSubCategory;
  confidence_score: number; // 0.00 - 1.00
  status: 'PROVISIONAL' | 'CONSOLIDATED';
  probability_distribution: Record<DivergencePrimaryCategory, number>;
  bayesianUpdatesCount: number;
}

/**
 * Tracciamento Esiti a Due Stadi Temporali (Sezione 6)
 */
export interface ShortTermProxyOutcomes {
  windowDays: 14 | 21;
  views_delta_pct: string;
  leads_delta_14d: string;
  visits_scheduled_14d: number;
  offers_received_14d: number;
  price_feedback_alignment: 'RESISTANCE' | 'FAVORABLE' | 'NEUTRAL';
  immediateWeightUpdateApplied: boolean;
}

export interface FinalOutcome {
  closed: boolean;
  sale_price: number;
  days_on_market_total: number;
  mandate_outcome: 'COMPLETED' | 'EXPIRED' | 'REVOKED';
  price_delta_vs_ai_pct: number;
  time_delta_vs_ai_days: number;
}

/**
 * Filtro per la Disattenzione Operativa (Effort-Adjusted Attribution - Sezione 6.1)
 */
export interface OperationalEffortFilter {
  avgLeadContactTimeHours: number; // tempo medio risposta lead
  listingFreshnessDays: number;
  adSpendAllocatedEuros: number;
  scheduledVisitsCompletedRatio: number;
  isAttributedToOperationalInertia: boolean; // se true, ESCLUSO dall'aggiornamento World Model
  attributionReason: string;
}

/**
 * Schema Dati Unificato v1.0 del Decision Log (Sezione 5.4)
 */
export interface FormalDecisionLogEvent {
  event_id: string;
  timestamp: string;
  decision_context: {
    property_id: string;
    property_title: string;
    agent_id: string;
    agent_name: string;
    agency_id: string;
    objective: string;
    mandate_days_remaining: number;
  };
  rating_snapshot: {
    real_estate_rating: number;
    agency_fit_score: number;
    confidence: number;
    dimensions: {
      price_fit: number;
      demand: number;
      liquidity: number;
      location?: number;
    };
  };
  recommendation_issued: {
    action_type: string;
    current_price: number;
    recommended_price: number;
    action_score: number;
    predicted_probability_60d: number;
    expected_time_to_sale_days: number;
  };
  observed_human_decision: {
    event_type: 'ACCEPTED_RECOMMENDATION' | 'PARTIAL_PRICE_ADJUSTMENT' | 'PRICE_OVERRIDE' | 'HOLD_MAINTAINED' | 'DELAYED_ACTION';
    applied_price: number;
    delta_vs_recommendation: number;
    slider_release_point?: number;
  };
  behavioral_signals_48h: BehavioralSignalItem[];
  inferred_motivation: InferredMotivation;
  operational_effort: OperationalEffortFilter;
  outcome_tracking: {
    short_term_proxies: ShortTermProxyOutcomes;
    final_outcome?: FinalOutcome;
  };
  learning_segregation: {
    world_model_impact: string;
    decision_model_impact: string;
    anti_bias_applied: boolean;
  };
}

/**
 * Metriche North Star Platform v1.0 (Sezione 8)
 */
export interface NorthStarFramework {
  // 8.1 Indice di Compressione Temporale (ΔTTS) = ((TTS_reale - TTS_benchmark) / TTS_benchmark) * 100
  deltaTTSPct: number; 
  ttsRealAvgDays: number;
  ttsBenchmarkAvgDays: number;

  // 8.2 Realization Rate di Mandato (RR) = Prezzo Finale Transato / Prezzo Raccomandato all'Acquisizione (target ~1.00)
  realizationRate: number; 

  // 8.3 Tasso di Conversione Mandato (ΔMandate Conversion) = % incarichi chiusi vs scadenza/revoca vs baseline
  mandateConversionPct: number;
  baselineConversionPct: number;
  mandateConversionDeltaPct: number;
}

