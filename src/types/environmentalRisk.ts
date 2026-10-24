/**
 * REDIP - Territorial & Environmental Risk Types
 * Conforme con la Product Thesis (§28 Graceful Degradation, §29 Zero Mock Policy)
 * e Pilastro 4 (Asset Risk Index - 15%).
 */

export type SeismicZone = 1 | 2 | 3 | 4;
export type HydraulicRiskLevel = 'NONE' | 'P1_LOW' | 'P2_MEDIUM' | 'P3_HIGH';
export type LandslideRiskLevel = 'NONE' | 'MODERATE' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface EnvironmentalRiskProfile {
  seismicZone: SeismicZone;
  seismicScore: number;               // 0 - 100
  floodRiskLevel: HydraulicRiskLevel;
  floodScore: number;                 // 0 - 100
  landslideRiskLevel: LandslideRiskLevel;
  landslideScore: number;             // 0 - 100
  landscapeConstraint: boolean;       // Vincolo Paesaggistico ex D.Lgs 42/04
  overallRiskIndex: number;           // Punteggio cardinale normalizzato (0 - 100)
  dataSource: 'ISPRA_IDROGEO_LIVE' | 'PCIV_OFFICIAL_TABLE' | 'PROVINCIAL_FALLBACK';
  isVerified: boolean;
  fetchedAt: string;
  seismicZoneLabel?: string;          // es. "Zona 3 - Bassa sismicità"
  details?: {
    municipalityName?: string;
    cadastralCode?: string;
    pcmOrderReference?: string;       // es. "OPCM 3274/2003"
    paiBasinAuthority?: string;       // es. "Autorità di Bacino Distrettuale dell'Appennino Centrale"
  };
}

export interface RiskEnrichmentImpact {
  riskScore: number;
  floodScore: number;
  seismicScore: number;
  landslideScore: number;
  status: 'RISCHIO MINIMO CERTIFICATO' | 'RISCHIO MODERATO' | 'ATTENZIONE RICHIESTA' | 'IN VERIFICA';
  auditBoostApplied: boolean;
  confidencePenaltyApplied: number;
}
