/**
 * ============================================================================
 * PROPTECH DECISION INTELLIGENCE PLATFORM (REDIP) - CORE DECISION ENGINE
 * ============================================================================
 * 
 * Product Thesis v1.0 Architectural Specifications:
 * 1. "Observed Fact ≠ Inferred Motivation":
 *    Probabilistic vector distribution P(M) with UNKNOWN inertia baseline (>= 0.40).
 *    Asynchronous Bayesian updates triggered by subsequent behavioral signals.
 * 2. Decoupled Action Score:
 *    Independent evaluation of urgency, economic elasticity, and CRM agency fit,
 *    decoupled from intrinsic asset rating (World Model).
 * 3. Graceful Degradation & Decision Fail-Safe:
 *    Deterministic penalty rules with programmatic fail-safe disabling Action Score
 *    prescriptions when Confidence Score < 50%.
 * 4. Effort-Adjusted Attribution:
 *    Objective segregation between market rejection (World Model recalibration)
 *    and organizational inertia bias (World Model sterilization).
 * 
 * Compatible with: Supabase Edge Functions (Deno/Node), Express API, or AWS Lambda.
 */

import { 
  PropertyData, 
  MarketData, 
  EvaluationResult, 
  DegradationPenalty, 
  RecommendedAction, 
  BuyerProfile,
  DecisionLogEntry,
  AgentDecisionOutcome,
  RejectionCategory
} from '../types/proptech';

import {
  DecisionDivergenceCategory,
  MotivationProbabilityVector,
  BehavioralSignal,
  OperativeEffortMetrics,
  AttributionSegregation,
  ProxyMetricsSnapshot,
  ProxyReconciliationResult,
  DecisionLifecycleStatus,
  FinalMandateOutcome,
  OperativeEffortSnapshot,
  FinalOutcomeReconciliation
} from '../types/decision';

import { PropertyItem } from '../types/intelligence';
import { 
  ExternalMarketDataPackage, 
  OmiZoneQuotation, 
  OsmLocationPois, 
  MacroCreditSnapshot 
} from '../types/marketData';
import { McaEvaluationResult } from '../types/comparables';
import { MunicipalityDemographics } from '../types/demographics';
import { EnvironmentalRiskProfile } from '../types/environmentalRisk';
import { fetchOsmLocationPois } from './osmClient';
import { 
  evaluatePriceFitScore, 
  resolveOmiZoneCode, 
  getOmiQuotation, 
  getOmiFairValueRange,
  getOmiBandsForProperty,
  OmiBandData
} from './omiClient';
import { resolveTerritory, ResolvedTerritory } from './territorialResolver';
import { getMacroCreditContext } from './macroCreditClient';
import { evaluateSubjectWithMca } from './comparablesClient';
import { getMunicipalityDemographics } from './istatDemographicsClient';
import { getEnvironmentalRisk } from './environmentalRiskClient';
import { 
  calculateDemographicPillarScores, 
  reweightAgencyFitWithDemographics,
  calculateEnvironmentalRiskPillarScores,
  calculateEconomicsPillarScores
} from './ratingEngine';

// ----------------------------------------------------------------------------
// Architectural Constants & Weights
// ----------------------------------------------------------------------------

const MODEL_VERSION = 'prototype-v1.0-bayes';

/**
 * Weights assigned to the 4 pillars of the dynamic rating score (World Model).
 * Sum = 1.0 (100%)
 */
export const PILLAR_WEIGHTS = {
  INTRINSIC_QUALITY: 0.35,      // Qualità fisica, impiantistica e layout
  MARKET_MOMENTUM: 0.25,        // Tensione della domanda e assorbimento microzona
  PRICE_COMPETITIVENESS: 0.25,  // Rapporto prezzo richiesto vs benchmark reale
  LIQUIDITY_SPEED: 0.15,        // Facilità di smobilizzo / giorni stimati sul mercato
};

/**
 * Deterministic Penalty Deductions for Confidence Score (100 baseline).
 * Thesis §5.2 Specification.
 */
export const CONFIDENCE_PENALTIES = {
  MISSING_COMPARABLES: 25,         // Assenza comparabili diretti (< 3 transazioni entro 500m)
  INSUFFICIENT_COMPARABLES: 15,    // Meno di 3 comparabili validi
  MISSING_DEMAND_INDEX: 20,        // Indice domanda CRM locale mancante o non calcolabile
  MISSING_ABSORPTION_RATE: 15,     // Tasso assorbimento locale non disponibile
  MISSING_ENERGY_CLASS_OR_CADASTRAL: 10, // Documentazione catastale o APE non certificata
  MISSING_DAYS_ON_MARKET: 10,      // Mancanza giorni mediani di giacenza
  OUTDATED_MARKET_DATA: 10,        // Dati di mercato più vecchi di 90 giorni
  MISSING_RENOVATION_COST: 8,      // Mancata stima capex per immobili da ristrutturare
  MARKET_DATA_COMPLETE_ABSENCE: 55 // Assenza totale di dati microzona
};

// ----------------------------------------------------------------------------
// Helper: Normalizzatore di Accesso Proprietà (PropertyData vs PropertyItem)
// ----------------------------------------------------------------------------

function extractPropertyCoreFields(property: PropertyData | PropertyItem) {
  const askingPrice = 'asking_price' in property ? property.asking_price : property.askingPrice;
  const squareMeters = 'square_meters' in property ? property.square_meters : property.squareMeters;
  const energyClass = 'energy_class' in property ? property.energy_class : (property as any).energyClass;
  const conservationState = 'conservation_state' in property ? property.conservation_state : (property as any).conservationState;
  const estimatedRenovationCost = 'estimated_renovation_cost' in property 
    ? property.estimated_renovation_cost 
    : 0;
  const hasElevator = 'has_elevator' in property ? property.has_elevator : (property as any).hasElevator;
  const floor = property.floor ?? 1;
  const rooms = property.rooms ?? 2;
  const microZone = 'micro_zone' in property ? property.micro_zone : (property as any).microZone;

  // Catastale / Documenti
  let hasCadastralOrApe = !!energyClass;
  if ('documents' in property && property.documents) {
    hasCadastralOrApe = property.documents.energyCertificateAPE && property.documents.floorPlanCompliance;
  }

  return {
    askingPrice,
    squareMeters,
    energyClass,
    conservationState,
    estimatedRenovationCost,
    hasElevator,
    floor,
    rooms,
    microZone,
    hasCadastralOrApe
  };
}

// ----------------------------------------------------------------------------
// 1. HELPER: INTRINSIC QUALITY SCORING (0 - 100) (World Model)
// ----------------------------------------------------------------------------

export function calculateIntrinsicScore(property: PropertyData | PropertyItem): number {
  const fields = extractPropertyCoreFields(property);
  let score = 50; // Neutral baseline

  // 1. Conservation State (30 pts)
  const consState = String(fields.conservationState || '').toUpperCase();
  if (consState === 'EXCELLENT') {
    score += 25;
  } else if (consState === 'GOOD') {
    score += 15;
  } else if (consState === 'HABITABLE') {
    score += 5;
  } else if (consState === 'NEEDS_RENOVATION' || consState === 'NEEDS RENOVATION') {
    score -= 15;
    if (fields.estimatedRenovationCost && fields.estimatedRenovationCost > 0) {
      score += 5;
    }
  } else if (consState === 'UNDER_CONSTRUCTION') {
    score += 10;
  }

  // 2. Energy Class (25 pts)
  if (fields.energyClass) {
    const ec = fields.energyClass.toUpperCase();
    if (['A4', 'A3', 'A2', 'A1', 'A'].includes(ec)) {
      score += 20;
    } else if (['B', 'C'].includes(ec)) {
      score += 10;
    } else if (['D', 'E'].includes(ec)) {
      score += 0;
    } else if (['F', 'G'].includes(ec)) {
      score -= 10;
    }
  }

  // 3. Floor & Accessibility (20 pts)
  if (fields.floor === 0) {
    score -= 5;
  } else if (fields.floor >= 3) {
    if (fields.hasElevator) {
      score += 10;
    } else {
      score -= 20; // Penalità severa per piano alto privo di ascensore
    }
  } else {
    score += fields.hasElevator ? 5 : 0;
  }

  // 4. Layout efficiency
  const sqmPerRoom = fields.squareMeters / Math.max(1, fields.rooms);
  if (sqmPerRoom >= 22 && sqmPerRoom <= 45) {
    score += 5;
  }

  return Math.min(100, Math.max(10, Math.round(score)));
}

// ----------------------------------------------------------------------------
// 2. NATIVE CONFIDENCE SCORE & GRACEFUL DEGRADATION ENGINE (Thesis §5)
// ----------------------------------------------------------------------------

export interface ConfidenceScoreResult {
  score: number;
  penalties: Array<{ code: string; penalty: number; reason: string; fallbackStrategy: string }>;
  isDegraded: boolean;
  isActionScoreAvailable: boolean;
  actionScoreUnavailableReason?: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
}

/**
 * Native & Endogenous Confidence Score Calculator.
 * Implements deterministic degradation penalties and fail-safe prescription gating.
 * 
 * Rules:
 * - Mancanza comparabili notarili (< 3 transazioni entro 500m): -25 pts (0 comp) o -15 pts (< 3 comp)
 * - Indice domanda CRM locale mancante: -20 pts (fallback su valore mediano 50)
 * - Tasso assorbimento locale non disponibile: -15 pts (fallback su media metropolitana)
 * - Documentazione catastale/APE non certificata: -10 pts
 * - Fail-Safe: Se score < 50%, isActionScoreAvailable = false.
 */
export function calculateConfidenceScore(
  property: PropertyData | PropertyItem,
  marketData: MarketData | null
): ConfidenceScoreResult {
  const fields = extractPropertyCoreFields(property);
  const penalties: Array<{ code: string; penalty: number; reason: string; fallbackStrategy: string }> = [];
  let confidence = 100;

  // Rule 1: Catastale / APE check (-10 pts)
  if (!fields.hasCadastralOrApe) {
    confidence -= CONFIDENCE_PENALTIES.MISSING_ENERGY_CLASS_OR_CADASTRAL;
    penalties.push({
      code: 'MISSING_ENERGY_CLASS_OR_CADASTRAL',
      penalty: CONFIDENCE_PENALTIES.MISSING_ENERGY_CLASS_OR_CADASTRAL,
      reason: 'Attestato APE o scheda catastale conforme non comunicata o non certificata.',
      fallbackStrategy: 'Assunta classe energetica convenzionale (E/F) e conformità con riserva periziale.'
    });
  }

  // Renovation capex audit
  const consState = String(fields.conservationState || '').toUpperCase();
  if ((consState === 'NEEDS_RENOVATION' || consState === 'NEEDS RENOVATION') && (!fields.estimatedRenovationCost || fields.estimatedRenovationCost <= 0)) {
    confidence -= CONFIDENCE_PENALTIES.MISSING_RENOVATION_COST;
    penalties.push({
      code: 'MISSING_RENOVATION_COST',
      penalty: CONFIDENCE_PENALTIES.MISSING_RENOVATION_COST,
      reason: 'Immobile da ristrutturare privo di computo metrico stimato.',
      fallbackStrategy: 'Applicata stima parametrica di capex (€650/mq).'
    });
  }

  // Market indicators audit
  if (!marketData) {
    confidence -= CONFIDENCE_PENALTIES.MARKET_DATA_COMPLETE_ABSENCE;
    penalties.push({
      code: 'MARKET_DATA_COMPLETE_ABSENCE',
      penalty: CONFIDENCE_PENALTIES.MARKET_DATA_COMPLETE_ABSENCE,
      reason: 'Nessun record di mercato disponibile per la microzona specificata.',
      fallbackStrategy: 'Fallback su valori medi regionali con margine di sicurezza prudenziale del 15%.'
    });
  } else {
    // Rule 2: Comparabili notarili check (-25 pts se 0, -15 pts se < 3)
    if (!marketData.comparables_count || marketData.comparables_count === 0) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_COMPARABLES;
      penalties.push({
        code: 'MISSING_COMPARABLES',
        penalty: CONFIDENCE_PENALTIES.MISSING_COMPARABLES,
        reason: 'Assenza di compravendite notarili comparabili nel raggio di 500m (< 6 mesi).',
        fallbackStrategy: 'Calcolo basato su quotazioni medie storiche di quartiere anziché transato puntuale.'
      });
    } else if (marketData.comparables_count < 3) {
      confidence -= CONFIDENCE_PENALTIES.INSUFFICIENT_COMPARABLES;
      penalties.push({
        code: 'INSUFFICIENT_COMPARABLES',
        penalty: CONFIDENCE_PENALTIES.INSUFFICIENT_COMPARABLES,
        reason: `Campione di comparabili notarili insufficiente (${marketData.comparables_count} transazioni su 3 minime).`,
        fallbackStrategy: 'Allargamento prudenziale del corridoio di stima a +/- 8%.'
      });
    }

    // Rule 3: Indice domanda CRM locale (-20 pts)
    if (marketData.demand_intensity_index === null || marketData.demand_intensity_index === undefined) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_DEMAND_INDEX;
      penalties.push({
        code: 'MISSING_DEMAND_INDEX',
        penalty: CONFIDENCE_PENALTIES.MISSING_DEMAND_INDEX,
        reason: 'Indice di pressione della domanda CRM non pervenuto per la microzona.',
        fallbackStrategy: 'Fallback automatico su valore mediano convenzionale di mercato (50/100).'
      });
    }

    // Rule 4: Tasso assorbimento locale (-15 pts)
    if (marketData.monthly_absorption_rate === null || marketData.monthly_absorption_rate === undefined) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_ABSORPTION_RATE;
      penalties.push({
        code: 'MISSING_ABSORPTION_RATE',
        penalty: CONFIDENCE_PENALTIES.MISSING_ABSORPTION_RATE,
        reason: 'Tasso di assorbimento locale mensile non calcolabile.',
        fallbackStrategy: 'Stima derivata dalla media metropolitana ponderata di zona.'
      });
    }

    // Days on market (-10 pts)
    if (marketData.median_days_on_market === null || marketData.median_days_on_market === undefined) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_DAYS_ON_MARKET;
      penalties.push({
        code: 'MISSING_DAYS_ON_MARKET',
        penalty: CONFIDENCE_PENALTIES.MISSING_DAYS_ON_MARKET,
        reason: 'Tempo mediano di vendita (DOM) non disponibile.',
        fallbackStrategy: 'Adottato benchmark cittadino standard (120 giorni).'
      });
    }

    // Freshness decay (-10 pts)
    if (marketData.data_freshness_days && marketData.data_freshness_days > 90) {
      confidence -= CONFIDENCE_PENALTIES.OUTDATED_MARKET_DATA;
      penalties.push({
        code: 'OUTDATED_MARKET_DATA',
        penalty: CONFIDENCE_PENALTIES.OUTDATED_MARKET_DATA,
        reason: `Dati di mercato non freschi (${marketData.data_freshness_days} giorni fa > 90gg).`,
        fallbackStrategy: 'Applicato fattore di decadimento temporale sulle serie storiche.'
      });
    }
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(confidence)));
  const isDegraded = penalties.length > 0;

  let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' = 'HIGH';
  if (finalScore < 45) confidenceLevel = 'INSUFFICIENT';
  else if (finalScore < 70) confidenceLevel = 'LOW';
  else if (finalScore < 85) confidenceLevel = 'MEDIUM';

  // Regola di Fail-Safe Decisionale: Confidence Score < 50%
  const isActionScoreAvailable = finalScore >= 50;
  const actionScoreUnavailableReason = !isActionScoreAvailable
    ? 'Prescrizione decisionale non disponibile: evidenza empirica insufficiente per garantire affidabilità statistica'
    : undefined;

  return {
    score: finalScore,
    penalties,
    isDegraded,
    isActionScoreAvailable,
    actionScoreUnavailableReason,
    confidenceLevel
  };
}

// ----------------------------------------------------------------------------
// 3. ACTION SCORE ENGINE (Disaccoppiamento dal Rating - Thesis §2)
// ----------------------------------------------------------------------------

export interface ActionScoreParams {
  priceRatio: number;          // prezzo_proposto / fair_value_stimato (es. 1.15 = +15% overpricing)
  mandateDaysRemaining: number;// giorni residui prima della revoca/scadenza del mandato
  leadsTrend14d: number;       // variazione percentuale recente di richieste contatti (-50, +10, etc.)
  agencyFitScore: number;      // compatibilità CRM (0-100)
  marketLiquidityDays: number; // tempo mediano di assorbimento locale (giorni)
  confidenceScore?: number;    // confidenza dati (se < 50 disattiva prescrizione)
}

export interface ActionScoreResult {
  actionScore: number;
  isActionScoreAvailable: boolean;
  actionScoreUnavailableReason?: string;
  components: {
    urgencyScore: number;
    economicElasticityScore: number;
    agencyFitComponent: number;
  };
  weights: {
    weightUrgency: number;
    weightEconomic: number;
    weightFit: number;
  };
  urgencyMultiplierApplied: boolean;
  rationale: string;
}

/**
 * Calcola l'Action Score contestuale disaccoppiato dall'Asset Rating.
 * 
 * - Rating = Valutazione oggettiva standardizzata dell'asset (World Model).
 * - Action Score = Quantificazione dell'urgenza e convenienza di una specifica azione
 *   dato il Decision Context (Decision Model).
 * 
 * In grado di produrre un Action Score elevato (es. 92/100) per immobili con Rating medio-basso
 * ma con mandato in imminente decadenza e overpricing evidente.
 */
export function calculateActionScore(params: ActionScoreParams): ActionScoreResult {
  const {
    priceRatio,
    mandateDaysRemaining,
    leadsTrend14d,
    agencyFitScore,
    marketLiquidityDays,
    confidenceScore
  } = params;

  // Fail-Safe check
  if (confidenceScore !== undefined && confidenceScore < 50) {
    return {
      actionScore: 0,
      isActionScoreAvailable: false,
      actionScoreUnavailableReason: 'Prescrizione decisionale non disponibile: evidenza empirica insufficiente per garantire affidabilità statistica',
      components: { urgencyScore: 0, economicElasticityScore: 0, agencyFitComponent: 0 },
      weights: { weightUrgency: 0.4, weightEconomic: 0.35, weightFit: 0.25 },
      urgencyMultiplierApplied: false,
      rationale: 'Prescrizione congelata: confidenza statistica sotto la soglia minima di sicurezza (50%).'
    };
  }

  // 1. Componente Urgenza Temporale
  // Rapporto giorni mandato residui vs tempo mediano di assorbimento
  const normalizedLiquidity = Math.max(30, marketLiquidityDays || 90);
  const mandateRatio = Math.max(0, Math.min(1, mandateDaysRemaining / normalizedLiquidity));
  let baseUrgency = Math.round((1 - mandateRatio) * 80 + 15);

  let urgencyMultiplier = 1.0;
  let urgencyMultiplierApplied = false;

  // Regola di moltiplicatore esponenziale: mandateDaysRemaining < 30 e leadsTrend14d < 0
  if (mandateDaysRemaining < 30 && leadsTrend14d < 0) {
    urgencyMultiplierApplied = true;
    const leadsDeficitSeverity = Math.min(2.5, Math.abs(leadsTrend14d) / 25);
    // Moltiplicatore esponenziale proporzionale al deficit di contatti
    urgencyMultiplier = 1.0 + Math.exp(leadsDeficitSeverity * 0.75) * 0.40;
  }

  const urgencyScore = Math.min(100, Math.max(10, Math.round(baseUrgency * urgencyMultiplier)));

  // 2. Componente Economica & Elasticità di Prezzo
  // Se l'immobile è fortemente overpriced (priceRatio > 1.05), la necessità di un'azione di repricing è massima
  // Se è a sconto (priceRatio <= 0.92), l'urgenza di collocamento immediato su portafoglio investitori è alta
  let economicElasticityScore = 50;
  if (priceRatio >= 1.20) {
    economicElasticityScore = 95; // Overpricing critico -> altissimo bisogno di intervenire
  } else if (priceRatio >= 1.10) {
    economicElasticityScore = 86;
  } else if (priceRatio >= 1.03) {
    economicElasticityScore = 72;
  } else if (priceRatio >= 0.95 && priceRatio < 1.03) {
    economicElasticityScore = 58; // In equilibrio
  } else if (priceRatio < 0.95 && priceRatio >= 0.88) {
    economicElasticityScore = 80; // Sconto interessante -> azione di acquisizione prioritaria
  } else {
    economicElasticityScore = 92; // Forte sconto -> liquidità immediata
  }

  // 3. Componente Opportunità CRM (Agency Fit)
  const agencyFitComponent = Math.min(100, Math.max(0, agencyFitScore));

  // Pesi dinamici in funzione del contesto decisionale
  let weightUrgency = 0.40;
  let weightEconomic = 0.35;
  let weightFit = 0.25;

  if (mandateDaysRemaining < 30) {
    // Il tempo stringe: l'urgenza temporale diventa dominante
    weightUrgency = 0.50;
    weightEconomic = 0.30;
    weightFit = 0.20;
  } else if (agencyFitComponent >= 85) {
    // Elevatissima compatibilità acquirenti in pancia: la componente fit cresce di rilievo
    weightFit = 0.35;
    weightUrgency = 0.35;
    weightEconomic = 0.30;
  }

  const rawScore = Math.round(
    (urgencyScore * weightUrgency) +
    (economicElasticityScore * weightEconomic) +
    (agencyFitComponent * weightFit)
  );

  const actionScore = Math.min(99, Math.max(10, rawScore));

  let rationale = `Action Score: ${actionScore}/100. `;
  if (urgencyMultiplierApplied) {
    rationale += `Applicato boost esponenziale per mandato in scadenza (${mandateDaysRemaining}gg) e trend contatti negativo (${leadsTrend14d}%). `;
  }
  if (priceRatio > 1.10) {
    rationale += `Disallineamento economico significativo (+${Math.round((priceRatio - 1) * 100)}% su fair value). `;
  }
  if (agencyFitComponent >= 80) {
    rationale += `Alto potenziale di conversione su portafoglio acquirenti CRM (${agencyFitComponent}/100).`;
  }

  return {
    actionScore,
    isActionScoreAvailable: true,
    components: {
      urgencyScore,
      economicElasticityScore,
      agencyFitComponent
    },
    weights: {
      weightUrgency,
      weightEconomic,
      weightFit
    },
    urgencyMultiplierApplied,
    rationale
  };
}

// ----------------------------------------------------------------------------
// 4. BAYESIAN VECTOR INFERENCE ENGINE (Thesis §1)
// ----------------------------------------------------------------------------

export interface BayesianInferenceParams {
  eventType: 'ACCEPTED' | 'PARTIAL_PRICE_ADJUSTMENT' | 'ACTION_OVERRIDE' | 'IGNORED';
  appliedPrice: number;
  recommendedPrice: number;
  scenarioChosen?: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'CUSTOM_SLIDER';
  mandateDaysRemaining?: number;
  behavioralSignals: BehavioralSignal[];
  forcedCategory?: DecisionDivergenceCategory;
  subCategory?: string;
}

export interface BayesianInferenceResult {
  probabilityVector: MotivationProbabilityVector;
  primaryCategory: DecisionDivergenceCategory;
  subCategory: string;
  confidenceScore: number; // 0.0 - 1.0
  status: 'HYPOTHESIS' | 'CONSOLIDATED' | 'UNKNOWN';
  attributionRationale: string;
}

/**
 * Motore di Inferenza Bayesiana Vettoriale Dinamica.
 * 
 * Regola Baseline & Inerzia (Regola UNKNOWN):
 * - Se l'utente rilascia lo slider o non accetta lo Scenario A senza produrre ulteriori
 *   segnali comportamentali, la classe UNKNOWN DEVE rimanere dominante (P(UNKNOWN) >= 0.40)
 *   con status: 'HYPOTHESIS'.
 * - Vietato assegnare certezze aprioristiche (mai confidenza > 0.50 senza evidenze collaterali).
 * 
 * Aggiornamento Bayesiano asincrono tramite segnali successivi:
 * - DOWNLOAD_OWNER_REPORT entro 48h: P(EXTERNAL_CONSTRAINT) sale a >= 0.80, status: 'CONSOLIDATED'.
 * - OPEN_COMPARABLES_DRILLDOWN / REJECT_COMPARABLE: P(MODEL_DISAGREEMENT) sale a >= 0.75, status: 'CONSOLIDATED'.
 * - mandate.daysToExpiration < 30 senza azione sul prezzo: P(COMMERCIAL_TIMING) riceve un boost di +0.35.
 */
export function computeBayesianMotivationVector(params: BayesianInferenceParams): BayesianInferenceResult {
  const {
    eventType,
    appliedPrice,
    recommendedPrice,
    scenarioChosen,
    mandateDaysRemaining = 60,
    behavioralSignals,
    forcedCategory,
    subCategory
  } = params;

  // Se è forzata manualmente dall'operatore
  if (forcedCategory && forcedCategory !== 'UNKNOWN') {
    const vector: MotivationProbabilityVector = {
      EXTERNAL_CONSTRAINT: forcedCategory === 'EXTERNAL_CONSTRAINT' ? 0.88 : 0.02,
      MODEL_DISAGREEMENT: forcedCategory === 'MODEL_DISAGREEMENT' ? 0.88 : 0.02,
      COMMERCIAL_TIMING: forcedCategory === 'COMMERCIAL_TIMING' ? 0.88 : 0.02,
      STRATEGIC_PREFERENCE: forcedCategory === 'STRATEGIC_PREFERENCE' ? 0.88 : 0.02,
      INFORMATION_GAP: forcedCategory === 'INFORMATION_GAP' ? 0.88 : 0.02,
      UNKNOWN: 0.02
    };
    normalizeVector(vector);
    return {
      probabilityVector: vector,
      primaryCategory: forcedCategory,
      subCategory: subCategory || forcedCategory,
      confidenceScore: 0.88,
      status: 'CONSOLIDATED',
      attributionRationale: `Consenso esplicito impostato dall'operatore (${forcedCategory}).`
    };
  }

  // 1. Inizializzazione della Prior Distribution con Regola UNKNOWN dominante
  // In assenza di evidenze certe, UNKNOWN = 0.45 (>= 0.40) e nessuna classe supera 0.50
  let vector: MotivationProbabilityVector = {
    EXTERNAL_CONSTRAINT: 0.12,
    MODEL_DISAGREEMENT: 0.12,
    COMMERCIAL_TIMING: 0.12,
    STRATEGIC_PREFERENCE: 0.14,
    INFORMATION_GAP: 0.05,
    UNKNOWN: 0.45
  };

  let status: 'HYPOTHESIS' | 'CONSOLIDATED' | 'UNKNOWN' = 'HYPOTHESIS';
  let primarySubCategory = 'UNEXPLAINED_VARIANCE';
  let attributionRationale = 'Inerzia prioritaria: evidenze collaterali insufficienti. UNKNOWN dominante per evitare attribuzione aprioristica.';

  // 2. Segnali dell'azione osservata immediata
  if (eventType === 'ACCEPTED' && scenarioChosen === 'SCENARIO_A') {
    // Accettazione integrale raccomandazione: STRATEGIC_PREFERENCE orientata all'allineamento
    vector.STRATEGIC_PREFERENCE = 0.58;
    vector.UNKNOWN = 0.15;
    vector.EXTERNAL_CONSTRAINT = 0.08;
    vector.MODEL_DISAGREEMENT = 0.05;
    primarySubCategory = 'ALIGNED_WITH_MODEL';
    attributionRationale = 'Accettazione integrale della raccomandazione con coincidenza di obiettivi.';
  } else if (eventType === 'PARTIAL_PRICE_ADJUSTMENT' || scenarioChosen === 'SCENARIO_B') {
    // Parziale: suggerisce resistenza venditore o mediazione prudente
    vector.EXTERNAL_CONSTRAINT += 0.20;
    vector.UNKNOWN = Math.max(0.35, vector.UNKNOWN - 0.10);
    primarySubCategory = 'OWNER_CONSTRAINT_HYPOTHESIS';
  } else if (eventType === 'ACTION_OVERRIDE' || scenarioChosen === 'SCENARIO_C') {
    // Rigetto dell'azione proposta
    vector.MODEL_DISAGREEMENT += 0.15;
    vector.COMMERCIAL_TIMING += 0.10;
    vector.UNKNOWN = Math.max(0.38, vector.UNKNOWN - 0.07);
    primarySubCategory = 'OVERRIDE_UNDER_REVIEW';
  }

  // 3. Regola Bayesiana: Aggiornamento Asincrono tramite Segnali Comportamentali
  const hasOwnerReportDownload = behavioralSignals.some(s => s.signalType === 'DOWNLOAD_OWNER_REPORT');
  const hasComparablesInteraction = behavioralSignals.some(s => 
    s.signalType === 'OPEN_COMPARABLES_DRILLDOWN' || 
    s.signalType === 'REJECT_COMPARABLE' || 
    s.signalType === 'FILTER_COMPARABLES'
  );
  const hasCrmObjection = behavioralSignals.some(s => s.signalType === 'CRM_OBJECTION_LOGGED');

  if (hasOwnerReportDownload) {
    // Se l'agente ha scaricato il dossier proprietario: P(EXTERNAL_CONSTRAINT) >= 0.80
    vector.EXTERNAL_CONSTRAINT = 0.84;
    vector.UNKNOWN = 0.04;
    vector.MODEL_DISAGREEMENT = 0.04;
    vector.STRATEGIC_PREFERENCE = 0.04;
    vector.COMMERCIAL_TIMING = 0.02;
    vector.INFORMATION_GAP = 0.02;
    status = 'CONSOLIDATED';
    primarySubCategory = 'OWNER_CONSTRAINT';
    attributionRationale = 'Convalida Bayesiana: download del dossier proprietario per negoziare rigidità del mandante.';
  } else if (hasComparablesInteraction) {
    // Se l'agente interagisce con comparabili notarili / drilldown: P(MODEL_DISAGREEMENT) >= 0.75
    vector.MODEL_DISAGREEMENT = 0.78;
    vector.UNKNOWN = 0.06;
    vector.EXTERNAL_CONSTRAINT = 0.06;
    vector.STRATEGIC_PREFERENCE = 0.04;
    vector.COMMERCIAL_TIMING = 0.04;
    vector.INFORMATION_GAP = 0.02;
    status = 'CONSOLIDATED';
    primarySubCategory = 'PEER_GROUP_REJECTION';
    attributionRationale = 'Convalida Bayesiana: contestazione del peer group notarile rilevata tramite ispezione dei comparabili.';
  } else if (mandateDaysRemaining < 30 && appliedPrice >= recommendedPrice) {
    // Mandato in imminente decadenza (< 30gg) senza riduzione prezzo: boost P(COMMERCIAL_TIMING) +0.35
    vector.COMMERCIAL_TIMING += 0.35;
    vector.UNKNOWN = Math.max(0.20, vector.UNKNOWN - 0.25);
    primarySubCategory = 'PLANNED_DELAY';
    attributionRationale = 'Boost temporale: mandato in imminente scadenza (<30gg) senza allineamento prezzo.';
  } else if (hasCrmObjection) {
    vector.INFORMATION_GAP += 0.30;
    vector.UNKNOWN = Math.max(0.25, vector.UNKNOWN - 0.20);
    primarySubCategory = 'NEGOTIATION_INSIGHT';
  }

  // Normalizza il vettore per garantire sum(P(M)) = 1.00
  normalizeVector(vector);

  // Trova la categoria dominante
  let primaryCategory: DecisionDivergenceCategory = 'UNKNOWN';
  let maxP = -1;

  (Object.keys(vector) as DecisionDivergenceCategory[]).forEach(cat => {
    if (vector[cat] > maxP) {
      maxP = vector[cat];
      primaryCategory = cat;
    }
  });

  // Se UNKNOWN è dominante o confidenza <= 0.50, lo status è sempre HYPOTHESIS
  if (primaryCategory === 'UNKNOWN' || maxP <= 0.50) {
    status = 'HYPOTHESIS';
    if (primaryCategory === 'UNKNOWN') {
      primarySubCategory = 'UNEXPLAINED_VARIANCE';
    }
  }

  return {
    probabilityVector: vector,
    primaryCategory,
    subCategory: primarySubCategory,
    confidenceScore: Number(maxP.toFixed(2)),
    status,
    attributionRationale
  };
}

function normalizeVector(vector: MotivationProbabilityVector) {
  const sum = 
    vector.EXTERNAL_CONSTRAINT +
    vector.MODEL_DISAGREEMENT +
    vector.COMMERCIAL_TIMING +
    vector.STRATEGIC_PREFERENCE +
    vector.INFORMATION_GAP +
    vector.UNKNOWN;

  if (sum > 0) {
    vector.EXTERNAL_CONSTRAINT = Number((vector.EXTERNAL_CONSTRAINT / sum).toFixed(3));
    vector.MODEL_DISAGREEMENT = Number((vector.MODEL_DISAGREEMENT / sum).toFixed(3));
    vector.COMMERCIAL_TIMING = Number((vector.COMMERCIAL_TIMING / sum).toFixed(3));
    vector.STRATEGIC_PREFERENCE = Number((vector.STRATEGIC_PREFERENCE / sum).toFixed(3));
    vector.INFORMATION_GAP = Number((vector.INFORMATION_GAP / sum).toFixed(3));
    vector.UNKNOWN = Number((vector.UNKNOWN / sum).toFixed(3));
  }
}

// ----------------------------------------------------------------------------
// 5. CRM OPERATIVE EFFORT & ATTRIBUTION BIAS SEGREGATION (Thesis §4)
// ----------------------------------------------------------------------------

export interface OperativeEffortInput {
  leadResponseTimeHours?: number;    // ore medie riscontro contatti
  avgLeadResponseHours?: number;
  visitsCompleted?: number;          // visite effettivamente svolte
  conductedVisitsCount?: number;
  visitsRequested?: number;          // richieste appuntamento registrate
  requestedVisitsCount?: number;
  marketingSpendDelivered?: boolean; // rilancio campagne marketing
  marketingBudgetDeliveredEur?: number;
  marketingBudgetCommittedEur?: number;
}

/**
 * STEP 3: Calcolo normalizzato dell'Operative Effort CRM (Product Thesis v1.0)
 * Formula ponderata:
 * 1. Risposta lead: se <= 24h -> 1.0; se <= 48h -> 0.6; altrimenti 0.2 (peso 35%).
 * 2. Tasso completamento visite: min(1.0, condotte / max(1, richieste)) (peso 40%).
 * 3. Budget marketing: min(1.0, erogato / max(1, pattuito)) (peso 25%).
 * Classificazione: >= 0.70 -> 'HIGH_EFFORT'; tra 0.40 e 0.69 -> 'MODERATE_EFFORT'; < 0.40 -> 'LOW_INERTIA'.
 */
export function calculateOperativeEffort(
  metrics: Omit<OperativeEffortSnapshot, 'calculatedEffortScore' | 'effortClassification'> | OperativeEffortInput | any
): OperativeEffortSnapshot & {
  score: number;
  leadResponseScore: number;
  visitFulfillmentScore: number;
  marketingScore: number;
  metrics: OperativeEffortMetrics;
} {
  const avgLeadResponseHours = Number(
    metrics.avgLeadResponseHours ?? metrics.leadResponseTimeHours ?? 24
  );
  const conductedVisitsCount = Number(
    metrics.conductedVisitsCount ?? metrics.visitsCompleted ?? 0
  );
  const requestedVisitsCount = Number(
    metrics.requestedVisitsCount ?? metrics.visitsRequested ?? (conductedVisitsCount > 0 ? conductedVisitsCount : 1)
  );
  const marketingBudgetDeliveredEur = Number(
    metrics.marketingBudgetDeliveredEur ?? (metrics.marketingSpendDelivered ? 400 : 80)
  );
  const marketingBudgetCommittedEur = Math.max(
    1,
    Number(metrics.marketingBudgetCommittedEur ?? 500)
  );

  // 1. Risposta lead: <= 24h -> 1.0, <= 48h -> 0.6, altrimenti 0.2 (peso 35%)
  let leadResponseScore = 1.0;
  if (avgLeadResponseHours > 48) {
    leadResponseScore = 0.2;
  } else if (avgLeadResponseHours > 24) {
    leadResponseScore = 0.6;
  }

  // 2. Tasso completamento visite: min(1.0, condotte / max(1, richieste)) (peso 40%)
  const visitFulfillmentScore = Math.min(
    1.0,
    conductedVisitsCount / Math.max(1, requestedVisitsCount)
  );

  // 3. Budget marketing: min(1.0, erogato / max(1, pattuito)) (peso 25%)
  const marketingScore = Math.min(
    1.0,
    marketingBudgetDeliveredEur / marketingBudgetCommittedEur
  );

  // Ponderazione deterministica: 35% Lead + 40% Visite + 25% Marketing
  const rawScore = (leadResponseScore * 0.35) + (visitFulfillmentScore * 0.40) + (marketingScore * 0.25);
  const calculatedEffortScore = Number(rawScore.toFixed(2));

  // Classificazione categorica
  let effortClassification: 'HIGH_EFFORT' | 'MODERATE_EFFORT' | 'LOW_INERTIA';
  if (calculatedEffortScore >= 0.70) {
    effortClassification = 'HIGH_EFFORT';
  } else if (calculatedEffortScore >= 0.40) {
    effortClassification = 'MODERATE_EFFORT';
  } else {
    effortClassification = 'LOW_INERTIA';
  }

  const legacyMetrics: OperativeEffortMetrics = {
    leadResponseTimeHours: avgLeadResponseHours,
    visitsCompleted: conductedVisitsCount,
    visitsRequested: requestedVisitsCount,
    marketingSpendDelivered: marketingBudgetDeliveredEur >= marketingBudgetCommittedEur * 0.7,
    computedEffortScore: calculatedEffortScore
  };

  return {
    avgLeadResponseHours,
    conductedVisitsCount,
    requestedVisitsCount,
    marketingBudgetDeliveredEur,
    marketingBudgetCommittedEur,
    calculatedEffortScore,
    effortClassification,
    // Compatibilità legacy
    score: calculatedEffortScore,
    leadResponseScore,
    visitFulfillmentScore,
    marketingScore,
    metrics: legacyMetrics
  };
}

/**
 * STEP 3: Regola Anti-Bias di Attribuzione di Causalità (Product Thesis v1.0)
 * Segrega oggettivamente il World Model (regole di mercato territoriali)
 * dal Decision Model (frizioni e inerzia agenziale).
 */
export function reconcileFinalOutcome(params: {
  initialPriceRecommended: number;
  appliedPrice: number;
  finalOutcome: FinalMandateOutcome;
  finalSalePrice?: number;
  totalDom: number;
  effort: OperativeEffortSnapshot;
}): FinalOutcomeReconciliation['attribution'] {
  const { initialPriceRecommended, finalOutcome, finalSalePrice, effort } = params;
  const effortScore = effort.calculatedEffortScore;
  const isLost = finalOutcome === 'MANDATE_EXPIRED_LOST' || 
                 finalOutcome === 'SELLER_REVOKED_LOST' || 
                 finalOutcome === 'PRICE_WITHDRAWN';

  // Regola Anti-Bias 1: Inerzia Organizzativa -> Sterilizza World Model
  // Se l'immobile non si vende MA l'effort è < 0.40, la causa è operativa interna.
  if (isLost && effortScore < 0.40) {
    return {
      biasCategory: 'ORGANIZATIONAL_INERTIA_BIAS',
      worldModelSterilized: true,
      explanation: "L'invenduto è correlato a ritardi operativi e deficit promozionale. I pesi e le curve territoriali del World Model vengono sterilizzati per evitare distorsioni.",
      decisionModelUpdate: {
        agencyFrictionFlag: true,
        pricingElasticityAdjustment: 0.0
      }
    };
  }

  // Regola Anti-Bias 2: Ricalibrazione World Model
  // Se l'immobile non si vende NONOSTANTE un effort diligente (>= 0.70), il mercato ha rigettato il prezzo.
  if (isLost && effortScore >= 0.70) {
    return {
      biasCategory: 'WORLD_MODEL_RECALIBRATION',
      worldModelSterilized: false,
      explanation: "Il rigetto del prezzo è confermato a fronte di un adeguato sforzo commerciale. Le curve di elasticità e il Price Fit di microzona vengono aggiornati.",
      decisionModelUpdate: {
        agencyFrictionFlag: false,
        pricingElasticityAdjustment: -0.05
      }
    };
  }

  // Regola Anti-Bias 3: Human Expertise Surplus
  // Chiusura con rogito perfezionato a prezzo superiore alla raccomandazione AI (> +3%).
  if (finalOutcome === 'CLOSED_SALE_WON' && finalSalePrice && finalSalePrice > initialPriceRecommended * 1.03) {
    return {
      biasCategory: 'HUMAN_EXPERTISE_SURPLUS',
      worldModelSterilized: false,
      explanation: "La chiusura a premio rispetto alla stima AI evidenzia plusvalenze qualitative o negoziali non censite. Stimolo per l'arricchimento del feature store.",
      decisionModelUpdate: {
        agencyFrictionFlag: false,
        pricingElasticityAdjustment: 0.03
      }
    };
  }

  // Default: Esecuzione Allineata (Rogito standard o esito moderato)
  return {
    biasCategory: 'ALIGNED_EXECUTION',
    worldModelSterilized: false,
    explanation: "Esecuzione allineata: rogito perfezionato o esito di mercato congruente con lo sforzo operativo e i parametri attesi.",
    decisionModelUpdate: {
      agencyFrictionFlag: false,
      pricingElasticityAdjustment: 0.0
    }
  };
}

/**
 * Funzione di Riconciliazione Completa per il Rogito / Esito Finale
 */
export function computeFinalOutcomeReconciliation(params: {
  decisionId: string;
  propertyId: string;
  initialPriceRecommended: number;
  appliedPrice: number;
  finalOutcome: FinalMandateOutcome;
  finalSalePrice?: number;
  totalDom: number;
  effortMetrics: Omit<OperativeEffortSnapshot, 'calculatedEffortScore' | 'effortClassification'> | OperativeEffortInput | any;
}): FinalOutcomeReconciliation {
  const effort = calculateOperativeEffort(params.effortMetrics);
  const attribution = reconcileFinalOutcome({
    initialPriceRecommended: params.initialPriceRecommended,
    appliedPrice: params.appliedPrice,
    finalOutcome: params.finalOutcome,
    finalSalePrice: params.finalSalePrice,
    totalDom: params.totalDom,
    effort
  });

  const salePriceActual = params.finalSalePrice || (params.finalOutcome === 'CLOSED_SALE_WON' ? params.appliedPrice : undefined);
  const mandateRealizationRate = salePriceActual && params.initialPriceRecommended > 0
    ? Number((salePriceActual / params.initialPriceRecommended).toFixed(3))
    : 0;

  const deltaVsInitialPct = salePriceActual && params.initialPriceRecommended > 0
    ? Number((((salePriceActual - params.initialPriceRecommended) / params.initialPriceRecommended) * 100).toFixed(1))
    : undefined;

  return {
    decisionId: params.decisionId,
    propertyId: params.propertyId,
    outcomeType: params.finalOutcome,
    salePriceActual,
    deltaVsInitialRecommendationPct: deltaVsInitialPct,
    totalDaysOnMarket: params.totalDom,
    mandateRealizationRate,
    effort,
    attribution
  };
}

/**
 * Regola di Segregazione Legacy tra World Model e Decision Model.
 */
export function attributeOutcomeBias(
  operativeEffortScore: number,
  outcome: {
    closed: boolean;
    mandateOutcome?: 'COMPLETED' | 'EXPIRED' | 'REVOKED';
    offersReceived?: number;
  }
): {
  segregation: AttributionSegregation;
  worldModelSterilized: boolean;
  rationale: string;
} {
  if (outcome.closed || outcome.mandateOutcome === 'COMPLETED') {
    return {
      segregation: 'SUCCESS_CONFIRMED',
      worldModelSterilized: false,
      rationale: 'Rogito perfezionato con successo. Validazione empirica confermata su prezzo e liquidità.'
    };
  }

  // Esito Negativo o Scaduto
  if (operativeEffortScore < 0.40) {
    return {
      segregation: 'ORGANIZATIONAL_INERTIA_BIAS',
      worldModelSterilized: true,
      rationale: 'Inerzia Operativa Rilevata (Effort < 0.40): Mancato esito imputabile a riscontri lenti o visite non svolte. Aggiornamento World Model STERILIZZATO per prevenire distorsioni di stima.'
    };
  }

  if (operativeEffortScore >= 0.70) {
    return {
      segregation: 'WORLD_MODEL_RECALIBRATION',
      worldModelSterilized: false,
      rationale: 'Sforzo Operativo Diligente (Effort >= 0.70): L\'invenduto convalida il reale rigetto del mercato. Ricalibrazione autorizzata delle curve di elasticità e assorbimento territoriale.'
    };
  }

  return {
    segregation: 'BALANCED_ATTRIBUTION',
    worldModelSterilized: false,
    rationale: 'Effort operativo intermedio (0.40 - 0.70): Attribuzione bilanciata tra frizione commerciale e resistenza del compratore.'
  };
}

// ----------------------------------------------------------------------------
// 6. CORE EVALUATION PIPELINE WITH ENDOGENOUS CONFIDENCE & ACTION GATING
// ----------------------------------------------------------------------------

export function evaluateRealEstateDecision(
  property: PropertyData,
  market: MarketData | null
): EvaluationResult {
  const evaluatedAt = new Date().toISOString();

  // 1. Native Confidence Score & Degradation Audit
  const confidenceAudit = calculateConfidenceScore(property, market);
  const degradationPenalties: DegradationPenalty[] = confidenceAudit.penalties.map(p => ({
    signal_name: p.code,
    severity: p.penalty >= 20 ? 'CRITICAL' : p.penalty >= 15 ? 'MODERATE' : 'LOW',
    points_deducted: p.penalty,
    reason: p.reason,
    fallback_strategy: p.fallbackStrategy
  }));

  const finalConfidence = confidenceAudit.score;
  const isDegraded = confidenceAudit.isDegraded;
  const confidenceLevel = confidenceAudit.confidenceLevel;

  // 2. Pillars Calculation
  const intrinsicScore = calculateIntrinsicScore(property);

  let marketMomentumScore = 50;
  if (market && market.demand_intensity_index !== null && market.demand_intensity_index !== undefined) {
    marketMomentumScore = market.demand_intensity_index;
    if (market.price_trend_yoy_pct) {
      marketMomentumScore += market.price_trend_yoy_pct * 2;
    }
  }
  marketMomentumScore = Math.max(10, Math.min(100, Math.round(marketMomentumScore)));

  const askingPriceSqm = property.asking_price / Math.max(1, property.square_meters);
  let benchmarkPriceSqm = 3000;
  if (market && market.avg_price_sqm) {
    benchmarkPriceSqm = market.avg_price_sqm;
  } else if (market && market.median_price_sqm) {
    benchmarkPriceSqm = market.median_price_sqm;
  }

  const priceRatio = askingPriceSqm / benchmarkPriceSqm;
  let priceCompetitivenessScore = 50;
  if (priceRatio <= 0.80) priceCompetitivenessScore = 95;
  else if (priceRatio <= 0.92) priceCompetitivenessScore = 85;
  else if (priceRatio <= 1.02) priceCompetitivenessScore = 70;
  else if (priceRatio <= 1.15) priceCompetitivenessScore = 48;
  else if (priceRatio <= 1.30) priceCompetitivenessScore = 30;
  else priceCompetitivenessScore = 15;

  let liquidityScore = 50;
  if (market && market.monthly_absorption_rate !== null && market.monthly_absorption_rate !== undefined) {
    liquidityScore = Math.min(100, Math.round(market.monthly_absorption_rate * 3.5));
  } else if (market && market.median_days_on_market) {
    if (market.median_days_on_market < 60) liquidityScore = 90;
    else if (market.median_days_on_market < 100) liquidityScore = 75;
    else if (market.median_days_on_market < 150) liquidityScore = 55;
    else liquidityScore = 30;
  }

  // Overall Real Estate Rating (World Model)
  const rawOverallRating = 
    (intrinsicScore * PILLAR_WEIGHTS.INTRINSIC_QUALITY) +
    (marketMomentumScore * PILLAR_WEIGHTS.MARKET_MOMENTUM) +
    (priceCompetitivenessScore * PILLAR_WEIGHTS.PRICE_COMPETITIVENESS) +
    (liquidityScore * PILLAR_WEIGHTS.LIQUIDITY_SPEED);

  const overallRating = Math.max(10, Math.min(99, Math.round(rawOverallRating)));

  // Target Price Corridor
  const qualityMultiplier = 0.80 + (intrinsicScore / 100) * 0.40;
  const fairValueSqm = benchmarkPriceSqm * qualityMultiplier;
  let targetTotalFairValue = fairValueSqm * property.square_meters;

  if (property.conservation_state === 'NEEDS_RENOVATION') {
    const renovationCapex = property.estimated_renovation_cost && property.estimated_renovation_cost > 0
      ? property.estimated_renovation_cost
      : property.square_meters * 650;
    targetTotalFairValue -= (renovationCapex * 0.75);
  }

  const corridorSpreadPct = finalConfidence < 60 ? 0.08 : 0.04;
  const suggestedTargetPrice = Math.round(targetTotalFairValue / 1000) * 1000;
  const suggestedMinPrice = Math.round((targetTotalFairValue * (1 - corridorSpreadPct)) / 1000) * 1000;
  const suggestedMaxPrice = Math.round((targetTotalFairValue * (1 + corridorSpreadPct)) / 1000) * 1000;

  const discountRecommendedPct = property.asking_price > suggestedTargetPrice
    ? Math.round(((property.asking_price - suggestedTargetPrice) / property.asking_price) * 100 * 10) / 10
    : 0;

  // Recommended Action
  let recommendedAction: RecommendedAction = 'ACQUIRE_STANDARD';
  let actionHeadline = 'Acquisizione Standard a Prezzo Equo';
  let executiveSummary = '';

  if (!confidenceAudit.isActionScoreAvailable) {
    actionHeadline = 'Prescrizione Non Disponibile';
    executiveSummary = confidenceAudit.actionScoreUnavailableReason || 'Dati insufficienti per erogare prescrizioni decisionali ad alta confidenza.';
    recommendedAction = 'REJECT_UNFAVORABLE';
  } else if (overallRating >= 80 && finalConfidence >= 60) {
    recommendedAction = 'ACQUIRE_PRIORITY';
    actionHeadline = 'Acquisire con Priorità Alta (Top Deal)';
    executiveSummary = `Immobile con eccellente appeal intrinseco (${intrinsicScore}/100) e dinamica di domanda solida nella microzona ${property.micro_zone}. Margine di trattativa favorevole con assorbimento stimato rapido.`;
  } else if (overallRating >= 65) {
    recommendedAction = 'ACQUIRE_STANDARD';
    actionHeadline = 'Acquisizione Raccomandata a Valore di Stima';
    executiveSummary = `Asset congruo alle aspettative della microzona. Il prezzo richiesto (€${property.asking_price.toLocaleString('it-IT')}) è vicino al benchmark; si consiglia chiusura nell'intervallo €${suggestedMinPrice.toLocaleString('it-IT')} - €${suggestedMaxPrice.toLocaleString('it-IT')}.`;
  } else if (overallRating >= 48 || discountRecommendedPct >= 10) {
    recommendedAction = 'RENEGOTIATE_PRICE';
    actionHeadline = 'Rinegoziazione Prezzo Necessaria prima del Mandato';
    executiveSummary = `L'immobile presenta potenziale, ma il prezzo di richiesta supera il valore intrinseco di circa il ${discountRecommendedPct}%. Si raccomanda di proporre al proprietario un ribasso a quota €${suggestedTargetPrice.toLocaleString('it-IT')} per evitare tempi di giacenza eccessivi.`;
  } else {
    recommendedAction = 'REJECT_UNFAVORABLE';
    actionHeadline = 'Scartare / Basso Rendimento Atteso';
    executiveSummary = `Rapporto rischio/rendimento sfavorevole. Combinazione di quotazione fuori target e deficit strutturali o liquidità di quartiere depressa. Rischio elevato di svalutazione in inventario.`;
  }

  // Target Buyer Profiles
  const targetBuyers: BuyerProfile[] = matchTargetBuyerProfiles(property, overallRating, intrinsicScore);

  // Risk Factors
  const riskFactors: string[] = [];
  if (property.floor >= 3 && !property.has_elevator) {
    riskFactors.push('Piano alto sprovvisto di ascensore: target acquirenti limitato e svalutazione commerciale.');
  }
  if (property.energy_class === 'G' || property.energy_class === 'F') {
    riskFactors.push('Direttiva Case Green (EPBD): rischio di svalutazione o obbligo di riqualificazione energetica.');
  }
  if (isDegraded) {
    riskFactors.push(`Dati di mercato parziali (Confidence: ${finalConfidence}%): applicata degradazione prudenziale sul prezzo massimo.`);
  }
  if (discountRecommendedPct > 15) {
    riskFactors.push(`Disallineamento prezzo richiesto (+${discountRecommendedPct}%): alta probabilità di obiezione da parte del venditore.`);
  }

  return {
    property_id: property.id,
    evaluated_at: evaluatedAt,
    model_version: MODEL_VERSION,
    overall_rating: overallRating,
    confidence_score: finalConfidence,
    confidence_level: confidenceLevel,
    is_degraded: isDegraded,
    degradation_penalties: degradationPenalties,
    sub_scores: {
      intrinsic_quality: intrinsicScore,
      market_momentum: marketMomentumScore,
      price_competitiveness: priceCompetitivenessScore,
      liquidity_speed: liquidityScore,
    },
    valuation: {
      asking_price: property.asking_price,
      asking_price_sqm: Math.round(askingPriceSqm),
      benchmark_price_sqm: Math.round(benchmarkPriceSqm),
      suggested_target_price: suggestedTargetPrice,
      suggested_min_price: suggestedMinPrice,
      suggested_max_price: suggestedMaxPrice,
      discount_recommended_pct: discountRecommendedPct,
    },
    recommended_action: recommendedAction,
    action_headline: actionHeadline,
    executive_summary: executiveSummary,
    target_buyers: targetBuyers,
    risk_factors: riskFactors,
  };
}

// ----------------------------------------------------------------------------
// 7. TARGET BUYER PROFILING LOGIC
// ----------------------------------------------------------------------------

export function matchTargetBuyerProfiles(
  property: PropertyData | PropertyItem, 
  rating: number, 
  intrinsicScore: number
): BuyerProfile[] {
  const fields = extractPropertyCoreFields(property);
  const profiles: BuyerProfile[] = [];

  // Profile 1: Buy-to-Let Investor
  if (fields.squareMeters <= 65 || fields.rooms <= 2) {
    const yieldEstimated = fields.askingPrice > 0 ? ((fields.squareMeters * 22 * 12) / fields.askingPrice) * 100 : 5.0;
    profiles.push({
      id: 'investor_yield',
      name: 'Investitore da Rendita (Buy-to-Let)',
      category: 'BUY_TO_LET_INVESTOR',
      match_score: Math.min(96, Math.max(60, Math.round(75 + (yieldEstimated - 5) * 8))),
      rationale: `Taglio compatto ad alta locabilità. Rendimento lordo atteso stimato al ${yieldEstimated.toFixed(1)}% annuo con locazione transitoria o studentesca.`,
      avg_budget_eur: fields.askingPrice * 1.05,
    });
  }

  // Profile 2: Family Upgrader
  if (fields.rooms >= 3 && fields.squareMeters >= 75) {
    let familyScore = 70;
    if (fields.hasElevator) familyScore += 15;
    profiles.push({
      id: 'family_upgrader',
      name: 'Famiglia in Crescita (Upgrader)',
      category: 'FAMILY_UPGRADER',
      match_score: Math.min(98, familyScore),
      rationale: `Metratura comoda (${fields.squareMeters} mq, ${fields.rooms} locali)${fields.hasElevator ? ' con ascensore' : ''} ideale per nucleo familiare primario.`,
      avg_budget_eur: fields.askingPrice * 1.08,
    });
  }

  // Profile 3: Young Couple / First-Time Buyer
  if (fields.askingPrice <= 350000 && fields.rooms >= 2) {
    profiles.push({
      id: 'first_time_buyer',
      name: 'Giovane Coppia / Primo Acquisto',
      category: 'FIRST_TIME_BUYER',
      match_score: 82,
      rationale: 'Fascia di prezzo accessibile a mutuo under 36; layout razionale con bassi costi di gestione condominiale.',
      avg_budget_eur: 320000,
    });
  }

  // Profile 4: Flipper / Value-Add Contractor
  const consState = String(fields.conservationState || '').toUpperCase();
  if (consState === 'NEEDS_RENOVATION' || consState === 'NEEDS RENOVATION' || intrinsicScore < 45) {
    profiles.push({
      id: 'property_flipper',
      name: 'Imprenditore Edile / Flipper (Value-Add)',
      category: 'FLIPPER',
      match_score: 91,
      rationale: 'Forte leva di rivalutazione tramite ristrutturazione integrale ed efficientamento energetico (passaggio a Classe A/B).',
      avg_budget_eur: fields.askingPrice * 0.90,
    });
  }

  return profiles.sort((a, b) => b.match_score - a.match_score).slice(0, 3);
}

// ----------------------------------------------------------------------------
// 8. SUPABASE PERSISTENCE HELPER
// ----------------------------------------------------------------------------

export async function logAgentDecisionToSupabase(
  supabaseClient: any,
  evaluation: EvaluationResult,
  agentFeedback: {
    agent_id: string;
    agent_name: string;
    agent_decision: AgentDecisionOutcome;
    agent_final_price?: number;
    rejection_category?: RejectionCategory;
    agent_feedback_notes?: string;
  }
): Promise<{ success: boolean; data?: DecisionLogEntry; error?: string }> {
  const logPayload = {
    property_id: evaluation.property_id,
    agent_id: agentFeedback.agent_id,
    agent_name: agentFeedback.agent_name,
    model_version: evaluation.model_version,
    evaluated_at: evaluation.evaluated_at,
    
    // System Snapshots
    system_rating: evaluation.overall_rating,
    system_confidence: evaluation.confidence_score,
    system_recommended_action: evaluation.recommended_action,
    system_suggested_price: evaluation.valuation.suggested_target_price,
    system_suggested_min_price: evaluation.valuation.suggested_min_price,
    system_suggested_max_price: evaluation.valuation.suggested_max_price,
    
    sub_score_intrinsic: evaluation.sub_scores.intrinsic_quality,
    sub_score_market_momentum: evaluation.sub_scores.market_momentum,
    sub_score_price_competitiveness: evaluation.sub_scores.price_competitiveness,
    sub_score_liquidity: evaluation.sub_scores.liquidity_speed,
    
    system_degraded: evaluation.is_degraded,
    missing_signals: evaluation.degradation_penalties,
    target_buyer_profiles: evaluation.target_buyers,
    
    // Agent Loop
    agent_decision: agentFeedback.agent_decision,
    agent_final_price: agentFeedback.agent_final_price || null,
    rejection_category: agentFeedback.rejection_category || null,
    agent_feedback_notes: agentFeedback.agent_feedback_notes || null,
    decided_at: new Date().toISOString(),
  };

  if (supabaseClient && typeof supabaseClient.from === 'function') {
    try {
      const { data, error } = await supabaseClient
        .from('decision_log')
        .insert(logPayload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database insert failed' };
    }
  }

  return {
    success: true,
    data: {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      ...logPayload,
      system_missing_signals: evaluation.degradation_penalties.map((p) => p.signal_name),
      agent_action_taken: agentFeedback.agent_decision,
      delta_price_pct: agentFeedback.agent_final_price 
        ? Math.round(((agentFeedback.agent_final_price - evaluation.valuation.suggested_target_price) / evaluation.valuation.suggested_target_price) * 100 * 10) / 10 
        : null,
      created_at: new Date().toISOString()
    }
  };
}

// ----------------------------------------------------------------------------
// STEP 2: 14–21 DAY CHECKPOINT — SHORT-TERM PROXY RECONCILIATION ENGINE
// ----------------------------------------------------------------------------

/**
 * Reconciles Day 0 predictions against Day 14-21 empirical proxy outcomes:
 * 1. Computes Market Response Index (MRI, 0-100) combining visits (40%),
 *    portal leads delta (35%), and price sentiment feedback (25%),
 *    with a -30 points net penalty if sentiment is EXCESSIVE.
 * 2. Determines empirical trajectory:
 *    - MRI >= 65: REACTIVE_CONVERGING (+0.15 bayesian confidence delta)
 *    - 40 <= MRI < 65: NEUTRAL_MONITORING (0.0 bayesian confidence delta)
 *    - MRI < 40: STAGNATION_REJECTED (-0.25 bayesian confidence delta, alert triggered)
 * 3. Formulates strategic prescriptions for immediate broker action.
 */
export function reconcileProxyOutcomes(
  predicted: { leadsDeltaPct: number; visits: number; expectedFeedback?: string },
  observed: ProxyMetricsSnapshot,
  decisionId?: string
): ProxyReconciliationResult {
  // 1. Calculate Market Response Index (MRI, 0-100)
  // Component 1: Visits Performance (Weight 40%)
  const expectedVisits = Math.max(1, predicted.visits);
  const visitsRatio = observed.scheduledVisits / expectedVisits;
  const visitsScore = Math.min(100, Math.max(0, visitsRatio * 100));

  // Component 2: Leads Delta Performance (Weight 35%)
  // Normalized comparison against predicted delta percentage
  const deltaDiff = observed.leadsDeltaPct - predicted.leadsDeltaPct;
  const leadsScore = Math.min(100, Math.max(0, 60 + deltaDiff * 1.5 + (observed.leadsCount > 0 ? 10 : -20)));

  // Component 3: Price Sentiment from Field Visits (Weight 25%)
  let sentimentScore = 50;
  if (observed.marketPriceSentiment === 'COMPETITIVE') {
    sentimentScore = 100;
  } else if (observed.marketPriceSentiment === 'FAIR') {
    sentimentScore = 80;
  } else if (observed.marketPriceSentiment === 'EXCESSIVE') {
    sentimentScore = 0;
  }

  // Weighted raw index
  let rawMri = (visitsScore * 0.40) + (leadsScore * 0.35) + (sentimentScore * 0.25);

  // Net penalty rule: If observed.marketPriceSentiment === 'EXCESSIVE', apply net penalty of -30 points
  if (observed.marketPriceSentiment === 'EXCESSIVE') {
    rawMri -= 30;
  }

  const marketResponseIndex = Math.min(100, Math.max(0, Math.round(rawMri)));

  // 2. Bayesian Confidence Delta & Strategic Categorization
  let status: 'REACTIVE_CONVERGING' | 'NEUTRAL_MONITORING' | 'STAGNATION_REJECTED';
  let bayesianConfidenceDelta: number;
  let strategicPrescription: {
    alertRequired: boolean;
    headline: string;
    recommendedAction: 'MAINTAIN_CURRENT_STRATEGY' | 'TRIGGER_OPPORTUNITY_TRIAGE' | 'ESCALATE_TO_SCENARIO_A';
    rationale: string;
  };

  if (marketResponseIndex >= 65) {
    status = 'REACTIVE_CONVERGING';
    bayesianConfidenceDelta = 0.15;
    strategicPrescription = {
      alertRequired: false,
      headline: 'Traiettoria Validata: Risposta di Mercato Reattiva',
      recommendedAction: 'MAINTAIN_CURRENT_STRATEGY',
      rationale: `L'allineamento delle visite (${observed.scheduledVisits} su ${expectedVisits} previste) e il sentiment favorevole (${observed.marketPriceSentiment}) convalidano l'assorbimento verso il target rogito 60-90gg. Mantenere l'assetto corrente.`
    };
  } else if (marketResponseIndex >= 40) {
    status = 'NEUTRAL_MONITORING';
    bayesianConfidenceDelta = 0.0;
    strategicPrescription = {
      alertRequired: false,
      headline: 'Risposta Moderata: Monitoraggio Attivo Finestra T+21',
      recommendedAction: 'MAINTAIN_CURRENT_STRATEGY',
      rationale: `Metriche intermedie stabili (MRI: ${marketResponseIndex}/100). Incrementare la visibilità portali e verificare le reazioni nelle prossime 72 ore.`
    };
  } else {
    status = 'STAGNATION_REJECTED';
    bayesianConfidenceDelta = -0.25;
    strategicPrescription = {
      alertRequired: true,
      headline: 'Mancata Risposta del Mercato a 14gg (Stagnazione Rilevata)',
      recommendedAction: 'ESCALATE_TO_SCENARIO_A',
      rationale: `Mancata Risposta del Mercato a 14gg: L'adeguamento parziale non ha sbloccato le visite (${observed.scheduledVisits} visite, sentiment ${observed.marketPriceSentiment}). Consigliata escalation immediata allo Scenario A (riposizionamento completo al fair value).`
    };
  }

  const predictedLeadsCount = Math.max(1, Math.round(5 * (1 + predicted.leadsDeltaPct / 100)));

  return {
    decisionId: decisionId || `rec_${Date.now()}`,
    marketResponseIndex,
    status,
    predictedVsObserved: {
      predictedLeads: predictedLeadsCount,
      observedLeads: observed.leadsCount,
      leadsDeltaPct: observed.leadsDeltaPct,
      predictedVisits: expectedVisits,
      observedVisits: observed.scheduledVisits
    },
    bayesianConfidenceDelta,
    strategicPrescription
  };
}

// ----------------------------------------------------------------------------
// PUBLIC DATA INGESTION INFRASTRUCTURE (World Model Baseline a costo zero)
// Connettori reali OpenStreetMap Overpass, Agenzia delle Entrate OMI, BCE/Banca d'Italia
// ----------------------------------------------------------------------------

export interface EnrichedPropertyEvaluation {
  property: PropertyItem;
  externalDataPackage: ExternalMarketDataPackage;
  recalculatedDimensions: {
    locationScore: number;
    priceFitScore: number;
    macroScore: number;
    riskScore: number;
  };
  recalculatedRealEstateRating: number;
  adjustedTimeToSaleDays: number;
  dataCompletenessScore: number;
  mcaResult: McaEvaluationResult;
  demographics?: MunicipalityDemographics;
  environmentalRisk?: EnvironmentalRiskProfile;
  territory?: ResolvedTerritory;
  omiBand?: OmiBandData;
}

/**
 * Coordina i connettori di dati in tempo reale e il Motore Comparabili MCA (Strada C):
 * 1. Risoluzione Territoriale Unificata (territorialResolver - Zero Mock §29)
 * 2. Client OMI Dinamico & Funzionale (omiClient - bande reali territoriali isolate)
 * 3. OpenStreetMap Overpass API (Location & POI Quality - w1 = 0.20)
 * 4. BCE & Banca d'Italia (Macro & Liquidity / Time - w7 = 0.08)
 * 5. ISTAT SDMX Demografia Live (DCIS_POPRES1) con Graceful Degradation (§28)
 * 6. ISPRA IdroGEO & Protezione Civile (Asset Risk Index Pilastro 4 - w4 = 0.15)
 * 7. Market Comparison Approach (MCA) con Bivio Deterministico edonico.
 */
export async function enrichPropertyWithRealWorldData(
  property: PropertyItem
): Promise<EnrichedPropertyEvaluation> {
  const lat = property.coordinates?.lat ?? 41.9028;
  const lon = property.coordinates?.lng ?? 12.4964;
  const askingPrice = property.askingPrice;
  const surfaceMq = property.squareMeters;

  // 1. Risoluzione Territoriale Dinamica & Isolata (chiave Belfiore, nome comune, coordinate OSM)
  const territory = resolveTerritory({
    belfioreCode: property.cadastralData?.cityCode,
    municipalityName: property.city,
    lat,
    lon
  });

  // 2. Estrazione Dinamica delle Bande OMI (Provincia -> Belfiore -> Microzone)
  const omiBand = getOmiBandsForProperty(
    territory,
    property.cadastralData?.cadastralCategory || 'A/2',
    property.microZone
  );

  // 3. Invocazione concorrente dei connettori con territorio verificato
  const lookupTerritoryKey = territory.belfioreCode !== 'Z000' ? territory.belfioreCode : territory.municipalityName;
  const [locationPois, macroCredit, mcaResult, demographics, environmentalRisk] = await Promise.all([
    fetchOsmLocationPois(lat, lon),
    Promise.resolve(getMacroCreditContext()),
    Promise.resolve(evaluateSubjectWithMca(property)),
    getMunicipalityDemographics(lookupTerritoryKey),
    getEnvironmentalRisk(lat, lon, lookupTerritoryKey)
  ]);

  // 4. Calcolo Price Fit e Fair Value con Fallback OMI Dinamico
  // Se MCA ha rilevato campione valido (>= 3 rogiti), usiamo il Fair Value MCA edonico.
  // In assenza di rogiti notarili (<3 entro 600m), usa rigorosamente:
  // valoreCongruoBase = property.surfaceMq * omiData.medianEurMq con rettifiche marginali.
  const economicsPillar = calculateEconomicsPillarScores(
    property,
    territory,
    omiBand,
    mcaResult.status === 'MCA_SAMPLE_VALID' ? mcaResult.mcaFairValueCentral : undefined
  );

  const estimatedFairValue = economicsPillar.fairValue;
  const priceFitScore = economicsPillar.economicsScore;
  const priceDifferencePct = economicsPillar.priceDifferencePct;

  const omiQuotation: OmiZoneQuotation = {
    comuneIstat: territory.istatCode,
    zonaOmi: omiBand.microzoneCode,
    fasciaDescrizione: omiBand.isFallbackMunicipal ? 'Centrale' : 'Centrale',
    statoConservativo: property.conservationState === 'Excellent' ? 'OTTIMO' : property.conservationState === 'Needs Renovation' ? 'SCADENTE' : 'NORMALE',
    compravenditaMinEurMq: omiBand.minEurMq,
    compravenditaMaxEurMq: omiBand.maxEurMq,
    locazioneMinEurMq: omiBand.rentMinEurMq,
    locazioneMaxEurMq: omiBand.rentMaxEurMq,
    annoRiferimento: 2026,
    semestreRiferimento: 1
  };

  // 5. Punteggi pilastri normalizzati e integrazione demografica + rischio territoriale
  const locationScore = locationPois.locationScoreNormalized; // 0 - 100
  const baseMacroScore = macroCredit.creditAvailabilityIndex; // 0 - 100
  
  // Impatto Pilastro 7 (Macro/Time) & Pilastro 2 (Location / Densità) da ISTAT
  const demoPillar = calculateDemographicPillarScores(demographics, baseMacroScore, locationScore);
  const macroScore = demoPillar.macroScore;

  // Impatto Pilastro 4 (Asset Risk Index) da ISPRA IdroGEO & Protezione Civile
  const riskPillar = calculateEnvironmentalRiskPillarScores(
    environmentalRisk,
    property.cadastralData?.assetRiskIndex,
    property.cadastralData?.urbanCompliance
  );
  const riskScore = riskPillar.riskScore;

  // 6. Calcolo Confidenza e Penalità Deterministica (§28 Graceful Degradation)
  let baseConfidence = property.ratingConfidence || 85;
  if (mcaResult.status === 'MCA_SAMPLE_VALID') {
    baseConfidence = Math.min(100, baseConfidence + 5); // Bonus dati empirici puntuali
  } else {
    baseConfidence = Math.max(10, baseConfidence - mcaResult.confidencePenaltyApplied); // -25 pt
  }
  // Penalità specifica se fallback provinciale ISPRA (-5 pt) o boost se audit catastale validato (+8%)
  baseConfidence = Math.min(100, Math.max(10, baseConfidence + riskPillar.confidencePenaltyOrBonus));

  // Se comune non censito o ignoto: dimezza confidenza analitica (§28 Graceful Degradation)
  if (territory.isUncensored) {
    baseConfidence = Math.max(10, Math.round(baseConfidence * 0.5));
  }

  const recalculatedConfidence = baseConfidence;
  const isActionScoreAvailable = recalculatedConfidence >= 50;
  const actionScoreUnavailableReason = isActionScoreAvailable 
    ? undefined 
    : territory.isUncensored
    ? 'Prescrizione decisionale bloccata (Product Thesis §28): comune non censito o contesto territoriale non verificato. Confidenza analitica dimezzata (< 50%).'
    : 'Prescrizione decisionale bloccata (Product Thesis §28): confidenza analitica insufficiente (< 50%) dovuta all\'assenza di transazioni notarili comparabili nel raggio di 600m.';

  // 7. Data Completeness Score (include ISTAT SDMX & ISPRA IdroGEO)
  let completeness = 40;
  if (locationPois.nearestSubwayDistanceMeters !== null) completeness += 10;
  if (omiQuotation) completeness += 10;
  if (macroCredit) completeness += 10;
  if (mcaResult.comparablesFoundCount >= 3) completeness += 10;
  if (demographics.totalPopulation > 0) completeness += 10;
  if (environmentalRisk.overallRiskIndex > 0) completeness += 10;
  const dataCompletenessScore = Math.min(100, completeness);

  // 8. Creazione pacchetto dati esterno aggregato
  const externalDataPackage: ExternalMarketDataPackage = {
    propertyCoordinates: { lat, lon },
    omi: omiQuotation,
    locationPois,
    macroCredit,
    mca: mcaResult,
    demographics,
    environmentalRisk,
    territory,
    omiBand,
    dataCompletenessScore
  };

  // 9. Ricalcolo assi e rating complessivo preservando l'architettura a 7 dimensioni
  const updatedDimensions = (property.dimensions || []).map(dim => {
    if (dim.key === 'location') {
      return {
        ...dim,
        score: locationScore,
        subDimensions: dim.subDimensions.map(sub => {
          if (sub.id === 'sub_loc_2') return { ...sub, score: locationScore, evidenceCount: locationPois.subwayStationsCount500m + locationPois.busStopsCount350m };
          if (sub.id === 'sub_loc_3') return { ...sub, score: locationPois.calculatedWalkabilityIndex, evidenceCount: locationPois.schoolsCount500m + locationPois.pharmaciesCount500m + locationPois.supermarketsCount500m };
          if (sub.id === 'sub_loc_4') return { ...sub, score: demoPillar.urbanDensityScore, summary: `Densità demografica ISTAT: ${demographics.densityPerKm2.toLocaleString()} ab/km² (${demographics.municipalityName}).` };
          return sub;
        })
      };
    }
    if (dim.key === 'economics') {
      return {
        ...dim,
        score: priceFitScore,
        subDimensions: dim.subDimensions.map(sub => {
          if (sub.id === 'sub_econ_1') return { 
            ...sub, 
            score: priceFitScore, 
            evidenceCount: mcaResult.comparablesFoundCount,
            summary: economicsPillar.isMcaApplied
              ? `Motore MCA Edonico: Valore congruo €${estimatedFairValue.toLocaleString()} (${mcaResult.comparablesFoundCount} rogiti nel raggio di 600m)`
              : `Bande OMI ${omiBand.microzoneCode} (${territory.municipalityName}): €${omiBand.minEurMq.toLocaleString()} - €${omiBand.maxEurMq.toLocaleString()}/m² (${omiBand.microzoneDescription})`
          };
          if (sub.id === 'sub_econ_2') return { 
            ...sub, 
            score: priceFitScore, 
            evidenceCount: mcaResult.comparablesFoundCount,
            summary: `Scostamento prezzo richiesto (€${Math.round(askingPrice / surfaceMq).toLocaleString()}/m²) vs congruo: ${priceDifferencePct > 0 ? `+${priceDifferencePct}%` : `${priceDifferencePct}%`}`
          };
          if (sub.id === 'sub_econ_3') return { ...sub, score: priceFitScore, evidenceCount: mcaResult.comparablesFoundCount };
          return sub;
        })
      };
    }
    if (dim.key === 'risk') {
      return {
        ...dim,
        score: riskScore,
        subDimensions: dim.subDimensions.map(sub => {
          if (sub.id === 'sub_risk_1') {
            return {
              ...sub,
              score: riskPillar.floodScore,
              summary: environmentalRisk.floodRiskLevel === 'NONE'
                ? 'ISPRA IdroGEO / Direttiva Alluvioni: Pericolosità idraulica P0 (Assente)'
                : `ISPRA IdroGEO: Pericolosità idraulica livello ${environmentalRisk.floodRiskLevel}`,
              evidenceCount: 15
            };
          }
          if (sub.id === 'sub_risk_2') {
            return {
              ...sub,
              score: riskPillar.seismicScore,
              summary: `Protezione Civile: ${environmentalRisk.seismicZoneLabel || `Zona Sismica ${environmentalRisk.seismicZone}`}`,
              evidenceCount: 12
            };
          }
          if (sub.id === 'sub_risk_3') {
            return {
              ...sub,
              score: riskPillar.landslideScore,
              summary: environmentalRisk.landslideRiskLevel === 'NONE'
                ? 'ISPRA IdroGEO PAI: Rischio geomorfologico e dissesto versanti assente'
                : `ISPRA IdroGEO PAI: Pericolo frana livello ${environmentalRisk.landslideRiskLevel}`,
              evidenceCount: 10
            };
          }
          return sub;
        })
      };
    }
    if (dim.key === 'macro') {
      return {
        ...dim,
        score: macroScore,
        subDimensions: dim.subDimensions.map(sub => {
          if (sub.id === 'sub_macro_1') return { ...sub, score: macroScore };
          if (sub.id === 'sub_macro_2') return { ...sub, score: macroScore };
          if (sub.id === 'sub_macro_4') {
            return {
              ...sub,
              score: demoPillar.demographicTrendScore,
              summary: `ISTAT SDMX: Indice Vecchiaia ${demographics.agingIndex} • Quota Giovani Famiglie ${Math.round(demographics.youngFamiliesRatio * 100)}% • Pop. ${demographics.totalPopulation.toLocaleString()} ab.`
            };
          }
          return sub;
        })
      };
    }
    return dim;
  });

  // Pesi del rating a 7 assi:
  // Location: 0.20, Property: 0.18, Environment: 0.12, Risk: 0.14, Market: 0.16, Economics: 0.12, Macro: 0.08
  let calculatedRating = 0;
  for (const dim of updatedDimensions) {
    calculatedRating += dim.score * dim.weight;
  }
  const recalculatedRealEstateRating = Math.min(100, Math.max(10, Math.round(calculatedRating)));

  // Applicazione liquidityDiscountFactor ai Days on Market (DOM)
  const baseTimeToSale = property.estimatedTimeToSaleDays || 90;
  const adjustedTimeToSaleDays = Math.max(20, Math.round(baseTimeToSale / macroCredit.liquidityDiscountFactor));

  // Ponderazione Agency Fit tramite quota giovani famiglie
  const updatedAgencyFit = reweightAgencyFitWithDemographics(property.agencyFit, demographics);

  // Immobile aggiornato con i dati reali del World Model
  const updatedProperty: PropertyItem = {
    ...property,
    realEstateRating: recalculatedRealEstateRating,
    ratingConfidence: recalculatedConfidence,
    ratingConfidenceLevel: recalculatedConfidence >= 75 ? 'HIGH' : recalculatedConfidence >= 50 ? 'MEDIUM' : 'LOW',
    isActionScoreAvailable,
    actionScoreUnavailableReason,
    estimatedFairValue,
    priceDifferencePct,
    estimatedTimeToSaleDays: adjustedTimeToSaleDays,
    dimensions: updatedDimensions,
    mcaEvaluation: mcaResult,
    locationPois,
    agencyFit: updatedAgencyFit,
    demographics,
    environmentalRisk,
    resolvedTerritory: territory,
    omiBand,
    isDegraded: mcaResult.status === 'FALLBACK_OMI_DEGRADED' || territory.isUncensored,
    degradationNote: territory.isUncensored
      ? 'Contesto territoriale non censito: confidenza dimezzata e stime parametriche di fallback applicate (§28).'
      : mcaResult.status === 'FALLBACK_OMI_DEGRADED' ? mcaResult.appliedRationale : undefined
  };

  return {
    property: updatedProperty,
    externalDataPackage,
    recalculatedDimensions: {
      locationScore,
      priceFitScore,
      macroScore,
      riskScore
    },
    recalculatedRealEstateRating,
    adjustedTimeToSaleDays,
    dataCompletenessScore,
    mcaResult,
    demographics,
    environmentalRisk,
    territory,
    omiBand
  };
}

