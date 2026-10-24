/**
 * Domain types for Hybrid Comparables Engine & Market Comparison Approach (MCA)
 * Conforme con il Principio di Graceful Degradation della Product Thesis v1.0 (§28).
 */

export interface ComparableTransaction {
  id: string;
  source: 'REDIP_CLOSED_LOOP' | 'AGENCY_HISTORICAL';
  propertyAddress: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  transactionDate: string; // ISO format (es. "2025-11-14")
  monthsAgo: number;
  salePriceEur: number;
  surfaceMq: number;
  pricePerMq: number;
  features: {
    floor: number;
    hasElevator: boolean;
    conservationState: 'OTTIMO' | 'NORMALE' | 'DA_RISTRUTTURARE';
    energyClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  };
  mcaAdjustments?: {
    floorAdjustmentEur: number;
    elevatorAdjustmentEur: number;
    stateAdjustmentEur: number;
    energyAdjustmentEur: number;
    totalAdjustmentEur: number;
    adjustedPriceEur: number;
    adjustedPricePerMq: number;
  };
}

export interface McaEvaluationResult {
  status: 'MCA_SAMPLE_VALID' | 'FALLBACK_OMI_DEGRADED';
  comparablesFoundCount: number;
  comparables: ComparableTransaction[];
  mcaFairValueCentral: number;
  mcaPricePerMqMean: number;
  divergenceSpreadPct: number; // Dispersione max-min dei prezzi rettificati (target <= 10%)
  confidencePenaltyApplied: number; // 0 se >= 3 comparabili, 25 se < 3 comparabili
  appliedRationale: string;
}
