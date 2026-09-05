/**
 * PropTech Decision Intelligence Platform - Core Types
 * Architecture: Supabase (PostgreSQL) + Node.js Edge Function / API
 */

export type EnergyClass = 'A4' | 'A3' | 'A2' | 'A1' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type PropertyTypology = 'APARTMENT' | 'PENTHOUSE' | 'VILLA' | 'STUDIO' | 'LOFT' | 'TOWNHOUSE';
export type ConservationState = 'EXCELLENT' | 'GOOD' | 'HABITABLE' | 'NEEDS_RENOVATION' | 'UNDER_CONSTRUCTION';

export interface PropertyData {
  id: string;
  external_code: string;
  title: string;
  address: string;
  city: string;
  province: string;
  micro_zone: string;
  macro_zone: string;
  postal_code: string;
  typology: PropertyTypology;
  square_meters: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  total_floors: number;
  has_elevator: boolean;
  has_balcony_or_terrace: boolean;
  has_parking_space: boolean;
  has_cellar: boolean;
  construction_year?: number | null;
  last_renovated_year?: number | null;
  energy_class?: EnergyClass | null;
  conservation_state: ConservationState;
  asking_price: number;
  estimated_renovation_cost?: number | null;
  seller_urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  features: {
    heating_type?: string;
    exposure?: string[];
    monthly_condo_fees?: number;
    concierge?: boolean;
    air_conditioning?: boolean;
    notes?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface MarketData {
  id: string;
  property_id?: string | null;
  micro_zone: string;
  macro_zone: string;
  reference_period: string; // e.g. '2026-Q1'
  avg_price_sqm?: number | null;
  median_price_sqm?: number | null;
  median_days_on_market?: number | null;
  demand_intensity_index?: number | null; // 0 - 100
  active_supply_count?: number | null;
  monthly_absorption_rate?: number | null; // percentage, e.g. 18.5%
  comparables_count?: number | null;
  price_trend_yoy_pct?: number | null; // percentage, e.g. +3.2%
  raw_comparables?: Array<{
    id: string;
    distance_meters: number;
    price_sqm: number;
    sold_date?: string;
    similarity_score: number;
  }> | null;
  data_freshness_days?: number | null;
  created_at?: string;
}

export type RecommendedAction = 
  | 'ACQUIRE_PRIORITY'     // Rating >= 80, forte upside o ottima liquidità
  | 'ACQUIRE_STANDARD'     // Rating 65-79, buon affare a prezzo congruo
  | 'RENEGOTIATE_PRICE'    // Rating 50-64 o prezzo richiesto > stima
  | 'REJECT_UNFAVORABLE';  // Rating < 50, alto rischio o venditore fuori mercato

export interface BuyerProfile {
  id: string;
  name: string;
  category: 'FIRST_TIME_BUYER' | 'BUY_TO_LET_INVESTOR' | 'FAMILY_UPGRADER' | 'HIGH_NET_WORTH' | 'FLIPPER';
  match_score: number; // 0 - 100
  rationale: string;
  avg_budget_eur: number;
}

export interface DegradationPenalty {
  signal_name: string;
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
  points_deducted: number;
  reason: string;
  fallback_strategy: string;
}

export interface EvaluationResult {
  property_id: string;
  evaluated_at: string;
  model_version: string;
  
  // Dynamic Score (0 - 100)
  overall_rating: number;
  
  // Confidence Score (0 - 100) with Graceful Degradation
  confidence_score: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  is_degraded: boolean;
  degradation_penalties: DegradationPenalty[];
  
  // Pillar breakdown
  sub_scores: {
    intrinsic_quality: number;      // 0 - 100: conservazione, piano, ascensore, classe energetica
    market_momentum: number;        // 0 - 100: intensità domanda, assorbimento, trend
    price_competitiveness: number;  // 0 - 100: asking price vs benchmark
    liquidity_speed: number;        // 0 - 100: giorni medi sul mercato stimati
  };

  // Valuation corridor
  valuation: {
    asking_price: number;
    asking_price_sqm: number;
    benchmark_price_sqm: number;
    suggested_target_price: number;
    suggested_min_price: number;
    suggested_max_price: number;
    discount_recommended_pct: number;
  };

  // Decision Intelligence Output
  recommended_action: RecommendedAction;
  action_headline: string;
  executive_summary: string;
  target_buyers: BuyerProfile[];
  risk_factors: string[];
}

export type AgentDecisionOutcome = 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED' | 'PENDING';

export type RejectionCategory = 
  | 'PRICE_UNREALISTIC'
  | 'POOR_PHYSICAL_CONDITION'
  | 'UNRESOLVED_LEGAL_ISSUES'
  | 'MICRO_ZONE_DEGRADATION'
  | 'SELLER_INFLEXIBLE'
  | 'CONDO_EXPENSES_EXCESSIVE'
  | 'OTHER';

export interface DecisionLogEntry {
  id: string;
  property_id: string;
  agent_id: string;
  agent_name: string;
  evaluated_at: string;
  model_version: string;
  
  // System Recommendation Snapshot
  system_rating: number;
  system_confidence: number;
  system_recommended_action: RecommendedAction;
  system_suggested_price: number;
  system_degraded: boolean;
  system_missing_signals: string[];

  // Agent Feedback / Proprietary Loop
  agent_decision: AgentDecisionOutcome;
  agent_final_price?: number | null;
  agent_action_taken?: string | null;
  rejection_category?: RejectionCategory | null;
  agent_feedback_notes?: string | null;
  delta_price_pct?: number | null;
  
  decided_at?: string;
  created_at: string;
}
