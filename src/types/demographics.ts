/**
 * Demographics Domain Types - ISTAT SDMX Integration
 * Conforme con la Product Thesis v1.0 (§28 Graceful Degradation & §29 Zero Mock Policy)
 */

export type DemographicsDataSource = 'ISTAT_API_LIVE' | 'LOCAL_CACHE' | 'REGIONAL_FALLBACK';

export interface MunicipalityDemographics {
  municipalityCode: string;       // Codice ISTAT (es. '058091') o Catastale ('H501')
  municipalityName: string;       // Nome del Comune (es. 'Roma', 'Campobasso', 'Milano')
  referenceYear: number;          // Anno censuario/rilevazione (es. 2024 / 2025)
  totalPopulation: number;        // Popolazione residente totale
  densityPerKm2: number;          // Densità abitativa (ab/km²)
  agingIndex: number;             // Indice di vecchiaia (over-65 / under-15 * 100)
  youngFamiliesRatio: number;     // Quota giovani famiglie 25-44 anni (es. 0.25 = 25%)
  dataSource: DemographicsDataSource;
  fetchedAt: string;              // ISO timestamp
  surfaceKm2?: number;            // Superficie territoriale comunale
  cadastralCode?: string;         // Codice Catastale (es. 'H501')
  demographicHealthScore?: number; // Punteggio sintetico dinamico 0-100 per Rating Pilastro 7
}

export interface DemographicsEnrichmentResult {
  demographics: MunicipalityDemographics;
  macroPillarImpact: {
    status: 'VERIFIED' | 'SIMULATED';
    scoreContribution: number;
    agingRatioPenaltyOrBonus: number;
    densityPressureScore: number;
  };
  demandMatchImpact: {
    targetYoungFamiliesCount: number;
    reweightedAgencyFitScore: number;
  };
}
