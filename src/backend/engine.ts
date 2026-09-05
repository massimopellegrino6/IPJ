/**
 * ============================================================================
 * PROPTECH DECISION INTELLIGENCE PLATFORM - RATING & CONFIDENCE ENGINE
 * ============================================================================
 * 
 * Architectural Objectives:
 * 1. "Graceful Degradation": The engine never breaks when market data is missing,
 *    sparse, or delayed. Missing signals invoke deterministic fallback heuristics
 *    and deduct from the confidence score, explicitly logging degradation penalties.
 * 2. "Data Capture by Design": Every computation yields an immutable audit trail
 *    ready for Supabase `decision_log` ingestion.
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

// ----------------------------------------------------------------------------
// Architectural Constants & Weights
// ----------------------------------------------------------------------------

const MODEL_VERSION = 'prototype-v0.1';

/**
 * Weights assigned to the 4 pillars of the dynamic rating score.
 * Sum = 1.0 (100%)
 */
const PILLAR_WEIGHTS = {
  INTRINSIC_QUALITY: 0.35,      // Qualità fisica, impiantistica e layout
  MARKET_MOMENTUM: 0.25,        // Tensione della domanda e assorbimento microzona
  PRICE_COMPETITIVENESS: 0.25,  // Rapporto prezzo richiesto vs benchmark reale
  LIQUIDITY_SPEED: 0.15,        // Facilità di smobilizzo / giorni stimati sul mercato
};

/**
 * Penalty deductions for the Confidence Score (100 baseline).
 */
const CONFIDENCE_PENALTIES = {
  MISSING_COMPARABLES: 25,         // Assenza comparabili diretti nel raggio di 500m
  INSUFFICIENT_COMPARABLES: 15,    // Meno di 3 comparabili validi
  MISSING_DEMAND_INDEX: 20,        // Mancanza indice intensità domanda
  MISSING_ABSORPTION_RATE: 15,     // Mancanza tasso di assorbimento mensile
  MISSING_DAYS_ON_MARKET: 10,      // Mancanza giorni mediani di giacenza
  OUTDATED_MARKET_DATA: 10,        // Dati di mercato più vecchi di 90 giorni
  INCOMPLETE_ENERGY_CLASS: 10,     // Classe energetica non periziata
  MISSING_RENOVATION_COST: 8,      // Mancata stima capex per immobili da ristrutturare
};

// ----------------------------------------------------------------------------
// 1. HELPER: INTRINSIC QUALITY SCORING (0 - 100)
// Evaluates the physical and technical merits of the property.
// ----------------------------------------------------------------------------

export function calculateIntrinsicScore(property: PropertyData): number {
  let score = 50; // Neutral baseline

  // 1. Conservation State (30 pts)
  switch (property.conservation_state) {
    case 'EXCELLENT':
      score += 25;
      break;
    case 'GOOD':
      score += 15;
      break;
    case 'HABITABLE':
      score += 5;
      break;
    case 'NEEDS_RENOVATION':
      score -= 15;
      // Mitigation: if renovation cost is accounted for, soften penalty
      if (property.estimated_renovation_cost && property.estimated_renovation_cost > 0) {
        score += 5;
      }
      break;
    case 'UNDER_CONSTRUCTION':
      score += 10;
      break;
  }

  // 2. Energy Class (25 pts)
  if (property.energy_class) {
    switch (property.energy_class) {
      case 'A4':
      case 'A3':
      case 'A2':
      case 'A1':
        score += 20;
        break;
      case 'B':
      case 'C':
        score += 10;
        break;
      case 'D':
      case 'E':
        score += 0;
        break;
      case 'F':
      case 'G':
        score -= 10;
        break;
    }
  }

  // 3. Floor & Accessibility (20 pts)
  if (property.floor === 0) {
    score -= 5; // Piano terra discount
  } else if (property.floor >= 3) {
    if (property.has_elevator) {
      score += 10; // Piano alto con ascensore (luminosità, silenziosità)
    } else {
      score -= 20; // Grave penalità: piano alto senza ascensore (bassa commerciabilità)
    }
  } else {
    // 1st or 2nd floor
    score += property.has_elevator ? 5 : 0;
  }

  // 4. Premium Amenities (15 pts)
  if (property.has_balcony_or_terrace) score += 8;
  if (property.has_parking_space) score += 7;
  if (property.has_cellar) score += 3;

  // 5. Layout efficiency (ratio sqm / rooms)
  const sqmPerRoom = property.square_meters / Math.max(1, property.rooms);
  if (sqmPerRoom >= 22 && sqmPerRoom <= 45) {
    score += 5; // Taglio razionale
  }

  return Math.min(100, Math.max(10, Math.round(score)));
}

// ----------------------------------------------------------------------------
// 2. CORE EVALUATION ENGINE WITH GRACEFUL DEGRADATION
// ----------------------------------------------------------------------------

/**
 * Computes Dynamic Real Estate Rating & Confidence Score.
 * Handles missing market indicators via deterministic fallback heuristics.
 */
export function evaluateRealEstateDecision(
  property: PropertyData,
  market: MarketData | null
): EvaluationResult {
  const evaluatedAt = new Date().toISOString();
  const degradationPenalties: DegradationPenalty[] = [];
  let confidence = 100;

  // --------------------------------------------------------------------------
  // Step 1: Data Completeness & Degradation Audit
  // --------------------------------------------------------------------------

  // Check property technical data
  if (!property.energy_class) {
    confidence -= CONFIDENCE_PENALTIES.INCOMPLETE_ENERGY_CLASS;
    degradationPenalties.push({
      signal_name: 'energy_class',
      severity: 'LOW',
      points_deducted: CONFIDENCE_PENALTIES.INCOMPLETE_ENERGY_CLASS,
      reason: 'Attestato di Prestazione Energetica (APE) non comunicato.',
      fallback_strategy: 'Assunta classe media convenzionale (Classe E/F).',
    });
  }

  if (property.conservation_state === 'NEEDS_RENOVATION' && (!property.estimated_renovation_cost || property.estimated_renovation_cost <= 0)) {
    confidence -= CONFIDENCE_PENALTIES.MISSING_RENOVATION_COST;
    degradationPenalties.push({
      signal_name: 'estimated_renovation_cost',
      severity: 'MODERATE',
      points_deducted: CONFIDENCE_PENALTIES.MISSING_RENOVATION_COST,
      reason: 'Immobile da ristrutturare privo di computo metrico stimato.',
      fallback_strategy: 'Applicata stima parametrica di capex (€650/mq).',
    });
  }

  // Check market indicators
  if (!market) {
    // Total Market Data absence
    confidence -= 55;
    degradationPenalties.push({
      signal_name: 'market_data_complete_absence',
      severity: 'CRITICAL',
      points_deducted: 55,
      reason: 'Nessun record di mercato disponibile per la microzona specificata.',
      fallback_strategy: 'Fallback su valori medi regionali con margine di sicurezza prudenziale del 15%.',
    });
  } else {
    // 1. Comparables check
    if (!market.comparables_count || market.comparables_count === 0) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_COMPARABLES;
      degradationPenalties.push({
        signal_name: 'comparables_count',
        severity: 'CRITICAL',
        points_deducted: CONFIDENCE_PENALTIES.MISSING_COMPARABLES,
        reason: 'Nessuna compravendita comparabile recente (< 6 mesi) nella microzona.',
        fallback_strategy: 'Calcolo basato su quotazioni medie storiche di quartiere anziché transato puntuale.',
      });
    } else if (market.comparables_count < 3) {
      confidence -= CONFIDENCE_PENALTIES.INSUFFICIENT_COMPARABLES;
      degradationPenalties.push({
        signal_name: 'comparables_count_low',
        severity: 'MODERATE',
        points_deducted: CONFIDENCE_PENALTIES.INSUFFICIENT_COMPARABLES,
        reason: `Campione di comparabili ristretto (${market.comparables_count} immobili). Rischio di bias statistico.`,
        fallback_strategy: 'Allargamento del corridoio di stima a +/- 8%.',
      });
    }

    // 2. Demand Intensity Index check
    if (market.demand_intensity_index === null || market.demand_intensity_index === undefined) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_DEMAND_INDEX;
      degradationPenalties.push({
        signal_name: 'demand_intensity_index',
        severity: 'MODERATE',
        points_deducted: CONFIDENCE_PENALTIES.MISSING_DEMAND_INDEX,
        reason: 'Indice di pressione della domanda non calcolato per la zona.',
        fallback_strategy: 'Assunto indice neutrale di mercato pari a 50/100.',
      });
    }

    // 3. Monthly Absorption Rate check
    if (market.monthly_absorption_rate === null || market.monthly_absorption_rate === undefined) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_ABSORPTION_RATE;
      degradationPenalties.push({
        signal_name: 'monthly_absorption_rate',
        severity: 'MODERATE',
        points_deducted: CONFIDENCE_PENALTIES.MISSING_ABSORPTION_RATE,
        reason: 'Tasso di assorbimento dell offerta invenduta non pervenuto.',
        fallback_strategy: 'Stima derivata dalla media metropolitana ponderata.',
      });
    }

    // 4. Days on Market check
    if (market.median_days_on_market === null || market.median_days_on_market === undefined) {
      confidence -= CONFIDENCE_PENALTIES.MISSING_DAYS_ON_MARKET;
      degradationPenalties.push({
        signal_name: 'median_days_on_market',
        severity: 'LOW',
        points_deducted: CONFIDENCE_PENALTIES.MISSING_DAYS_ON_MARKET,
        reason: 'Tempo mediano di vendita (DOM) non disponibile.',
        fallback_strategy: 'Adottato benchmark cittadino standard (120 giorni).',
      });
    }

    // 5. Freshness check
    if (market.data_freshness_days && market.data_freshness_days > 90) {
      confidence -= CONFIDENCE_PENALTIES.OUTDATED_MARKET_DATA;
      degradationPenalties.push({
        signal_name: 'data_freshness_days',
        severity: 'LOW',
        points_deducted: CONFIDENCE_PENALTIES.OUTDATED_MARKET_DATA,
        reason: `Dati di mercato aggiornati a ${market.data_freshness_days} giorni fa (> 90 gg).`,
        fallback_strategy: 'Applicato fattore di decadimento temporale.',
      });
    }
  }

  // Bounded confidence score
  const finalConfidence = Math.max(15, Math.min(100, Math.round(confidence)));
  const isDegraded = degradationPenalties.length > 0;

  let confidenceLevel: EvaluationResult['confidence_level'] = 'HIGH';
  if (finalConfidence < 45) confidenceLevel = 'INSUFFICIENT';
  else if (finalConfidence < 70) confidenceLevel = 'LOW';
  else if (finalConfidence < 85) confidenceLevel = 'MEDIUM';

  // --------------------------------------------------------------------------
  // Step 2: Scoring Pillars Calculation with Graceful Degradation
  // --------------------------------------------------------------------------

  // Pillar A: Intrinsic Quality (35%)
  const intrinsicScore = calculateIntrinsicScore(property);

  // Pillar B: Market Momentum (25%)
  let marketMomentumScore = 50; // Fallback default
  if (market && market.demand_intensity_index !== null && market.demand_intensity_index !== undefined) {
    marketMomentumScore = market.demand_intensity_index;
    if (market.price_trend_yoy_pct) {
      marketMomentumScore += market.price_trend_yoy_pct * 2; // e.g. +3% trend adds 6 pts
    }
  }
  marketMomentumScore = Math.max(10, Math.min(100, Math.round(marketMomentumScore)));

  // Pillar C: Price Competitiveness (25%)
  const askingPriceSqm = property.asking_price / Math.max(1, property.square_meters);
  let benchmarkPriceSqm = 3000; // Fallback safe average if nothing provided

  if (market && market.avg_price_sqm) {
    benchmarkPriceSqm = market.avg_price_sqm;
  } else if (market && market.median_price_sqm) {
    benchmarkPriceSqm = market.median_price_sqm;
  }

  // Ratio asking / benchmark
  // If asking is 10% below benchmark -> ratio 0.90 -> great score (e.g. 85-90)
  // If asking is 20% above benchmark -> ratio 1.20 -> poor score (e.g. 30-40)
  const priceRatio = askingPriceSqm / benchmarkPriceSqm;
  let priceCompetitivenessScore = 50;

  if (priceRatio <= 0.80) {
    priceCompetitivenessScore = 95; // Super discount
  } else if (priceRatio <= 0.92) {
    priceCompetitivenessScore = 85;
  } else if (priceRatio <= 1.02) {
    priceCompetitivenessScore = 70; // In linea con il mercato
  } else if (priceRatio <= 1.15) {
    priceCompetitivenessScore = 48; // Leggermente caro
  } else if (priceRatio <= 1.30) {
    priceCompetitivenessScore = 30; // Fuori mercato
  } else {
    priceCompetitivenessScore = 15; // Fortemente fuori mercato
  }

  // Pillar D: Liquidity & Absorption Speed (15%)
  let liquidityScore = 50; // Fallback
  if (market && market.monthly_absorption_rate !== null && market.monthly_absorption_rate !== undefined) {
    // 25%+ is very high turnover -> 90 pts; 5% is stagnant -> 25 pts
    liquidityScore = Math.min(100, Math.round(market.monthly_absorption_rate * 3.5));
  } else if (market && market.median_days_on_market) {
    if (market.median_days_on_market < 60) liquidityScore = 90;
    else if (market.median_days_on_market < 100) liquidityScore = 75;
    else if (market.median_days_on_market < 150) liquidityScore = 55;
    else liquidityScore = 30;
  }

  // --------------------------------------------------------------------------
  // Step 3: Overall Real Estate Rating (0 - 100)
  // --------------------------------------------------------------------------

  const rawOverallRating = 
    (intrinsicScore * PILLAR_WEIGHTS.INTRINSIC_QUALITY) +
    (marketMomentumScore * PILLAR_WEIGHTS.MARKET_MOMENTUM) +
    (priceCompetitivenessScore * PILLAR_WEIGHTS.PRICE_COMPETITIVENESS) +
    (liquidityScore * PILLAR_WEIGHTS.LIQUIDITY_SPEED);

  const overallRating = Math.max(10, Math.min(99, Math.round(rawOverallRating)));

  // --------------------------------------------------------------------------
  // Step 4: Suggested Target Price & Valuation Corridor
  // --------------------------------------------------------------------------

  // Adjust benchmark price with intrinsic score multiplier (e.g. 0.85 to 1.15)
  const qualityMultiplier = 0.80 + (intrinsicScore / 100) * 0.40; // Range: 0.80 to 1.20
  const fairValueSqm = benchmarkPriceSqm * qualityMultiplier;
  
  let targetTotalFairValue = fairValueSqm * property.square_meters;
  
  // Deduct estimated renovation cost if applicable
  if (property.conservation_state === 'NEEDS_RENOVATION') {
    const renovationCapex = property.estimated_renovation_cost && property.estimated_renovation_cost > 0
      ? property.estimated_renovation_cost
      : property.square_meters * 650; // Fallback €650/mq
    targetTotalFairValue -= (renovationCapex * 0.75); // Property seller typically absorbs 75% of capex in price
  }

  // Corridor width expands when confidence is degraded (risk management)
  const corridorSpreadPct = finalConfidence < 60 ? 0.08 : 0.04;
  const suggestedTargetPrice = Math.round(targetTotalFairValue / 1000) * 1000;
  const suggestedMinPrice = Math.round((targetTotalFairValue * (1 - corridorSpreadPct)) / 1000) * 1000;
  const suggestedMaxPrice = Math.round((targetTotalFairValue * (1 + corridorSpreadPct)) / 1000) * 1000;

  const discountRecommendedPct = property.asking_price > suggestedTargetPrice
    ? Math.round(((property.asking_price - suggestedTargetPrice) / property.asking_price) * 100 * 10) / 10
    : 0;

  // --------------------------------------------------------------------------
  // Step 5: Recommended Action & Target Buyers Matching
  // --------------------------------------------------------------------------

  let recommendedAction: RecommendedAction = 'ACQUIRE_STANDARD';
  let actionHeadline = 'Acquisizione Standard a Prezzo Equo';
  let executiveSummary = '';

  if (overallRating >= 80 && finalConfidence >= 60) {
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

  // Target Buyer Personas
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
// 3. TARGET BUYER PROFILING LOGIC ("A chi proporre")
// ----------------------------------------------------------------------------

function matchTargetBuyerProfiles(
  property: PropertyData, 
  rating: number, 
  intrinsicScore: number
): BuyerProfile[] {
  const profiles: BuyerProfile[] = [];

  // Profile 1: Buy-to-Let Investor (Bilocali, Monolocali, zone universitarie o metro)
  if (property.square_meters <= 65 || property.rooms <= 2) {
    const yieldEstimated = property.asking_price > 0 ? ((property.square_meters * 22 * 12) / property.asking_price) * 100 : 5.0;
    profiles.push({
      id: 'investor_yield',
      name: 'Investitore da Rendita (Buy-to-Let)',
      category: 'BUY_TO_LET_INVESTOR',
      match_score: Math.min(96, Math.max(60, Math.round(75 + (yieldEstimated - 5) * 8))),
      rationale: `Taglio compatto ad alta locabilità. Rendimento lordo atteso stimato al ${yieldEstimated.toFixed(1)}% annuo con locazione transitoria o studentesca.`,
      avg_budget_eur: property.asking_price * 1.05,
    });
  }

  // Profile 2: Family Upgrader (3+ locali, ascensore, balcone)
  if (property.rooms >= 3 && property.square_meters >= 75) {
    let familyScore = 70;
    if (property.has_elevator) familyScore += 15;
    if (property.has_balcony_or_terrace) familyScore += 10;
    if (property.has_parking_space) familyScore += 5;
    profiles.push({
      id: 'family_upgrader',
      name: 'Famiglia in Crescita (Upgrader)',
      category: 'FAMILY_UPGRADER',
      match_score: Math.min(98, familyScore),
      rationale: `Metratura comoda (${property.square_meters} mq, ${property.rooms} locali)${property.has_elevator ? ' con ascensore' : ''} e sfogo esterno, ideale per nucleo familiare primario.`,
      avg_budget_eur: property.asking_price * 1.08,
    });
  }

  // Profile 3: Young Couple / First-Time Buyer
  if (property.asking_price <= 350000 && property.rooms >= 2) {
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
  if (property.conservation_state === 'NEEDS_RENOVATION' || intrinsicScore < 45) {
    profiles.push({
      id: 'property_flipper',
      name: 'Imprenditore Edile / Flipper (Value-Add)',
      category: 'FLIPPER',
      match_score: 91,
      rationale: 'Forte leva di rivalutazione tramite ristrutturazione integrale ed efficientamento energetico (passaggio a Classe A/B).',
      avg_budget_eur: property.asking_price * 0.90,
    });
  }

  return profiles.sort((a, b) => b.match_score - a.match_score).slice(0, 3);
}

// ----------------------------------------------------------------------------
// 4. SUPABASE PERSISTENCE HELPER ("Data Capture by Design")
// Ready to be tested inside Node.js API or Supabase Edge Functions.
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

  // If supabase client is active, execute real insert
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

  // Standalone PoC fallback simulation
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
