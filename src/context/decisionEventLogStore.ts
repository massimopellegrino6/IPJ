import { FormalDecisionLogEvent } from '../types/intelligence';
import { MOCK_FORMAL_DECISION_LOGS } from '../data/mockIntelligenceDatabase';

/**
 * Evento Deliberato Congruo MCA per Via Nomentana 221 (Scenario A)
 * Specifiche REDIP:
 * - event_id: evt_nomentana_mca_2026
 * - property_title: "Via Nomentana 221 — Roma"
 * - applied_price: 484000
 * - decision_type: "ACCEPTED_RECOMMENDATION (Scenario A MCA)"
 * - target_dom: 48
 * - confidence: 90
 */
export const NOMENTANA_MCA_ACCEPTED_EVENT: FormalDecisionLogEvent = {
  event_id: 'evt_nomentana_mca_2026',
  timestamp: new Date().toISOString(),
  property_title: 'Via Nomentana 221 — Roma',
  applied_price: 484000,
  decision_type: 'ACCEPTED_RECOMMENDATION (Scenario A MCA)',
  target_dom: 48,
  confidence: 90,
  decision_context: {
    property_id: 'prop_rm_nomentana_221',
    property_title: 'Via Nomentana 221 — Roma',
    agent_id: 'agent_m_rossi',
    agent_name: 'Marco Rossi (Responsabile Acquisizioni)',
    agency_id: 'branch_roma_nord_01',
    objective: 'MAX_LIQUIDITY_60D',
    mandate_days_remaining: 84
  },
  rating_snapshot: {
    real_estate_rating: 81,
    agency_fit_score: 94,
    confidence: 0.90,
    dimensions: { price_fit: 82, demand: 89, liquidity: 84, location: 88 }
  },
  recommendation_issued: {
    action_type: 'TARGETED_CLIENT_MATCHING',
    current_price: 460000,
    recommended_price: 484000,
    action_score: 88,
    predicted_probability_60d: 0.78,
    expected_time_to_sale_days: 48
  },
  observed_human_decision: {
    event_type: 'ACCEPTED_RECOMMENDATION',
    applied_price: 484000,
    delta_vs_recommendation: 0,
    slider_release_point: 484000
  },
  behavioral_signals_48h: [
    { signal: 'ACCEPTED_SCENARIO_A_MCA_FAIR_VALUE', timestamp: new Date().toISOString(), intensity: 'HIGH' },
    { signal: 'DISPATCH_DOSSIER_23_PROFILED_BUYERS', timestamp: new Date().toISOString(), duration_seconds: 45, intensity: 'HIGH' },
    { signal: 'PROXY_CHECKPOINT_CONFIRMED', timestamp: new Date().toISOString(), intensity: 'HIGH' }
  ],
  inferred_motivation: {
    primary_category: 'STRATEGIC_PREFERENCE',
    sub_category: 'ALIGNED_WITH_MODEL',
    confidence_score: 0.90,
    status: 'CONSOLIDATED',
    probability_distribution: {
      STRATEGIC_PREFERENCE: 0.85,
      EXTERNAL_CONSTRAINT: 0.05,
      COMMERCIAL_TIMING: 0.04,
      INFORMATION_GAP: 0.03,
      MODEL_DISAGREEMENT: 0.02,
      UNKNOWN: 0.01
    },
    bayesianUpdatesCount: 4
  },
  operational_effort: {
    avgLeadContactTimeHours: 1.2,
    listingFreshnessDays: 1,
    adSpendAllocatedEuros: 550,
    scheduledVisitsCompletedRatio: 1.0,
    isAttributedToOperationalInertia: false,
    attributionReason: 'Allineamento al Valore Congruo MCA (€484.000) e matching proattivo su 23 acquirenti CRM.'
  },
  outcome_tracking: {
    short_term_proxies: {
      windowDays: 14,
      views_delta_pct: '+58%',
      leads_delta_14d: '+28%',
      visits_scheduled_14d: 4,
      offers_received_14d: 1,
      price_feedback_alignment: 'FAVORABLE',
      immediateWeightUpdateApplied: true
    },
    final_outcome: {
      closed: false,
      sale_price: 484000,
      days_on_market_total: 48,
      mandate_outcome: 'COMPLETED',
      price_delta_vs_ai_pct: 0.0,
      time_delta_vs_ai_days: 0
    }
  },
  learning_segregation: {
    world_model_impact: 'Metodologia MCA IVS validata: matching congruo a €484.000 (+5.2%) con assorbimento accelerato nel corridoio Trieste/Nomentana.',
    decision_model_impact: 'Piena convergenza tra raccomandazione algoritmica Scenario A e delibera operatore. Traiettoria confermata al checkpoint T+14.',
    anti_bias_applied: true
  }
};

// Costruisci il log iniziale formale assicurando che l'evento deliberato più recente sia sempre in cima (indice 0)
export function getInitialFormalDecisionLogs(): FormalDecisionLogEvent[] {
  const otherLogs = MOCK_FORMAL_DECISION_LOGS.filter(l => l.event_id !== 'evt_nomentana_mca_2026');
  return [NOMENTANA_MCA_ACCEPTED_EVENT, ...otherLogs];
}

export { useDecisionStore as useDecisionEventLogStore } from './DecisionStoreContext';

