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
