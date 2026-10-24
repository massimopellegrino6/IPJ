/**
 * Domain types for Public Data Ingestion Infrastructure (World Model Baseline)
 * Conforme con la Product Thesis v1.0 e i 7 assi del Real Estate Rating di REDIP.
 */

export interface OmiZoneQuotation {
  comuneIstat: string;
  zonaOmi: string; // es. "B1", "C2", "D1", "RM_B1", "MI_B1"
  fasciaDescrizione: 'Centrale' | 'Semicentrale' | 'Periferica' | 'Suburbana' | 'Extraurbana';
  statoConservativo: 'OTTIMO' | 'NORMALE' | 'SCADENTE';
  compravenditaMinEurMq: number;
  compravenditaMaxEurMq: number;
  locazioneMinEurMq: number;
  locazioneMaxEurMq: number;
  annoRiferimento: number;
  semestreRiferimento: 1 | 2;
}

export interface OsmLocationPois {
  subwayStationsCount500m: number;
  nearestSubwayDistanceMeters: number | null;
  busStopsCount350m: number;
  schoolsCount500m: number;
  pharmaciesCount500m: number;
  supermarketsCount500m: number;
  parksCount500m: number;
  calculatedWalkabilityIndex: number; // 0 - 100
  locationScoreNormalized: number;    // 0 - 100
  elements?: Array<{
    id: string;
    name: string;
    category: 'transit' | 'education' | 'green' | 'retail' | 'health';
    distanceMeters: number;
    walkingMinutes: number;
    lineOrDetail?: string;
    lat?: number;
    lon?: number;
  }>;
}

export interface MacroCreditSnapshot {
  recordedAt: string;
  euribor3m: number;
  euribor6m: number;
  eurIrs20y: number;
  avgMortgageTaegItaly: number; // TAEG medio (Banca d'Italia)
  creditAvailabilityIndex: number; // 0 - 100
  liquidityDiscountFactor: number; // fattore assorbimento DOM (es. 0.85 - 1.15)
}

import { ComparableTransaction, McaEvaluationResult } from './comparables';
import { MunicipalityDemographics } from './demographics';
import { EnvironmentalRiskProfile } from './environmentalRisk';

export interface ExternalMarketDataPackage {
  propertyCoordinates: { lat: number; lon: number };
  omi: OmiZoneQuotation | null;
  locationPois: OsmLocationPois | null;
  macroCredit: MacroCreditSnapshot;
  mca?: McaEvaluationResult;
  demographics?: MunicipalityDemographics;
  environmentalRisk?: EnvironmentalRiskProfile;
  territory?: any;
  omiBand?: any;
  dataCompletenessScore: number;
}
