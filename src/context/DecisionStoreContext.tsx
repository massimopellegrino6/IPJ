import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DecisionEventLog, BehavioralSignalType, DecisionDivergenceCategory } from '../types/decision';
import { PropertyItem } from '../types/intelligence';
import { jsPDF } from 'jspdf';

interface DecisionStoreContextType {
  decisionLogs: DecisionEventLog[];
  recordDecision: (params: {
    property: PropertyItem;
    eventType: 'ACCEPTED' | 'PARTIAL_PRICE_ADJUSTMENT' | 'ACTION_OVERRIDE' | 'IGNORED';
    appliedPrice: number;
    scenarioChosen?: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'CUSTOM_SLIDER';
    forcedCategory?: DecisionDivergenceCategory;
    subCategory?: string;
  }) => DecisionEventLog;
  emitSignal: (propertyId: string, signalType: BehavioralSignalType, metadata?: Record<string, any>) => void;
  updateMotivation: (
    propertyId: string,
    category: DecisionDivergenceCategory,
    subCategory?: string,
    confidenceScore?: number,
    status?: 'HYPOTHESIS' | 'CONSOLIDATED'
  ) => void;
  downloadOwnerReport: (property: PropertyItem) => void;
  getLogsForProperty: (propertyId: string) => DecisionEventLog[];
  getLatestLogForProperty: (propertyId: string) => DecisionEventLog | undefined;
}

const INITIAL_LOGS: DecisionEventLog[] = [
  {
    eventId: 'del_log_001',
    timestamp: '2026-09-14 11:24',
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
      recommendedPrice: 380000, // -9.5%
      actionScore: 88,
      predictedProbability60d: 84
    },
    observedHumanDecision: {
      eventType: 'PARTIAL_PRICE_ADJUSTMENT',
      appliedPrice: 400000,
      deltaVsRecommendation: 20000,
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
      status: 'CONSOLIDATED'
    },
    outcomeTracking: {
      shortTermProxies: {
        leadsDelta14d: '+38%',
        visitsScheduled14d: 4,
        priceFeedbackSummary: 'FAIR',
        ctrPortalsDelta14d: '+32%',
        isPositive: true
      }
    }
  },
  {
    eventId: 'del_log_002',
    timestamp: '2026-09-10 16:45',
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
      predictedProbability60d: 78
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
      subCategory: 'MARGIN_OVER_VELOCITY',
      confidenceScore: 0.92,
      status: 'CONSOLIDATED'
    },
    outcomeTracking: {
      shortTermProxies: {
        leadsDelta14d: '+55%',
        visitsScheduled14d: 6,
        priceFeedbackSummary: 'FAIR',
        ctrPortalsDelta14d: '+48%',
        isPositive: true
      }
    }
  },
  {
    eventId: 'del_log_003',
    timestamp: '2026-09-08 09:15',
    decisionContext: {
      propertyId: 'prop_to_roma_45',
      propertyTitle: 'Via Roma 45 — Centro Storico, Torino',
      agentId: 'agent_f_verdi',
      agencyId: 'agency_torino_centro',
      objective: 'BALANCED',
      mandateDaysRemaining: 28
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
      actionScore: 79,
      predictedProbability60d: 62
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
        metadata: { objection: 'Trattativa in corso per mutuo acquirente' }
      }
    ],
    inferredMotivation: {
      primaryCategory: 'COMMERCIAL_TIMING',
      subCategory: 'PLANNED_DELAY',
      confidenceScore: 0.74,
      status: 'HYPOTHESIS'
    },
    outcomeTracking: {
      shortTermProxies: {
        leadsDelta14d: '-15%',
        visitsScheduled14d: 1,
        priceFeedbackSummary: 'EXCESSIVE',
        ctrPortalsDelta14d: '-8%',
        isPositive: false
      }
    }
  },
  {
    eventId: 'del_log_004',
    timestamp: '2026-08-20 15:30',
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
      predictedProbability60d: 86
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
      status: 'CONSOLIDATED'
    },
    outcomeTracking: {
      shortTermProxies: {
        leadsDelta14d: '+62%',
        visitsScheduled14d: 8,
        priceFeedbackSummary: 'FAIR',
        isPositive: true
      },
      finalOutcome: {
        closed: true,
        salePrice: 495000,
        daysOnMarketTotal: 42,
        mandateOutcome: 'COMPLETED'
      }
    }
  }
];

const DecisionStoreContext = createContext<DecisionStoreContextType | null>(null);

export const DecisionStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [decisionLogs, setDecisionLogs] = useState<DecisionEventLog[]>(() => {
    const saved = localStorage.getItem('redip_decision_logs_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached logs', e);
      }
    }
    return INITIAL_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('redip_decision_logs_v1', JSON.stringify(decisionLogs));
  }, [decisionLogs]);

  const emitSignal = (propertyId: string, signalType: BehavioralSignalType, metadata?: Record<string, any>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newSignal = { signalType, timestamp: now, metadata };

    setDecisionLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.decisionContext.propertyId === propertyId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentLog = updated[existingIdx];
        
        let newInference = { ...currentLog.inferredMotivation };
        if (signalType === 'DOWNLOAD_OWNER_REPORT') {
          newInference = {
            primaryCategory: 'EXTERNAL_CONSTRAINT',
            subCategory: 'OWNER_CONSTRAINT',
            confidenceScore: Math.max(0.86, currentLog.inferredMotivation.confidenceScore),
            status: 'CONSOLIDATED'
          };
        } else if (signalType === 'OPEN_COMPARABLES_DRILLDOWN') {
          if (newInference.confidenceScore < 0.6) {
            newInference = {
              primaryCategory: 'MODEL_DISAGREEMENT',
              subCategory: 'PEER_GROUP_REJECTION',
              confidenceScore: 0.65,
              status: 'HYPOTHESIS'
            };
          }
        }

        updated[existingIdx] = {
          ...currentLog,
          behavioralSignals: [...currentLog.behavioralSignals, newSignal],
          inferredMotivation: newInference
        };
        return updated;
      }
      return prev;
    });
  };

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
        updated[existingIdx] = {
          ...updated[existingIdx],
          inferredMotivation: {
            primaryCategory: category,
            subCategory: subCategory || category,
            confidenceScore,
            status
          }
        };
        return updated;
      }
      return prev;
    });
  };

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

    // Automatic Inference based on Active Choice
    let inferred: DecisionEventLog['inferredMotivation'] = {
      primaryCategory: 'STRATEGIC_PREFERENCE',
      subCategory: 'MARGIN_OVER_VELOCITY',
      confidenceScore: 0.70,
      status: 'HYPOTHESIS'
    };

    if (forcedCategory) {
      inferred = {
        primaryCategory: forcedCategory,
        subCategory: subCategory || forcedCategory,
        confidenceScore: 0.90,
        status: 'CONSOLIDATED'
      };
    } else if (eventType === 'ACCEPTED') {
      inferred = {
        primaryCategory: 'STRATEGIC_PREFERENCE',
        subCategory: 'ALIGNED_WITH_MODEL',
        confidenceScore: 0.95,
        status: 'CONSOLIDATED'
      };
    } else if (eventType === 'PARTIAL_PRICE_ADJUSTMENT') {
      inferred = {
        primaryCategory: 'EXTERNAL_CONSTRAINT',
        subCategory: 'OWNER_CONSTRAINT',
        confidenceScore: 0.82,
        status: 'CONSOLIDATED'
      };
    } else if (eventType === 'ACTION_OVERRIDE') {
      inferred = {
        primaryCategory: 'COMMERCIAL_TIMING',
        subCategory: 'PLANNED_DELAY',
        confidenceScore: 0.75,
        status: 'HYPOTHESIS'
      };
    }

    const newLog: DecisionEventLog = {
      eventId: `del_log_${Date.now().toString().slice(-6)}`,
      timestamp: now,
      decisionContext: {
        propertyId: property.id,
        propertyTitle: `${property.title} — ${property.microZone}`,
        agentId: property.mandate?.assignedAgent?.name.toLowerCase().replace(/\s+/g, '_') || 'broker_assigned',
        agencyId: 'agency_pilot_hub',
        objective: 'MAX_LIQUIDITY_60D',
        mandateDaysRemaining: property.mandate?.daysToExpiration || 60
      },
      ratingSnapshot: {
        realEstateRating: property.realEstateRating,
        agencyFitScore: property.agencyFit?.score || 80,
        confidenceScore: property.ratingConfidence || 85,
        dimensions: {
          Property: property.dimensions?.find(d => d.key === 'property')?.score || 75,
          Location: property.dimensions?.find(d => d.key === 'location')?.score || 80,
          Market: property.dimensions?.find(d => d.key === 'market')?.score || 70,
          Economics: property.dimensions?.find(d => d.key === 'economics')?.score || 75
        }
      },
      recommendationIssued: {
        actionType: 'PRICE_REDUCTION',
        currentPrice: property.askingPrice,
        recommendedPrice,
        actionScore: 88,
        predictedProbability60d: Math.min(92, property.estimatedSaleProbability90d + 18)
      },
      observedHumanDecision: {
        eventType,
        appliedPrice,
        deltaVsRecommendation: delta,
        scenarioChosen
      },
      behavioralSignals: [
        {
          signalType: scenarioChosen === 'CUSTOM_SLIDER' ? 'SLIDER_TOLERANCE_TEST' : 'OPEN_COMPARABLES_DRILLDOWN',
          timestamp: now
        }
      ],
      inferredMotivation: inferred,
      outcomeTracking: {
        shortTermProxies: {
          leadsDelta14d: eventType === 'ACCEPTED' ? '+45%' : eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? '+25%' : '-5%',
          visitsScheduled14d: eventType === 'ACCEPTED' ? 5 : eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? 3 : 1,
          priceFeedbackSummary: eventType === 'ACCEPTED' || eventType === 'PARTIAL_PRICE_ADJUSTMENT' ? 'FAIR' : 'EXCESSIVE',
          ctrPortalsDelta14d: eventType === 'ACCEPTED' ? '+35%' : '+12%',
          isPositive: eventType !== 'ACTION_OVERRIDE'
        }
      }
    };

    setDecisionLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  /**
   * Trojan Horse Button: Generates Negotiation Dossier for Owner
   * Automatically emits DOWNLOAD_OWNER_REPORT and consolidates EXTERNAL_CONSTRAINT
   */
  const downloadOwnerReport = (property: PropertyItem) => {
    emitSignal(property.id, 'DOWNLOAD_OWNER_REPORT', {
      source: 'TrojanHorseButton',
      timestamp: new Date().toISOString()
    });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pW = 210;
    const mL = 20;

    // Header banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pW, 36, 'F');
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 36, pW, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('DOSSIER DI NEGOZIAZIONE E CONGRUITÀ PREZZO', mL, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(`Elaborato per la proprietà: ${property.title} • ${property.microZone}`, mL, 26);

    // Body
    let y = 50;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Sintesi Economico-Fisica dell\'Asset', mL, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Prezzo Richiesto Attuale: €${property.askingPrice.toLocaleString()} (${Math.round(property.askingPrice / property.squareMeters)} €/mq)`, mL, y);
    y += 6;
    doc.text(`Valore Congruo di Mercato Stimato: €${(property.estimatedFairValue || property.askingPrice * 0.92).toLocaleString()}`, mL, y);
    y += 6;
    doc.text(`Superficie Commerciale: ${property.squareMeters} mq • Categoria Catastale: ${property.cadastralData?.cadastralCategory || 'A/2'}`, mL, y);
    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Evidenza Comparabili Venduti nel Raggio di 500m', mL, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const comparables = [
      '• Rogito 1 (14gg fa): Immobile simile ristrutturato venduto a €3.650/mq dopo 42gg.',
      '• Rogito 2 (45gg fa): Immobile da ristrutturare venduto a €3.200/mq dopo 65gg.',
      '• Concorrenza Attiva: 4 annunci simili in zona con prezzo medio richiesto €3.550/mq.'
    ];
    comparables.forEach((c) => {
      doc.text(c, mL, y);
      y += 5.5;
    });
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Proposta di Strategia Condivisa', mL, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const recommendedPrice = Math.round(property.askingPrice * 0.91);
    doc.text(`Si raccomanda un riallineamento competitivo a €${recommendedPrice.toLocaleString()} (-9.0%).`, mL, y);
    y += 6;
    doc.text('Impatto stimato: aumento del 45% delle richieste di visita e chiusura entro 60 giorni.', mL, y);

    // Save PDF
    doc.save(`Dossier_Negoziazione_${property.id}.pdf`);
  };

  const getLogsForProperty = (propertyId: string) => {
    return decisionLogs.filter((l) => l.decisionContext.propertyId === propertyId);
  };

  const getLatestLogForProperty = (propertyId: string) => {
    return decisionLogs.find((l) => l.decisionContext.propertyId === propertyId);
  };

  return (
    <DecisionStoreContext.Provider
      value={{
        decisionLogs,
        recordDecision,
        emitSignal,
        updateMotivation,
        downloadOwnerReport,
        getLogsForProperty,
        getLatestLogForProperty
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
