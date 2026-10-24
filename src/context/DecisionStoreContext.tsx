import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  DecisionEventLog, 
  BehavioralSignalType, 
  DecisionDivergenceCategory,
  DecisionTrackingStatus,
  DecisionLifecycleStatus,
  ProxyOutcomeEvaluationStatus,
  ProxyMetricsSnapshot,
  ProxyReconciliationResult,
  OperativeEffortMetrics,
  AttributionSegregation,
  MotivationProbabilityVector,
  FinalMandateOutcome,
  OperativeEffortSnapshot,
  FinalOutcomeReconciliation
} from '../types/decision';
import { PropertyItem, FormalDecisionLogEvent } from '../types/intelligence';
import { 
  computeBayesianMotivationVector, 
  calculateActionScore, 
  calculateOperativeEffort, 
  attributeOutcomeBias,
  reconcileProxyOutcomes,
  reconcileFinalOutcome,
  computeFinalOutcomeReconciliation,
  OperativeEffortInput
} from '../backend/engine';
import { PROPERTIES_DATABASE } from '../data/mockIntelligenceDatabase';
import { jsPDF } from 'jspdf';
import { generateOwnerDossierPdf } from '../utils/pdfExport';
import { evaluateSubjectWithMca } from '../backend/comparablesClient';
import { McaEvaluationResult } from '../types/comparables';
import { ProxyMetricsInput, MarketResponseIndexResult } from '../types/proxyTracking';
import { getInitialFormalDecisionLogs, NOMENTANA_MCA_ACCEPTED_EVENT } from './decisionEventLogStore';

interface DecisionStoreContextType {
  decisionLogs: DecisionEventLog[];
  formalDecisionLogs: FormalDecisionLogEvent[];
  setFormalDecisionLogs: React.Dispatch<React.SetStateAction<FormalDecisionLogEvent[]>>;
  recordDecision: (params: {
    property: PropertyItem;
    eventType: 'ACCEPTED' | 'PARTIAL_PRICE_ADJUSTMENT' | 'ACTION_OVERRIDE' | 'IGNORED';
    appliedPrice: number;
    scenarioChosen?: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'CUSTOM_SLIDER';
    forcedCategory?: DecisionDivergenceCategory;
    subCategory?: string;
  }) => DecisionEventLog;
  emitSignal: (propertyId: string, signalType: BehavioralSignalType, metadata?: Record<string, any>) => void;
  confirmProxyCheckpoint: (
    propertyId: string,
    proxyInput: ProxyMetricsInput,
    mriResult: MarketResponseIndexResult
  ) => void;
  updateMotivation: (
    propertyId: string,
    category: DecisionDivergenceCategory,
    subCategory?: string,
    confidenceScore?: number,
    status?: 'HYPOTHESIS' | 'CONSOLIDATED'
  ) => void;
  evaluateProxyOutcomes: (
    eventId: string,
    actualMetrics: {
      actualLeads14d: number;
      actualVisits14d: number;
      priceFeedbackSummary: 'LOW' | 'FAIR' | 'EXCESSIVE';
      ctrPortalsDelta14d?: string;
    }
  ) => void;
  fastForwardDecisionTime: (
    propertyId: string,
    targetDays?: 14 | 21,
    preset?: 'REACTIVE' | 'STAGNATION' | 'CUSTOM',
    customData?: ProxyMetricsSnapshot
  ) => ProxyReconciliationResult | undefined;
  submitManualProxyData: (
    propertyId: string,
    metrics: ProxyMetricsSnapshot
  ) => ProxyReconciliationResult | undefined;
  evaluateFinalOutcome: (
    eventId: string,
    outcome: {
      closed: boolean;
      salePrice?: number;
      daysOnMarketTotal?: number;
      mandateOutcome?: 'COMPLETED' | 'EXPIRED' | 'REVOKED';
      operativeEffortData?: OperativeEffortInput;
    }
  ) => void;
  finalizeDecisionOutcome: (
    propertyId: string,
    outcomeData: {
      outcomeType: FinalMandateOutcome;
      finalPrice?: number;
      totalDom?: number;
      effortMetrics: Omit<OperativeEffortSnapshot, 'calculatedEffortScore' | 'effortClassification'> | OperativeEffortInput | any;
    }
  ) => FinalOutcomeReconciliation | undefined;
  fastForwardToFinalOutcome: (
    propertyId: string,
    preset: 'SUCCESSFUL_SALE' | 'EXPIRED_INERTIA' | 'EXPIRED_MARKET_REJECT'
  ) => FinalOutcomeReconciliation | undefined;
  downloadOwnerReport: (
    property: PropertyItem,
    mcaEvaluation?: McaEvaluationResult,
    activeChoiceScenario?: { targetPrice: number; label: string }
  ) => void;
  getLogsForProperty: (propertyId: string) => DecisionEventLog[];
  getLatestLogForProperty: (propertyId: string) => DecisionEventLog | undefined;
  activeReviewProperty: PropertyItem | null;
  openProxyReviewModal: (propertyOrId: PropertyItem | string) => void;
  closeProxyReviewModal: () => void;
  activeFinalOutcomeProperty: PropertyItem | null;
  openFinalOutcomeModal: (propertyOrId: PropertyItem | string) => void;
  closeFinalOutcomeModal: () => void;
}

const INITIAL_LOGS: DecisionEventLog[] = [
  {
    eventId: 'del_log_001',
    timestamp: '2026-09-14 11:24',
    status: 'PROXY_EVALUATED',
    lifecycleStatus: 'PROXY_VALIDATED',
    decisionContext: {
      propertyId: 'prop_rm_roma_18',
      propertyTitle: 'Via Roma 18 — Prati, Roma',
      agentId: 'agent_m_rossi',
      agencyId: 'agency_prati_prime',
      objective: 'MAX_LIQUIDITY_60D',
      mandateDaysRemaining: 48
    },
    ratingSnapshot: {
      realEstateRating: 69,
      agencyFitScore: 84,
      confidenceScore: 89,
      dimensions: { Property: 72, Location: 88, Market: 61, Economics: 65 }
    },
    recommendationIssued: {
      actionType: 'PRICE_REDUCTION',
      currentPrice: 420000,
      recommendedPrice: 380000,
      actionScore: 88,
      predictedProbability60d: 84,
      isActionScoreAvailable: true,
      predictedLeadsDeltaPct: 35,
      predictedVisits14d: 4,
      expectedFeedback: 'FAIR'
    },
    observedHumanDecision: {
      eventType: 'PARTIAL_PRICE_ADJUSTMENT',
      appliedPrice: 395000,
      deltaVsRecommendation: 15000,
      scenarioChosen: 'SCENARIO_B'
    },
    behavioralSignals: [
      {
        signalType: 'DOWNLOAD_OWNER_REPORT',
        timestamp: '2026-09-14 11:20',
        metadata: { source: 'TrojanHorseButton', context: 'OwnerMeetingPrep' }
      },
      {
        signalType: 'SLIDER_TOLERANCE_TEST',
        timestamp: '2026-09-14 11:22',
        metadata: { testedMin: 385000, testedMax: 410000, dwellTimeSec: 14 }
      }
    ],
    inferredMotivation: {
      primaryCategory: 'EXTERNAL_CONSTRAINT',
      subCategory: 'OWNER_CONSTRAINT',
      confidenceScore: 0.88,
      status: 'CONSOLIDATED',
      probabilityVector: {
        EXTERNAL_CONSTRAINT: 0.84,
        MODEL_DISAGREEMENT: 0.04,
        COMMERCIAL_TIMING: 0.03,
        STRATEGIC_PREFERENCE: 0.03,
        INFORMATION_GAP: 0.02,
        UNKNOWN: 0.04
      },
      attributionRationale: 'Download del dossier proprietario: conferma empirica di negoziazione con venditore rigido.'
    },
    outcomeTracking: {
      proxyStatus: 'PROXY_CONFIRMED',
      shortTermProxies: {
        targetLeads14d: 6,
        actualLeads14d: 9,
        leadsDelta14d: '+38%',
        visitsScheduled14d: 4,
        actualVisits14d: 4,
        priceFeedbackSummary: 'FAIR',
        ctrPortalsDelta14d: '+32%',
        isPositive: true,
        evaluatedAt: '2026-09-18 10:00'
      }
    }
  },
  {
    eventId: 'del_log_002',
    timestamp: '2026-09-10 16:45',
    status: 'CLOSED',
    lifecycleStatus: 'CLOSED_COMPLETED',
    decisionContext: {
      propertyId: 'prop_mi_montenapoleone_8',
      propertyTitle: 'Via Montenapoleone 8 — Quadrilatero, Milano',
      agentId: 'agent_l_bianchi',
      agencyId: 'agency_milano_luxury',
      objective: 'MAX_PROFIT',
      mandateDaysRemaining: 74
    },
    ratingSnapshot: {
      realEstateRating: 88,
      agencyFitScore: 92,
      confidenceScore: 94,
      dimensions: { Property: 90, Location: 96, Market: 85, Economics: 82 }
    },
    recommendationIssued: {
      actionType: 'PRICE_REDUCTION',
      currentPrice: 1850000,
      recommendedPrice: 1740000,
      actionScore: 94,
      predictedProbability60d: 78,
      isActionScoreAvailable: true,
      predictedLeadsDeltaPct: 40,
      predictedVisits14d: 6,
      expectedFeedback: 'FAIR'
    },
    observedHumanDecision: {
      eventType: 'ACCEPTED',
      appliedPrice: 1740000,
      deltaVsRecommendation: 0,
      scenarioChosen: 'SCENARIO_A'
    },
    behavioralSignals: [
      {
        signalType: 'OPEN_COMPARABLES_DRILLDOWN',
        timestamp: '2026-09-10 16:41',
        metadata: { comparablesInspected: 5, timeSpentSec: 68 }
      }
    ],
    inferredMotivation: {
      primaryCategory: 'STRATEGIC_PREFERENCE',
      subCategory: 'ALIGNED_WITH_MODEL',
      confidenceScore: 0.92,
      status: 'CONSOLIDATED',
      probabilityVector: {
        EXTERNAL_CONSTRAINT: 0.04,
        MODEL_DISAGREEMENT: 0.04,
        COMMERCIAL_TIMING: 0.02,
        STRATEGIC_PREFERENCE: 0.86,
        INFORMATION_GAP: 0.01,
        UNKNOWN: 0.03
      },
      attributionRationale: 'Piena convergenza tra raccomandazione e strategia di portafoglio investitori.'
    },
    outcomeTracking: {
      proxyStatus: 'PROXY_CONFIRMED',
      shortTermProxies: {
        targetLeads14d: 8,
        actualLeads14d: 14,
        leadsDelta14d: '+55%',
        visitsScheduled14d: 6,
        actualVisits14d: 6,
        priceFeedbackSummary: 'FAIR',
        ctrPortalsDelta14d: '+48%',
        isPositive: true,
        evaluatedAt: '2026-09-14 12:00'
      },
      operativeEffort: {
        leadResponseTimeHours: 12,
        visitsCompleted: 6,
        visitsRequested: 6,
        marketingSpendDelivered: true,
        computedEffortScore: 0.95
      },
      attributionSegregation: 'SUCCESS_CONFIRMED',
      finalOutcome: {
        closed: true,
        salePrice: 1740000,
        daysOnMarketTotal: 34,
        mandateOutcome: 'COMPLETED',
        worldModelSterilized: false,
        attributionNotes: 'Vendita rapida chiusa su buyer pool CRM. Validazione prezzo ed elasticità completata.'
      }
    },
    finalOutcomeReconciliation: {
      decisionId: 'del_log_002',
      propertyId: 'prop_mi_montenapoleone_8',
      outcomeType: 'CLOSED_SALE_WON',
      salePriceActual: 1740000,
      deltaVsInitialRecommendationPct: 0,
      totalDaysOnMarket: 34,
      mandateRealizationRate: 1.0,
      effort: {
        avgLeadResponseHours: 12,
        conductedVisitsCount: 6,
        requestedVisitsCount: 6,
        marketingBudgetDeliveredEur: 500,
        marketingBudgetCommittedEur: 500,
        calculatedEffortScore: 0.95,
        effortClassification: 'HIGH_EFFORT'
      },
      attribution: {
        biasCategory: 'ALIGNED_EXECUTION',
        worldModelSterilized: false,
        explanation: 'Vendita perfezionata a rogito in piena convergenza con il Fair Value stimato da REDIP e diligenza commerciale massima.',
        decisionModelUpdate: {
          agencyFrictionFlag: false,
          pricingElasticityAdjustment: 0.0
        }
      }
    }
  },
  {
    eventId: 'del_log_003',
    timestamp: '2026-09-08 09:15',
    status: 'PROXY_EVALUATED',
    lifecycleStatus: 'PROXY_STAGNATION_ALERT',
    decisionContext: {
      propertyId: 'prop_to_roma_45',
      propertyTitle: 'Via Roma 45 — Centro Storico, Torino',
      agentId: 'agent_f_verdi',
      agencyId: 'agency_torino_centro',
      objective: 'BALANCED',
      mandateDaysRemaining: 18
    },
    ratingSnapshot: {
      realEstateRating: 64,
      agencyFitScore: 71,
      confidenceScore: 78,
      dimensions: { Property: 65, Location: 80, Market: 55, Economics: 58 }
    },
    recommendationIssued: {
      actionType: 'PRICE_REDUCTION',
      currentPrice: 380000,
      recommendedPrice: 350000,
      actionScore: 91,
      predictedProbability60d: 62,
      isActionScoreAvailable: true,
      predictedLeadsDeltaPct: 20,
      predictedVisits14d: 3,
      expectedFeedback: 'FAIR'
    },
    observedHumanDecision: {
      eventType: 'ACTION_OVERRIDE',
      appliedPrice: 380000,
      deltaVsRecommendation: 30000,
      scenarioChosen: 'SCENARIO_C'
    },
    behavioralSignals: [
      {
        signalType: 'CRM_OBJECTION_LOGGED',
        timestamp: '2026-09-08 09:12',
        metadata: { objection: 'Trattativa verbale in corso con mutuo acquirente' }
      }
    ],
    inferredMotivation: {
      primaryCategory: 'COMMERCIAL_TIMING',
      subCategory: 'PLANNED_DELAY',
      confidenceScore: 0.74,
      status: 'HYPOTHESIS',
      probabilityVector: {
        EXTERNAL_CONSTRAINT: 0.12,
        MODEL_DISAGREEMENT: 0.10,
        COMMERCIAL_TIMING: 0.52,
        STRATEGIC_PREFERENCE: 0.08,
        INFORMATION_GAP: 0.06,
        UNKNOWN: 0.12
      },
      attributionRationale: 'Ritardo commerciale programmato: attesa esito delibera mutuo acquirente registrata a CRM.'
    },
    reconciliationResult: {
      decisionId: 'del_log_003',
      marketResponseIndex: 28,
      status: 'STAGNATION_REJECTED',
      predictedVsObserved: {
        predictedLeads: 5,
        observedLeads: 1,
        leadsDeltaPct: -15,
        predictedVisits: 3,
        observedVisits: 0
      },
      bayesianConfidenceDelta: -0.25,
      strategicPrescription: {
        alertRequired: true,
        headline: 'Mancata Risposta del Mercato a 14gg (Stagnazione Rilevata)',
        recommendedAction: 'ESCALATE_TO_SCENARIO_A',
        rationale: 'Mancata Risposta del Mercato a 14gg: L\'adeguamento parziale non ha sbloccato le visite (0 visite, sentiment EXCESSIVE). Consigliata escalation immediata allo Scenario A (riposizionamento completo al fair value).'
      }
    },
    outcomeTracking: {
      proxyStatus: 'PROXY_FAILED',
      proxyAlert: 'Allarme Mancata Reazione Mercato: 0 visite e feedback prezzo eccessivo a 14gg. Richiesto riesame strategico immediato.',
      shortTermProxies: {
        targetLeads14d: 5,
        actualLeads14d: 1,
        leadsDelta14d: '-15%',
        visitsScheduled14d: 0,
        actualVisits14d: 0,
        priceFeedbackSummary: 'EXCESSIVE',
        ctrPortalsDelta14d: '-8%',
        isPositive: false,
        evaluatedAt: '2026-09-12 18:00'
      },
      operativeEffort: {
        leadResponseTimeHours: 85,
        visitsCompleted: 0,
        visitsRequested: 4,
        marketingSpendDelivered: false,
        computedEffortScore: 0.28
      },
      attributionSegregation: 'ORGANIZATIONAL_INERTIA_BIAS',
      finalOutcome: {
        closed: false,
        daysOnMarketTotal: 120,
        mandateOutcome: 'EXPIRED',
        worldModelSterilized: true,
        attributionNotes: 'Inerzia Operativa Rilevata (Effort: 0.28). Riscontri lenti e visite inevase. World Model STERILIZZATO: pesi ed elasticità non alterati.'
      }
    }
  },
  {
    eventId: 'del_log_004',
    timestamp: '2026-08-20 15:30',
    status: 'CLOSED',
    lifecycleStatus: 'CLOSED_COMPLETED',
    decisionContext: {
      propertyId: 'prop_rm_francia_42',
      propertyTitle: 'Corso di Francia 42 — Vigna Clara, Roma',
      agentId: 'agent_m_rossi',
      agencyId: 'agency_prati_prime',
      objective: 'MAX_LIQUIDITY_60D',
      mandateDaysRemaining: 0
    },
    ratingSnapshot: {
      realEstateRating: 81,
      agencyFitScore: 89,
      confidenceScore: 92,
      dimensions: { Property: 80, Location: 85, Market: 78, Economics: 82 }
    },
    recommendationIssued: {
      actionType: 'PRICE_REDUCTION',
      currentPrice: 530000,
      recommendedPrice: 495000,
      actionScore: 91,
      predictedProbability60d: 86,
      isActionScoreAvailable: true,
      predictedLeadsDeltaPct: 30,
      predictedVisits14d: 6,
      expectedFeedback: 'FAIR'
    },
    observedHumanDecision: {
      eventType: 'ACCEPTED',
      appliedPrice: 495000,
      deltaVsRecommendation: 0,
      scenarioChosen: 'SCENARIO_A'
    },
    behavioralSignals: [
      {
        signalType: 'DOWNLOAD_OWNER_REPORT',
        timestamp: '2026-08-20 15:25'
      }
    ],
    inferredMotivation: {
      primaryCategory: 'EXTERNAL_CONSTRAINT',
      subCategory: 'OWNER_CONSTRAINT',
      confidenceScore: 0.95,
      status: 'CONSOLIDATED',
      probabilityVector: {
        EXTERNAL_CONSTRAINT: 0.90,
        MODEL_DISAGREEMENT: 0.02,
        COMMERCIAL_TIMING: 0.02,
        STRATEGIC_PREFERENCE: 0.02,
        INFORMATION_GAP: 0.01,
        UNKNOWN: 0.03
      },
      attributionRationale: 'Allineamento riuscito con venditore grazie al dossier periziale con comparabili.'
    },
    outcomeTracking: {
      proxyStatus: 'PROXY_CONFIRMED',
      shortTermProxies: {
        leadsDelta14d: '+62%',
        visitsScheduled14d: 8,
        actualVisits14d: 8,
        priceFeedbackSummary: 'FAIR',
        ctrPortalsDelta14d: '+45%',
        isPositive: true
      },
      operativeEffort: {
        leadResponseTimeHours: 18,
        visitsCompleted: 8,
        visitsRequested: 9,
        marketingSpendDelivered: true,
        computedEffortScore: 0.88
      },
      attributionSegregation: 'SUCCESS_CONFIRMED',
      finalOutcome: {
        closed: true,
        salePrice: 495000,
        daysOnMarketTotal: 42,
        mandateOutcome: 'COMPLETED',
        worldModelSterilized: false,
        attributionNotes: 'Rogito chiuso nei tempi prefissati.'
      }
    }
  },
  {
    eventId: 'del_log_005',
    timestamp: '2026-09-07 14:10',
    status: 'AWAITING_14D_PROXY',
    lifecycleStatus: 'AWAITING_14D_CHECKPOINT',
    decisionContext: {
      propertyId: 'prop_bo_indipendenza_12',
      propertyTitle: 'Via dell\'Indipendenza 12 — Centro Storico, Bologna',
      agentId: 'agent_g_neri',
      agencyId: 'agency_bologna_centro',
      objective: 'BALANCED',
      mandateDaysRemaining: 55
    },
    ratingSnapshot: {
      realEstateRating: 77,
      agencyFitScore: 82,
      confidenceScore: 86,
      dimensions: { Property: 74, Location: 86, Market: 72, Economics: 76 }
    },
    recommendationIssued: {
      actionType: 'PRICE_REDUCTION',
      currentPrice: 460000,
      recommendedPrice: 425000,
      actionScore: 89,
      predictedProbability60d: 82,
      isActionScoreAvailable: true,
      predictedLeadsDeltaPct: 30,
      predictedVisits14d: 4,
      expectedFeedback: 'FAIR'
    },
    observedHumanDecision: {
      eventType: 'PARTIAL_PRICE_ADJUSTMENT',
      appliedPrice: 440000,
      deltaVsRecommendation: 15000,
      scenarioChosen: 'SCENARIO_B'
    },
    behavioralSignals: [
      {
        signalType: 'SLIDER_TOLERANCE_TEST',
        timestamp: '2026-09-07 14:05',
        metadata: { testedMin: 425000, testedMax: 450000 }
      }
    ],
    inferredMotivation: {
      primaryCategory: 'EXTERNAL_CONSTRAINT',
      subCategory: 'FINANCIAL_CONSTRAINT',
      confidenceScore: 0.72,
      status: 'HYPOTHESIS',
      probabilityVector: {
        EXTERNAL_CONSTRAINT: 0.48,
        MODEL_DISAGREEMENT: 0.08,
        COMMERCIAL_TIMING: 0.06,
        STRATEGIC_PREFERENCE: 0.12,
        INFORMATION_GAP: 0.06,
        UNKNOWN: 0.20
      },
      attributionRationale: 'Adeguamento parziale intermedio tra raccomandazione e richiesta iniziale. Raggiunto il giorno 14: richiede riconciliazione empirica delle metriche.'
    },
    outcomeTracking: {
      proxyStatus: 'PENDING',
      shortTermProxies: {
        targetLeads14d: 6,
        visitsScheduled14d: 4
      }
    }
  },
  {
    eventId: 'del_log_006',
    timestamp: '2026-09-18 09:30',
    status: 'AWAITING_14D_PROXY',
    lifecycleStatus: 'MONITORING_PROXY_WINDOW',
    decisionContext: {
      propertyId: 'prop_rm_nomentana_221',
      propertyTitle: 'Via Nomentana 221 — Trieste, Roma',
      agentId: 'agent_m_rossi',
      agencyId: 'agency_prati_prime',
      objective: 'MAX_LIQUIDITY_60D',
      mandateDaysRemaining: 84
    },
    ratingSnapshot: {
      realEstateRating: 81,
      agencyFitScore: 94,
      confidenceScore: 90,
      dimensions: { Property: 82, Location: 84, Market: 78, Economics: 80 }
    },
    recommendationIssued: {
      actionType: 'STRATEGY_MAINTAIN',
      currentPrice: 460000,
      recommendedPrice: 484000,
      actionScore: 88,
      predictedProbability60d: 78,
      isActionScoreAvailable: true,
      predictedLeadsDeltaPct: 25,
      predictedVisits14d: 5,
      expectedFeedback: 'FAIR'
    },
    observedHumanDecision: {
      eventType: 'ACCEPTED',
      appliedPrice: 484000,
      deltaVsRecommendation: 0,
      scenarioChosen: 'SCENARIO_A'
    },
    behavioralSignals: [],
    inferredMotivation: {
      primaryCategory: 'STRATEGIC_PREFERENCE',
      subCategory: 'ALIGNED_WITH_MODEL',
      confidenceScore: 0.90,
      status: 'CONSOLIDATED',
      probabilityVector: {
        EXTERNAL_CONSTRAINT: 0.05,
        MODEL_DISAGREEMENT: 0.03,
        COMMERCIAL_TIMING: 0.02,
        STRATEGIC_PREFERENCE: 0.85,
        INFORMATION_GAP: 0.02,
        UNKNOWN: 0.03
      },
      attributionRationale: 'Allineamento al Valore Congruo MCA (€484.000) e matching con 23 acquirenti profilati in CRM. In finestra di monitoraggio T+14 Proxy.'
    },
    outcomeTracking: {
      proxyStatus: 'PENDING',
      shortTermProxies: {
        targetLeads14d: 7,
        visitsScheduled14d: 5
      }
    }
  }
];

const DecisionStoreContext = createContext<DecisionStoreContextType | null>(null);

export const DecisionStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [decisionLogs, setDecisionLogs] = useState<DecisionEventLog[]>(() => {
    const saved = localStorage.getItem('redip_decision_logs_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].lifecycleStatus) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached logs v2', e);
      }
    }
    return INITIAL_LOGS;
  });

  const [formalDecisionLogs, setFormalDecisionLogs] = useState<FormalDecisionLogEvent[]>(() => {
    return getInitialFormalDecisionLogs();
  });

  const [activeReviewProperty, setActiveReviewProperty] = useState<PropertyItem | null>(null);

  useEffect(() => {
    localStorage.setItem('redip_decision_logs_v2', JSON.stringify(decisionLogs));
  }, [decisionLogs]);

  /**
   * Emette un segnale comportamentale asincrono e aggiorna il vettore Bayesiano.
   */
  const emitSignal = (propertyId: string, signalType: BehavioralSignalType, metadata?: Record<string, any>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newSignal = { signalType, timestamp: now, metadata };

    setDecisionLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.decisionContext.propertyId === propertyId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentLog = updated[existingIdx];
        const allSignals = [...currentLog.behavioralSignals, newSignal];

        // Ricalcola il vettore di inferenza Bayesiana con il nuovo segnale comportamentale
        const bayesianUpdate = computeBayesianMotivationVector({
          eventType: currentLog.observedHumanDecision.eventType,
          appliedPrice: currentLog.observedHumanDecision.appliedPrice,
          recommendedPrice: currentLog.recommendationIssued.recommendedPrice,
          scenarioChosen: currentLog.observedHumanDecision.scenarioChosen,
          mandateDaysRemaining: currentLog.decisionContext.mandateDaysRemaining,
          behavioralSignals: allSignals
        });

        updated[existingIdx] = {
          ...currentLog,
          behavioralSignals: allSignals,
          inferredMotivation: {
            primaryCategory: bayesianUpdate.primaryCategory,
            subCategory: bayesianUpdate.subCategory,
            confidenceScore: bayesianUpdate.confidenceScore,
            probabilityVector: bayesianUpdate.probabilityVector,
            status: bayesianUpdate.status,
            attributionRationale: bayesianUpdate.attributionRationale
          }
        };
        return updated;
      }
      return prev;
    });
  };

  /**
   * Aggiornamento manuale o esplicito della motivazione dell'agente.
   */
  const updateMotivation = (
    propertyId: string,
    category: DecisionDivergenceCategory,
    subCategory?: string,
    confidenceScore: number = 0.85,
    status: 'HYPOTHESIS' | 'CONSOLIDATED' = 'CONSOLIDATED'
  ) => {
    setDecisionLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.decisionContext.propertyId === propertyId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentLog = updated[existingIdx];

        const bayesianUpdate = computeBayesianMotivationVector({
          eventType: currentLog.observedHumanDecision.eventType,
          appliedPrice: currentLog.observedHumanDecision.appliedPrice,
          recommendedPrice: currentLog.recommendationIssued.recommendedPrice,
          scenarioChosen: currentLog.observedHumanDecision.scenarioChosen,
          mandateDaysRemaining: currentLog.decisionContext.mandateDaysRemaining,
          behavioralSignals: currentLog.behavioralSignals,
          forcedCategory: category,
          subCategory
        });

        updated[existingIdx] = {
          ...currentLog,
          inferredMotivation: {
            primaryCategory: category,
            subCategory: subCategory || category,
            confidenceScore,
            probabilityVector: bayesianUpdate.probabilityVector,
            status,
            attributionRationale: `Consolidamento esplicito operatore: ${category} (${subCategory || 'N/A'})`
          }
        };
        return updated;
      }
      return prev;
    });
  };

  /**
   * 1. REFACTORING LOGICA D'INFERENZA MOTIVAZIONALE & PROBABILISTIC VECTOR
   * Registra una decisione osservata applicando le regole di neutralità prioritaria (Regola UNKNOWN).
   */
  const recordDecision = ({
    property,
    eventType,
    appliedPrice,
    scenarioChosen = 'SCENARIO_A',
    forcedCategory,
    subCategory
  }: {
    property: PropertyItem;
    eventType: 'ACCEPTED' | 'PARTIAL_PRICE_ADJUSTMENT' | 'ACTION_OVERRIDE' | 'IGNORED';
    appliedPrice: number;
    scenarioChosen?: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'CUSTOM_SLIDER';
    forcedCategory?: DecisionDivergenceCategory;
    subCategory?: string;
  }): DecisionEventLog => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const recommendedPrice = Math.round(property.askingPrice * 0.91);
    const delta = appliedPrice - recommendedPrice;

    // Calcolo puro dell'Action Score disaccoppiato dal rating
    const actionScoreResult = calculateActionScore({
      priceRatio: property.askingPrice / Math.max(1, property.estimatedFairValue || property.askingPrice),
      mandateDaysRemaining: property.estimatedTimeToSaleDays || 60,
      leadsTrend14d: -10,
      agencyFitScore: property.agencyFit?.score ?? 80,
      marketLiquidityDays: 90,
      confidenceScore: property.ratingConfidence
    });

    // Calcolo puro del Vettore di Probabilità P(M) secondo la tesi di prodotto:
    // In assenza di segnali comportamentali asincroni, UNKNOWN >= 0.40
    const bayesianInference = computeBayesianMotivationVector({
      eventType,
      appliedPrice,
      recommendedPrice,
      scenarioChosen,
      mandateDaysRemaining: property.estimatedTimeToSaleDays || 60,
      behavioralSignals: [],
      forcedCategory,
      subCategory
    });

    const newLog: DecisionEventLog = {
      eventId: `del_log_${Date.now().toString().slice(-6)}`,
      timestamp: now,
      status: 'AWAITING_14D_PROXY',
      lifecycleStatus: 'DELIBERATED_DAY_0',
      decisionContext: {
        propertyId: property.id,
        propertyTitle: `${property.title} — ${property.microZone}, ${property.city}`,
        agentId: 'agent_current_operator',
        agencyId: 'agency_local_hub',
        objective: 'MAX_LIQUIDITY_60D',
        mandateDaysRemaining: property.estimatedTimeToSaleDays || 60
      },
      ratingSnapshot: {
        realEstateRating: property.realEstateRating,
        agencyFitScore: property.agencyFit?.score ?? 80,
        confidenceScore: property.ratingConfidence,
        dimensions: property.dimensions.reduce((acc, d) => ({ ...acc, [d.key]: d.score }), {})
      },
      recommendationIssued: {
        actionType: 'PRICE_REDUCTION',
        currentPrice: property.askingPrice,
        recommendedPrice,
        actionScore: actionScoreResult.actionScore,
        predictedProbability60d: Math.round(property.realEstateRating * 0.95),
        isActionScoreAvailable: actionScoreResult.isActionScoreAvailable,
        actionScoreUnavailableReason: actionScoreResult.actionScoreUnavailableReason,
        predictedLeadsDeltaPct: 25,
        predictedVisits14d: 4,
        expectedFeedback: 'FAIR'
      },
      observedHumanDecision: {
        eventType,
        appliedPrice,
        deltaVsRecommendation: delta,
        scenarioChosen
      },
      behavioralSignals: [],
      inferredMotivation: {
        primaryCategory: bayesianInference.primaryCategory,
        subCategory: bayesianInference.subCategory,
        confidenceScore: bayesianInference.confidenceScore,
        probabilityVector: bayesianInference.probabilityVector,
        status: bayesianInference.status,
        attributionRationale: bayesianInference.attributionRationale
      },
      outcomeTracking: {
        proxyStatus: 'PENDING',
        shortTermProxies: {
          targetLeads14d: 6,
          actualLeads14d: undefined,
          leadsDelta14d: undefined,
          visitsScheduled14d: undefined,
          actualVisits14d: undefined,
          priceFeedbackSummary: undefined,
          isPositive: undefined
        }
      }
    };

    setDecisionLogs((prev) => [newLog, ...prev]);

    // Registra in cima alla lista un nuovo Formal Decision Log per l'Audit Trail
    const isNomentana = property.id === 'prop_rm_nomentana_221' || property.code === 'RM-NOM-221';
    const formalEventId = isNomentana ? 'evt_nomentana_mca_2026' : `evt_${Date.now()}`;
    const formalTitle = isNomentana ? 'Via Nomentana 221 — Roma' : property.title;
    const finalAppliedPrice = appliedPrice || (isNomentana ? 484000 : property.askingPrice);
    const formalDecisionType = eventType === 'ACCEPTED'
      ? 'ACCEPTED_RECOMMENDATION (Scenario A MCA)'
      : scenarioChosen === 'SCENARIO_B'
      ? 'PARTIAL_PRICE_ADJUSTMENT (Scenario B Compromesso)'
      : 'ACTION_OVERRIDE (Scenario C Status Quo)';

    const newFormalEvent: FormalDecisionLogEvent = {
      event_id: formalEventId,
      timestamp: new Date().toISOString(),
      property_title: formalTitle,
      applied_price: finalAppliedPrice,
      decision_type: formalDecisionType,
      target_dom: 48,
      confidence: 90,
      decision_context: {
        property_id: property.id,
        property_title: formalTitle,
        agent_id: 'agent_m_rossi',
        agent_name: 'Marco Rossi (Responsabile Acquisizioni)',
        agency_id: 'branch_roma_nord_01',
        objective: 'MAX_LIQUIDITY_60D',
        mandate_days_remaining: property.estimatedTimeToSaleDays || 84
      },
      rating_snapshot: {
        real_estate_rating: property.realEstateRating || 81,
        agency_fit_score: property.agencyFit?.score || 94,
        confidence: 0.90,
        dimensions: { price_fit: 82, demand: 89, liquidity: 84, location: 88 }
      },
      recommendation_issued: {
        action_type: 'TARGETED_CLIENT_MATCHING',
        current_price: property.askingPrice,
        recommended_price: recommendedPrice,
        action_score: actionScoreResult.actionScore || 88,
        predicted_probability_60d: 0.78,
        expected_time_to_sale_days: 48
      },
      observed_human_decision: {
        event_type: 'ACCEPTED_RECOMMENDATION',
        applied_price: finalAppliedPrice,
        delta_vs_recommendation: delta,
        slider_release_point: finalAppliedPrice
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
          sale_price: finalAppliedPrice,
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

    setFormalDecisionLogs((prev) => [newFormalEvent, ...prev.filter(e => e.event_id !== newFormalEvent.event_id)]);

    return newLog;
  };

  /**
   * STEP 2 CHECKPOINT: FAST FORWARD DECISION TIME & EMPIRICAL PROXY RECONCILIATION
   * Simula l'avanzamento a 14 o 21 giorni o accoglie consuntivo manuale,
   * calcola il Market Response Index (MRI) ed esegue l'aggiornamento bayesiano retroattivo.
   */
  const fastForwardDecisionTime = (
    propertyId: string,
    targetDays: 14 | 21 = 14,
    preset: 'REACTIVE' | 'STAGNATION' | 'CUSTOM' = 'REACTIVE',
    customData?: ProxyMetricsSnapshot
  ): ProxyReconciliationResult | undefined => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let snapshot: ProxyMetricsSnapshot;
    if (preset === 'REACTIVE') {
      snapshot = {
        recordedAt: now,
        daysElapsed: targetDays,
        leadsCount: targetDays === 14 ? 9 : 14,
        leadsDeltaPct: targetDays === 14 ? 45 : 55,
        scheduledVisits: targetDays === 14 ? 4 : 7,
        listingCtrPct: 2.8,
        marketPriceSentiment: 'FAIR'
      };
    } else if (preset === 'STAGNATION') {
      snapshot = {
        recordedAt: now,
        daysElapsed: targetDays,
        leadsCount: targetDays === 14 ? 2 : 3,
        leadsDeltaPct: -12,
        scheduledVisits: 0,
        listingCtrPct: 0.9,
        marketPriceSentiment: 'EXCESSIVE'
      };
    } else if (customData) {
      snapshot = customData;
    } else {
      snapshot = {
        recordedAt: now,
        daysElapsed: targetDays,
        leadsCount: 6,
        leadsDeltaPct: 15,
        scheduledVisits: 2,
        listingCtrPct: 1.6,
        marketPriceSentiment: 'FAIR'
      };
    }

    let reconciliationResult: ProxyReconciliationResult | undefined = undefined;

    setDecisionLogs((prev) => {
      let updated = [...prev];
      let idx = updated.findIndex((l) => l.decisionContext.propertyId === propertyId);

      // Se non esiste ancora un log formale per questo immobile, lo creiamo a Day 0
      if (idx === -1) {
        const propDb = PROPERTIES_DATABASE.find(p => p.id === propertyId);
        const fallbackTitle = propDb ? `${propDb.title} — ${propDb.microZone}, ${propDb.city}` : `Immobile ${propertyId}`;
        const askingPrice = propDb ? propDb.askingPrice : 450000;
        const recommendedPrice = Math.round(askingPrice * 0.92);

        const newLog: DecisionEventLog = {
          eventId: `del_log_${Date.now().toString().slice(-6)}`,
          timestamp: '2026-09-02 10:00',
          status: 'AWAITING_14D_PROXY',
          lifecycleStatus: 'AWAITING_14D_CHECKPOINT',
          decisionContext: {
            propertyId,
            propertyTitle: fallbackTitle,
            agentId: 'agent_current_operator',
            agencyId: 'agency_local_hub',
            objective: 'MAX_LIQUIDITY_60D',
            mandateDaysRemaining: 76
          },
          ratingSnapshot: {
            realEstateRating: propDb?.realEstateRating || 75,
            agencyFitScore: propDb?.agencyFit?.score ?? 80,
            confidenceScore: propDb?.ratingConfidence || 85,
            dimensions: propDb?.dimensions ? propDb.dimensions.reduce((acc, d) => ({ ...acc, [d.key]: d.score }), {}) : {}
          },
          recommendationIssued: {
            actionType: 'PRICE_REDUCTION',
            currentPrice: askingPrice,
            recommendedPrice,
            actionScore: 88,
            predictedProbability60d: 82,
            isActionScoreAvailable: true,
            predictedLeadsDeltaPct: 25,
            predictedVisits14d: 4,
            expectedFeedback: 'FAIR'
          },
          observedHumanDecision: {
            eventType: 'PARTIAL_PRICE_ADJUSTMENT',
            appliedPrice: Math.round((askingPrice + recommendedPrice) / 2),
            deltaVsRecommendation: Math.round((askingPrice - recommendedPrice) / 2),
            scenarioChosen: 'SCENARIO_B'
          },
          behavioralSignals: [],
          inferredMotivation: {
            primaryCategory: 'EXTERNAL_CONSTRAINT',
            subCategory: 'OWNER_CONSTRAINT',
            confidenceScore: 0.70,
            status: 'HYPOTHESIS',
            probabilityVector: {
              EXTERNAL_CONSTRAINT: 0.50,
              MODEL_DISAGREEMENT: 0.10,
              COMMERCIAL_TIMING: 0.05,
              STRATEGIC_PREFERENCE: 0.10,
              INFORMATION_GAP: 0.05,
              UNKNOWN: 0.20
            },
            attributionRationale: 'In attesa di verifica empirica dei proxy a 14gg.'
          },
          outcomeTracking: {
            proxyStatus: 'PENDING',
            shortTermProxies: {
              targetLeads14d: 6,
              visitsScheduled14d: 4
            }
          }
        };

        updated = [newLog, ...updated];
        idx = 0;
      }

      const log = updated[idx];
      const predicted = {
        leadsDeltaPct: log.recommendationIssued.predictedLeadsDeltaPct ?? 25,
        visits: log.recommendationIssued.predictedVisits14d ?? 4,
        expectedFeedback: log.recommendationIssued.expectedFeedback ?? 'FAIR'
      };

      const result = reconcileProxyOutcomes(predicted, snapshot, log.eventId);
      reconciliationResult = result;

      const isReactive = result.status === 'REACTIVE_CONVERGING';
      const isStagnant = result.status === 'STAGNATION_REJECTED';

      const newLifecycleStatus: DecisionLifecycleStatus = isReactive
        ? 'PROXY_VALIDATED'
        : isStagnant
        ? 'PROXY_STAGNATION_ALERT'
        : 'MONITORING_PROXY_WINDOW';

      const newStatus: DecisionTrackingStatus = isReactive
        ? 'AWAITING_FINAL_OUTCOME'
        : 'PROXY_EVALUATED';

      const newConfidence = Math.max(
        0.15,
        Math.min(0.98, Number((log.inferredMotivation.confidenceScore + result.bayesianConfidenceDelta).toFixed(2)))
      );

      updated[idx] = {
        ...log,
        status: newStatus,
        lifecycleStatus: newLifecycleStatus,
        proxyMetricsSnapshot: snapshot,
        reconciliationResult: result,
        inferredMotivation: {
          ...log.inferredMotivation,
          confidenceScore: newConfidence,
          status: isReactive ? 'CONSOLIDATED' : log.inferredMotivation.status,
          attributionRationale: isReactive
            ? `${log.inferredMotivation.attributionRationale || ''} [Convalidato a ${targetDays}gg da MRI ${result.marketResponseIndex}/100: ${snapshot.scheduledVisits} visite svolte, sentiment ${snapshot.marketPriceSentiment}].`
            : `${log.inferredMotivation.attributionRationale || ''} [Allarme T+${targetDays}: MRI ${result.marketResponseIndex}/100, ${result.strategicPrescription.headline}].`
        },
        outcomeTracking: {
          ...log.outcomeTracking,
          proxyStatus: isReactive ? 'PROXY_CONFIRMED' : 'PROXY_FAILED',
          proxyAlert: result.strategicPrescription.alertRequired ? result.strategicPrescription.rationale : undefined,
          shortTermProxies: {
            ...log.outcomeTracking.shortTermProxies,
            targetLeads14d: result.predictedVsObserved.predictedLeads,
            actualLeads14d: snapshot.leadsCount,
            leadsDelta14d: `${snapshot.leadsDeltaPct >= 0 ? '+' : ''}${snapshot.leadsDeltaPct}%`,
            visitsScheduled14d: snapshot.scheduledVisits,
            actualVisits14d: snapshot.scheduledVisits,
            priceFeedbackSummary: snapshot.marketPriceSentiment,
            ctrPortalsDelta14d: `+${snapshot.listingCtrPct}%`,
            isPositive: isReactive,
            evaluatedAt: now
          }
        }
      };

      return updated;
    });

    return reconciliationResult;
  };

  /**
   * Consuntiva manualmente i dati rilevati sul campo dal broker
   */
  const submitManualProxyData = (
    propertyId: string,
    metrics: ProxyMetricsSnapshot
  ): ProxyReconciliationResult | undefined => {
    return fastForwardDecisionTime(propertyId, metrics.daysElapsed as 14 | 21, 'CUSTOM', metrics);
  };

  /**
   * Checkpoint Temporale a 14–21 Giorni (Modulo M08 — Market Response Index & Proxy Tracking)
   * Product Thesis v1.0 (§10, §29)
   * Conferma i consuntivi, aggiorna lo stato dell'immobile in AWAITING_FINAL_OUTCOME,
   * ricalibra l'Action Score, incrementa la confidenza (+0.08) e registra l'evento PROXY_CHECKPOINT_CONFIRMED.
   */
  const confirmProxyCheckpoint = (
    propertyId: string,
    proxyInput: ProxyMetricsInput,
    mriResult: MarketResponseIndexResult
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Registra segnale comportamentale formale di checkpoint
    emitSignal(propertyId, 'PROXY_CHECKPOINT_CONFIRMED', {
      mriScore: mriResult.mriScore,
      trajectoryStatus: mriResult.trajectoryStatus,
      actualLeads: proxyInput.actualLeads,
      actualVisits: proxyInput.actualVisits,
      ctrDeltaPct: proxyInput.ctrDeltaPct,
      actionScoreRecalibrated: mriResult.actionScoreRecalibrated,
      confidenceBoost: mriResult.confidenceBoost,
      timestamp: now
    });

    // 2. Aggiorna il DecisionEventLog globale
    setDecisionLogs((prev) => {
      let updated = [...prev];
      let idx = updated.findIndex((l) => l.decisionContext.propertyId === propertyId);

      if (idx !== -1) {
        const log = updated[idx];
        const newConfidence = Math.min(0.99, Number((log.inferredMotivation.confidenceScore + mriResult.confidenceBoost).toFixed(2)));

        updated[idx] = {
          ...log,
          status: 'AWAITING_FINAL_OUTCOME',
          lifecycleStatus: 'AWAITING_FINAL_OUTCOME',
          inferredMotivation: {
            ...log.inferredMotivation,
            confidenceScore: newConfidence,
            status: 'CONSOLIDATED',
            attributionRationale: `${log.inferredMotivation.attributionRationale || ''} [Checkpoint T+14 Confermato: Traiettoria Validata (MRI ${mriResult.mriScore}/100). Avanzamento a Monitoraggio Offerte].`
          },
          recommendationIssued: {
            ...log.recommendationIssued,
            actionScore: mriResult.actionScoreRecalibrated
          },
          outcomeTracking: {
            ...log.outcomeTracking,
            proxyStatus: 'PROXY_CONFIRMED',
            shortTermProxies: {
              ...log.outcomeTracking.shortTermProxies,
              targetLeads14d: proxyInput.targetLeads,
              actualLeads14d: proxyInput.actualLeads,
              leadsDelta14d: `+${proxyInput.ctrDeltaPct}%`,
              visitsScheduled14d: proxyInput.actualVisits,
              actualVisits14d: proxyInput.actualVisits,
              priceFeedbackSummary: 'FAIR',
              ctrPortalsDelta14d: `+${proxyInput.ctrDeltaPct}%`,
              isPositive: true,
              evaluatedAt: now
            }
          }
        };
      }
      return updated;
    });
  };

  /**
   * 3. CHECKPOINT STATE MACHINE: EVALUATE 14-21D PROXY OUTCOMES (Legacy direct evaluator)
   */
  const evaluateProxyOutcomes = (
    eventId: string,
    actualMetrics: {
      actualLeads14d: number;
      actualVisits14d: number;
      priceFeedbackSummary: 'LOW' | 'FAIR' | 'EXCESSIVE';
      ctrPortalsDelta14d?: string;
    }
  ) => {
    const log = decisionLogs.find(l => l.eventId === eventId);
    if (!log) return;
    const sentiment = actualMetrics.priceFeedbackSummary === 'LOW' ? 'FAIR' : actualMetrics.priceFeedbackSummary;
    submitManualProxyData(log.decisionContext.propertyId, {
      recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      daysElapsed: 14,
      leadsCount: actualMetrics.actualLeads14d,
      leadsDeltaPct: actualMetrics.actualLeads14d >= 5 ? Math.round(((actualMetrics.actualLeads14d - 5) / 5) * 100) : -15,
      scheduledVisits: actualMetrics.actualVisits14d,
      listingCtrPct: parseFloat((actualMetrics.ctrPortalsDelta14d || '+15%').replace(/[^0-9.-]/g, '')) || 1.8,
      marketPriceSentiment: sentiment as 'COMPETITIVE' | 'FAIR' | 'EXCESSIVE'
    });
  };

  /**
   * 4. EFFORT-ADJUSTED ATTRIBUTION & FINAL OUTCOME SEGREGATION
   * Valuta il ciclo finale dell'immobile (rogito o decadenza) e segrega
   * la ricalibrazione del World Model dall'inerzia operativa dell'agenzia.
   */
  const evaluateFinalOutcome = (
    eventId: string,
    outcome: {
      closed: boolean;
      salePrice?: number;
      daysOnMarketTotal?: number;
      mandateOutcome?: 'COMPLETED' | 'EXPIRED' | 'REVOKED';
      operativeEffortData?: OperativeEffortInput;
    }
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setDecisionLogs((prev) => {
      const idx = prev.findIndex((l) => l.eventId === eventId);
      if (idx === -1) return prev;

      const updated = [...prev];
      const log = updated[idx];

      const effortData: OperativeEffortInput = outcome.operativeEffortData || {
        leadResponseTimeHours: outcome.closed ? 16 : 65,
        visitsCompleted: outcome.closed ? 7 : 1,
        visitsRequested: outcome.closed ? 8 : 5,
        marketingSpendDelivered: outcome.closed
      };

      const effortCalculation = calculateOperativeEffort(effortData);
      const attributionResult = attributeOutcomeBias(effortCalculation.score, {
        closed: outcome.closed,
        mandateOutcome: outcome.mandateOutcome,
        offersReceived: outcome.closed ? 2 : 0
      });

      const newLifecycleStatus: DecisionLifecycleStatus = outcome.closed ? 'CLOSED_COMPLETED' : 'CLOSED_EXPIRED';

      updated[idx] = {
        ...log,
        status: 'CLOSED',
        lifecycleStatus: newLifecycleStatus,
        outcomeTracking: {
          ...log.outcomeTracking,
          operativeEffort: effortCalculation.metrics,
          attributionSegregation: attributionResult.segregation,
          finalOutcome: {
            closed: outcome.closed,
            salePrice: outcome.salePrice || (outcome.closed ? log.observedHumanDecision.appliedPrice : undefined),
            daysOnMarketTotal: outcome.daysOnMarketTotal || 65,
            mandateOutcome: outcome.mandateOutcome || (outcome.closed ? 'COMPLETED' : 'EXPIRED'),
            worldModelSterilized: attributionResult.worldModelSterilized,
            attributionNotes: attributionResult.rationale,
            evaluatedAt: now
          }
        }
      };

      return updated;
    });
  };

  /**
   * STEP 3: Consuntivazione Formale Rogito / Esito Finale & Riconciliazione Anti-Bias
   */
  const finalizeDecisionOutcome = (
    propertyId: string,
    outcomeData: {
      outcomeType: FinalMandateOutcome;
      finalPrice?: number;
      totalDom?: number;
      effortMetrics: Omit<OperativeEffortSnapshot, 'calculatedEffortScore' | 'effortClassification'> | OperativeEffortInput | any;
    }
  ): FinalOutcomeReconciliation | undefined => {
    let computedReconciliation: FinalOutcomeReconciliation | undefined;

    setDecisionLogs((prev) => {
      const idx = prev.findIndex((l) => l.decisionContext.propertyId === propertyId);
      if (idx === -1) return prev;

      const updated = [...prev];
      const log = updated[idx];
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

      computedReconciliation = computeFinalOutcomeReconciliation({
        decisionId: log.eventId,
        propertyId,
        initialPriceRecommended: log.recommendationIssued.recommendedPrice,
        appliedPrice: log.observedHumanDecision.appliedPrice,
        finalOutcome: outcomeData.outcomeType,
        finalSalePrice: outcomeData.finalPrice,
        totalDom: outcomeData.totalDom ?? 75,
        effortMetrics: outcomeData.effortMetrics
      });

      const isWon = outcomeData.outcomeType === 'CLOSED_SALE_WON';
      const newLifecycleStatus: DecisionLifecycleStatus = isWon ? 'CLOSED_COMPLETED' : 'CLOSED_EXPIRED';

      updated[idx] = {
        ...log,
        status: 'CLOSED',
        lifecycleStatus: newLifecycleStatus,
        finalOutcomeReconciliation: computedReconciliation,
        outcomeTracking: {
          ...log.outcomeTracking,
          operativeEffort: {
            leadResponseTimeHours: computedReconciliation.effort.avgLeadResponseHours,
            visitsCompleted: computedReconciliation.effort.conductedVisitsCount,
            visitsRequested: computedReconciliation.effort.requestedVisitsCount,
            marketingSpendDelivered: computedReconciliation.effort.marketingBudgetDeliveredEur >= computedReconciliation.effort.marketingBudgetCommittedEur * 0.7,
            computedEffortScore: computedReconciliation.effort.calculatedEffortScore
          },
          attributionSegregation: computedReconciliation.attribution.biasCategory as any,
          finalOutcome: {
            closed: isWon,
            salePrice: computedReconciliation.salePriceActual,
            daysOnMarketTotal: outcomeData.totalDom ?? 75,
            mandateOutcome: isWon ? 'COMPLETED' : 'EXPIRED',
            worldModelSterilized: computedReconciliation.attribution.worldModelSterilized,
            attributionNotes: computedReconciliation.attribution.explanation,
            evaluatedAt: now
          }
        }
      };

      return updated;
    });

    return computedReconciliation;
  };

  /**
   * Time-Machine Preset Simulation per Esito Finale a 60-90gg
   */
  const fastForwardToFinalOutcome = (
    propertyId: string,
    preset: 'SUCCESSFUL_SALE' | 'EXPIRED_INERTIA' | 'EXPIRED_MARKET_REJECT'
  ): FinalOutcomeReconciliation | undefined => {
    const log = decisionLogs.find(l => l.decisionContext.propertyId === propertyId);
    const recPrice = log?.recommendationIssued.recommendedPrice || 400000;

    if (preset === 'SUCCESSFUL_SALE') {
      return finalizeDecisionOutcome(propertyId, {
        outcomeType: 'CLOSED_SALE_WON',
        finalPrice: Math.round(recPrice * 1.04), // +4% attiva Human Expertise Surplus
        totalDom: 52,
        effortMetrics: {
          avgLeadResponseHours: 12,
          conductedVisitsCount: 9,
          requestedVisitsCount: 10,
          marketingBudgetDeliveredEur: 500,
          marketingBudgetCommittedEur: 500
        }
      });
    }

    if (preset === 'EXPIRED_INERTIA') {
      return finalizeDecisionOutcome(propertyId, {
        outcomeType: 'MANDATE_EXPIRED_LOST',
        finalPrice: undefined,
        totalDom: 110,
        effortMetrics: {
          avgLeadResponseHours: 72,
          conductedVisitsCount: 1,
          requestedVisitsCount: 8,
          marketingBudgetDeliveredEur: 50,
          marketingBudgetCommittedEur: 500
        }
      });
    }

    // EXPIRED_MARKET_REJECT
    return finalizeDecisionOutcome(propertyId, {
      outcomeType: 'MANDATE_EXPIRED_LOST',
      finalPrice: undefined,
      totalDom: 95,
      effortMetrics: {
        avgLeadResponseHours: 14,
        conductedVisitsCount: 9,
        requestedVisitsCount: 9,
        marketingBudgetDeliveredEur: 500,
        marketingBudgetCommittedEur: 500
      }
    });
  };

  /**
   * Trojan Horse Button: Generates Negotiation Dossier for Owner (M07)
   * Automatically emits DOWNLOAD_OWNER_REPORT and consolidates EXTERNAL_CONSTRAINT (>= 0.80)
   * Allineato dinamicamente a MCA Evaluation, standard IVS e comparabili reali notarili.
   */
  const downloadOwnerReport = (
    property: PropertyItem,
    mcaEvaluation?: McaEvaluationResult,
    activeChoiceScenario?: { targetPrice: number; label: string }
  ) => {
    emitSignal(property.id, 'DOWNLOAD_OWNER_REPORT', {
      source: 'TrojanHorseButton',
      timestamp: new Date().toISOString()
    });

    const activeMca = mcaEvaluation || property.mcaEvaluation || evaluateSubjectWithMca(property);
    generateOwnerDossierPdf(property, activeMca, activeChoiceScenario);
  };

  const getLogsForProperty = (propertyId: string) => {
    return decisionLogs.filter((l) => l.decisionContext.propertyId === propertyId);
  };

  const getLatestLogForProperty = (propertyId: string) => {
    return decisionLogs.find((l) => l.decisionContext.propertyId === propertyId);
  };

  const openProxyReviewModal = (propertyOrId: PropertyItem | string) => {
    if (typeof propertyOrId === 'string') {
      const prop = PROPERTIES_DATABASE.find(p => p.id === propertyOrId);
      if (prop) {
        setActiveReviewProperty(prop);
      } else {
        // Find property from decision log
        const log = decisionLogs.find(l => l.decisionContext.propertyId === propertyOrId);
        const fallbackProp: PropertyItem = {
          id: propertyOrId,
          code: propertyOrId.toUpperCase(),
          title: log?.decisionContext.propertyTitle || `Immobile ${propertyOrId}`,
          address: 'Indirizzo registrato a sistema',
          city: 'Italia',
          province: 'IT',
          microZone: 'Zona Centrale',
          macroZone: 'Area Urbana',
          propertyType: 'Apartment',
          typologyCategory: 'Residential',
          squareMeters: 95,
          rooms: 3,
          bathrooms: 2,
          floor: 2,
          askingPrice: log?.recommendationIssued.currentPrice || 450000,
          estimatedFairValue: log?.recommendationIssued.recommendedPrice || 420000,
          priceDifferencePct: -5,
          pricePerSqm: 4700,
          estimatedSaleProbability90d: 75,
          realEstateRating: log?.ratingSnapshot.realEstateRating || 75,
          ratingClassification: 'STRONG',
          agencyFit: {
            score: log?.ratingSnapshot.agencyFitScore || 85,
            confidence: 85,
            confidenceLevel: 'HIGH',
            explanation: 'Compatibilità eccellente con il portafoglio acquirenti attivi dell’agenzia',
            compatibleActiveBuyers: 12,
            highIntentBuyers: 5,
            historicalPerformanceSimilarPct: 82,
            historicalTimeToSaleDays: 45,
            territoryExpertise: 'HIGH',
            portfolioOverlap: 'HIGH',
            matchingBuyerClusters: []
          },
          actionScoreObjective: 'Massimizzazione probabilità vendita a 60gg',
          isActionScoreAvailable: true,
          ratingHistory: [],
          coordinates: { lat: 41.9, lng: 12.5 },
          ratingConfidence: log?.ratingSnapshot.confidenceScore || 85,
          ratingConfidenceLevel: 'HIGH',
          estimatedTimeToSaleDays: 60,
          energyClass: 'A',
          conservationState: 'Excellent',
          totalFloors: 5,
          hasElevator: true,
          hasBalcony: true,
          hasParking: true,
          status: 'Review Required',
          dimensions: [],
          ratingTrend30d: 2,
          dataFreshnessDays: 1
        };
        setActiveReviewProperty(fallbackProp);
      }
    } else {
      setActiveReviewProperty(propertyOrId);
    }
  };

  const closeProxyReviewModal = () => {
    setActiveReviewProperty(null);
  };

  const [activeFinalOutcomeProperty, setActiveFinalOutcomeProperty] = useState<PropertyItem | null>(null);

  const openFinalOutcomeModal = (propertyOrId: PropertyItem | string) => {
    if (typeof propertyOrId === 'string') {
      const prop = PROPERTIES_DATABASE.find(p => p.id === propertyOrId);
      if (prop) {
        setActiveFinalOutcomeProperty(prop);
      } else {
        const log = decisionLogs.find(l => l.decisionContext.propertyId === propertyOrId);
        const fallbackProp: PropertyItem = {
          id: propertyOrId,
          code: propertyOrId.toUpperCase(),
          title: log?.decisionContext.propertyTitle || `Immobile ${propertyOrId}`,
          address: 'Indirizzo registrato a sistema',
          city: 'Italia',
          province: 'IT',
          microZone: 'Zona Centrale',
          macroZone: 'Area Urbana',
          propertyType: 'Apartment',
          typologyCategory: 'Residential',
          squareMeters: 95,
          rooms: 3,
          bathrooms: 2,
          floor: 2,
          askingPrice: log?.recommendationIssued.currentPrice || 450000,
          estimatedFairValue: log?.recommendationIssued.recommendedPrice || 420000,
          priceDifferencePct: -5,
          pricePerSqm: 4700,
          estimatedSaleProbability90d: 75,
          realEstateRating: log?.ratingSnapshot.realEstateRating || 75,
          ratingClassification: 'STRONG',
          agencyFit: {
            score: log?.ratingSnapshot.agencyFitScore || 85,
            confidence: 85,
            confidenceLevel: 'HIGH',
            explanation: 'Compatibilità eccellente con il portafoglio acquirenti attivi dell’agenzia',
            compatibleActiveBuyers: 12,
            highIntentBuyers: 5,
            historicalPerformanceSimilarPct: 82,
            historicalTimeToSaleDays: 45,
            territoryExpertise: 'HIGH',
            portfolioOverlap: 'HIGH',
            matchingBuyerClusters: []
          },
          actionScoreObjective: 'Massimizzazione probabilità vendita a 60gg',
          isActionScoreAvailable: true,
          ratingHistory: [],
          coordinates: { lat: 41.9, lng: 12.5 },
          ratingConfidence: log?.ratingSnapshot.confidenceScore || 85,
          ratingConfidenceLevel: 'HIGH',
          estimatedTimeToSaleDays: 60,
          energyClass: 'A',
          conservationState: 'Excellent',
          totalFloors: 5,
          hasElevator: true,
          hasBalcony: true,
          hasParking: true,
          status: 'Review Required',
          dimensions: [],
          ratingTrend30d: 2,
          dataFreshnessDays: 1
        };
        setActiveFinalOutcomeProperty(fallbackProp);
      }
    } else {
      setActiveFinalOutcomeProperty(propertyOrId);
    }
  };

  const closeFinalOutcomeModal = () => {
    setActiveFinalOutcomeProperty(null);
  };

  return (
    <DecisionStoreContext.Provider
      value={{
        decisionLogs,
        formalDecisionLogs,
        setFormalDecisionLogs,
        recordDecision,
        emitSignal,
        updateMotivation,
        evaluateProxyOutcomes,
        fastForwardDecisionTime,
        submitManualProxyData,
        confirmProxyCheckpoint,
        evaluateFinalOutcome,
        finalizeDecisionOutcome,
        fastForwardToFinalOutcome,
        downloadOwnerReport,
        getLogsForProperty,
        getLatestLogForProperty,
        activeReviewProperty,
        openProxyReviewModal,
        closeProxyReviewModal,
        activeFinalOutcomeProperty,
        openFinalOutcomeModal,
        closeFinalOutcomeModal
      }}
    >
      {children}
    </DecisionStoreContext.Provider>
  );
};

export const useDecisionStore = () => {
  const ctx = useContext(DecisionStoreContext);
  if (!ctx) {
    throw new Error('useDecisionStore must be used within a DecisionStoreProvider');
  }
  return ctx;
};
