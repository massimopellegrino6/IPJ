import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/views/OverviewView';
import { OpportunitiesView } from './components/views/OpportunitiesView';
import { PropertiesView } from './components/views/PropertiesView';
import { PropertyIntelligenceView } from './components/views/PropertyIntelligenceView';
import { DecisionCenterView } from './components/views/DecisionCenterView';
import { MarketIntelligenceView } from './components/views/MarketIntelligenceView';
import { PortfolioView } from './components/views/PortfolioView';
import { ClientsCrmView } from './components/views/ClientsCrmView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { DataIntegrationsView } from './components/views/DataIntegrationsView';
import { MethodologyView } from './components/views/MethodologyView';
import { OrganizationSettingsView } from './components/views/OrganizationSettingsView';

import { ExplainabilityDrawer } from './components/ExplainabilityDrawer';
import { HumanDecisionModal } from './components/HumanDecisionModal';
import { CompareOpportunitiesModal } from './components/CompareOpportunitiesModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { ProxyReviewModal } from './components/ProxyReviewModal';
import { FinalOutcomeModal } from './components/FinalOutcomeModal';
import { useDecisionStore } from './context/DecisionStoreContext';

import { 
  PROPERTIES_DATABASE, 
  DECISION_CENTER_TASKS, 
  DECISION_HISTORY_DATA, 
  TERRITORY_METRICS 
} from './data/mockIntelligenceDatabase';
import { PropertyItem, SubDimension, ActionScenario, DecisionTask, DecisionHistoryItem } from './types/intelligence';
import { CheckCircle2, Cloud } from 'lucide-react';
import { useFirebase } from './context/FirebaseContext';

export default function App() {
  // Cloud Database Context
  const {
    user,
    isCloudConnected,
    syncState,
    cloudProperties,
    cloudTasks,
    cloudHistory,
    saveProperty,
    updateProperty,
    saveDecisionTask,
    saveDecisionHistoryItem
  } = useFirebase();

  // Navigation State
  const [activeTab, setActiveTab] = useState<MainNavTab>('overview');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'NORTH_STAR' | 'TWO_STAGE_OUTCOMES' | 'EFFORT_ATTRIBUTION' | 'MODEL_SEGREGATION'>('NORTH_STAR');

  // Database State - Backed by Cloud Firestore
  const properties = cloudProperties;
  const decisionTasks = cloudTasks;
  const decisionHistory = cloudHistory;
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem>(properties[0] || PROPERTIES_DATABASE[0]);

  // Keep selectedProperty updated if property details change in cloud
  useEffect(() => {
    if (properties.length > 0) {
      const match = properties.find(p => p.id === selectedProperty.id);
      if (match) {
        setSelectedProperty(match);
      } else if (!selectedProperty || !properties.some(p => p.id === selectedProperty.id)) {
        setSelectedProperty(properties[0]);
      }
    }
  }, [properties]);

  // Global Header Filter State
  const [selectedTerritory, setSelectedTerritory] = useState<string>('Tutti i Territori');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q3 2026 (Attivo)');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals and Drawers
  const [isExplainabilityOpen, setIsExplainabilityOpen] = useState<boolean>(false);
  const [selectedDimensionKey, setSelectedDimensionKey] = useState<string | null>(null);
  const [selectedSubDimension, setSelectedSubDimension] = useState<SubDimension | null>(null);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [targetScenarioForModal, setTargetScenarioForModal] = useState<ActionScenario | null>(null);

  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [propertiesToCompare, setPropertiesToCompare] = useState<PropertyItem[]>([]);

  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Decision Loop: Step 2 Checkpoint 14-21d & Step 3 Final Outcome Modals
  const { 
    decisionLogs,
    activeReviewProperty, 
    closeProxyReviewModal,
    activeFinalOutcomeProperty,
    closeFinalOutcomeModal
  } = useDecisionStore();

  // Sincronizzazione dinamica dei task con il DecisionEventLog globale (§1 Specifica)
  // Quando un task ha un log deliberato in decisionLogs (es. task_03 per Via Nomentana 221), il suo stato diventa DELIBERATED
  const effectiveDecisionTasks = useMemo(() => {
    return decisionTasks.map((task) => {
      const isDeliberatedInLogs = decisionLogs.some(
        (l) => l.decisionContext.propertyId === task.propertyId && 
               l.observedHumanDecision && 
               l.observedHumanDecision.eventType && 
               l.observedHumanDecision.eventType !== 'IGNORED'
      );
      if (isDeliberatedInLogs || task.status === 'DELIBERATED') {
        return {
          ...task,
          status: 'DELIBERATED' as const,
          actionScore: task.propertyId === 'prop_rm_nomentana_221' ? 88 : task.actionScore,
          confidence: task.propertyId === 'prop_rm_nomentana_221' ? 90 : task.confidence
        };
      }
      return task;
    });
  }, [decisionTasks, decisionLogs]);

  // Delibere pendenti: solo task in stato PENDING
  const pendingDecisionTasks = useMemo(() => {
    return effectiveDecisionTasks.filter((t) => t.status === 'PENDING');
  }, [effectiveDecisionTasks]);

  // Filtered properties based on territory selector and search query
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (selectedTerritory !== 'Tutti i Territori' && selectedTerritory !== 'All Territories' && p.city !== selectedTerritory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.microZone.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [properties, selectedTerritory, searchQuery]);

  // Open Property Intelligence view for an asset
  const handleSelectProperty = (prop: PropertyItem) => {
    setSelectedProperty(prop);
    setActiveTab('property_intelligence');
  };

  // Trigger Explainability Drawer
  const handleOpenExplainability = (dimensionKey: string, sub?: SubDimension) => {
    setSelectedDimensionKey(dimensionKey);
    setSelectedSubDimension(sub || null);
    setIsExplainabilityOpen(true);
  };

  // Trigger Decision Modal
  const handleOpenDecisionModal = (scenario: ActionScenario) => {
    setTargetScenarioForModal(scenario);
    setIsDecisionModalOpen(true);
  };

  // Confirm Human Decision (AI recommends -> Human decides -> System learns)
  const handleConfirmDecision = async (
    type: 'ACCEPTED' | 'MODIFIED' | 'DECLINED',
    notes: string,
    customPrice?: number
  ) => {
    const newLog: DecisionHistoryItem = {
      id: `hist_${Date.now()}`,
      propertyId: selectedProperty.id,
      propertyTitle: selectedProperty.title,
      decisionType: type,
      recommendedAction: targetScenarioForModal?.label || 'Raccomandazione Strategica',
      executedPrice: customPrice || targetScenarioForModal?.targetPrice || selectedProperty.askingPrice,
      humanNotes: notes,
      executedBy: user?.displayName || 'Marco Rossi (Responsabile Acquisizioni)',
      timestamp: 'Adesso',
      confidenceScore: selectedProperty.ratingConfidence
    };

    await saveDecisionHistoryItem(newLog);

    // Also update task status in Decision Center to DELIBERATED
    const currentTask = decisionTasks.find(t => t.propertyId === selectedProperty.id);
    if (currentTask) {
      await saveDecisionTask({
        ...currentTask,
        status: 'DELIBERATED' as const
      });
    }

    const decisionLabel = type === 'ACCEPTED' ? 'Accettata' : type === 'MODIFIED' ? 'Modificata' : 'Rifiutata';
    setToastMessage(`Decisione salvata su Cloud Firestore: ${decisionLabel} (Task DELIBERATED)`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick execution from Decision Center
  const handleExecuteTask = async (
    taskId: string,
    actionType: 'ACCEPTED' | 'MODIFIED' | 'DECLINED',
    notes?: string
  ) => {
    const task = effectiveDecisionTasks.find(t => t.id === taskId);
    if (!task) return;

    const newLog: DecisionHistoryItem = {
      id: `hist_${Date.now()}`,
      propertyId: task.propertyId,
      propertyTitle: task.propertyTitle,
      decisionType: actionType,
      recommendedAction: task.recommendedAction,
      executedPrice: 349000,
      humanNotes: notes || `Azione rapida: ${actionType}`,
      executedBy: user?.displayName || 'Marco Rossi (Responsabile Acquisizioni)',
      timestamp: 'Adesso',
      confidenceScore: task.confidence
    };

    await saveDecisionHistoryItem(newLog);
    await saveDecisionTask({
      ...task,
      status: 'DELIBERATED' as const
    });

    const actionLabel = actionType === 'ACCEPTED' ? 'Accettata' : actionType === 'MODIFIED' ? 'Modificata' : 'Rifiutata';
    setToastMessage(`Decisione salvata su Cloud: ${task.propertyTitle} -> DELIBERATED`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Compare Modal
  const handleCompareProperties = (selectedList: PropertyItem[]) => {
    setPropertiesToCompare(selectedList);
    setIsCompareModalOpen(true);
  };

  // Add new property to master database - Persisted to Cloud Firestore
  const handleAddProperty = async (newProp: PropertyItem) => {
    await saveProperty(newProp);
    setSelectedTerritory('Tutti i Territori');
    setSelectedProperty(newProp);
    setActiveTab('property_intelligence');
    setToastMessage(`Nuovo immobile ${newProp.code} (${newProp.city}) censito e salvato in Cloud Firestore!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Update existing property in master database (e.g. from Cadastral Audit) - Persisted to Cloud Firestore
  const handleUpdateProperty = async (updatedProp: PropertyItem) => {
    await updateProperty(updatedProp);
    setSelectedProperty(updatedProp);
    setToastMessage(`Audit Catastale validato e salvato in Cloud Firestore per ${updatedProp.code}!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* 1. Compact Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        decisionCount={pendingDecisionTasks.length}
      />

      {/* 2. Main Execution Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-x-hidden">
        {/* Header with Global Search, Territory & Period Filter, AI trigger */}
        <Header
          selectedTerritory={selectedTerritory}
          onTerritoryChange={setSelectedTerritory}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAssistant={() => setIsAssistantOpen(true)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-200">{toastMessage}</span>
          </div>
        )}

        {/* Content View Router */}
        <main className="flex-1 pb-16">
          {activeTab === 'overview' && (
            <OverviewView
              properties={filteredProperties}
              onSelectProperty={handleSelectProperty}
              onNavigateToDecisions={() => setActiveTab('decision_center')}
              onNavigateToOpportunities={() => setActiveTab('opportunities')}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesView
              properties={filteredProperties}
              onSelectProperty={handleSelectProperty}
              onCompareProperties={handleCompareProperties}
            />
          )}

          {activeTab === 'properties' && (
            <PropertiesView
              properties={filteredProperties}
              onSelectProperty={handleSelectProperty}
              onAddProperty={handleAddProperty}
              onUpdateProperty={handleUpdateProperty}
            />
          )}

          {activeTab === 'property_intelligence' && (
            <PropertyIntelligenceView
              property={selectedProperty}
              allProperties={properties}
              onSelectProperty={handleSelectProperty}
              onOpenExplainability={handleOpenExplainability}
              onOpenDecisionModal={handleOpenDecisionModal}
              onBack={() => setActiveTab('opportunities')}
              onUpdateProperty={handleUpdateProperty}
            />
          )}

          {activeTab === 'decision_center' && (
            <DecisionCenterView
              tasks={effectiveDecisionTasks}
              history={decisionHistory}
              properties={properties}
              onSelectProperty={handleSelectProperty}
              onExecuteTask={handleExecuteTask}
              onNavigateToAnalytics={(subTab = 'TWO_STAGE_OUTCOMES') => {
                setAnalyticsSubTab(subTab);
                setActiveTab('analytics');
              }}
            />
          )}

          {activeTab === 'market_intelligence' && (
            <MarketIntelligenceView
              territories={TERRITORY_METRICS}
              selectedTerritory={selectedTerritory}
              onSelectTerritory={setSelectedTerritory}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioView
              properties={filteredProperties}
              onSelectProperty={handleSelectProperty}
            />
          )}

          {activeTab === 'clients_demand' && (
            <ClientsCrmView
              properties={properties}
              onSelectProperty={handleSelectProperty}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView initialTab={analyticsSubTab} />
          )}

          {activeTab === 'data_integrations' && (
            <DataIntegrationsView />
          )}

          {activeTab === 'methodology' && (
            <MethodologyView />
          )}

          {(activeTab === 'organization' || activeTab === 'settings') && (
            <OrganizationSettingsView 
              mode={activeTab === 'organization' ? 'organization' : 'settings'} 
              properties={properties}
            />
          )}
        </main>
      </div>

      <div className="fixed bottom-4 left-4 z-50 rounded-full border border-emerald-500/40 bg-slate-950/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 shadow-xl backdrop-blur-sm flex items-center gap-2">
        <Cloud className="w-3.5 h-3.5 text-emerald-400" />
        <span>Database Cloud: {user ? 'Firestore Sincronizzato & Persistente' : 'Firestore Attivo (Modalità Ibrida)'}</span>
      </div>

      {/* 3. Explainability Drawer */}
      <ExplainabilityDrawer
        isOpen={isExplainabilityOpen}
        onClose={() => setIsExplainabilityOpen(false)}
        property={selectedProperty}
        selectedDimensionKey={selectedDimensionKey}
        selectedSubDimension={selectedSubDimension}
        onNavigateToMethodology={() => {
          setIsExplainabilityOpen(false);
          setActiveTab('methodology');
        }}
      />

      {/* 4. Human Decision Modal */}
      {targetScenarioForModal && (
        <HumanDecisionModal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          property={selectedProperty}
          scenario={targetScenarioForModal}
          onConfirmDecision={handleConfirmDecision}
        />
      )}

      {/* 5. Compare Opportunities Modal */}
      <CompareOpportunitiesModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        properties={propertiesToCompare}
        onSelectProperty={handleSelectProperty}
      />

      {/* 6. AI Decision Co-pilot Drawer */}
      <AiAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        properties={properties}
        onSelectProperty={handleSelectProperty}
      />

      {/* 7. Step 2 Decision Loop: Checkpoint 14-21d Reconciliation Modal */}
      {activeReviewProperty && (
        <ProxyReviewModal
          property={activeReviewProperty}
          onClose={closeProxyReviewModal}
          onNavigateToSimulator={() => {
            setSelectedProperty(activeReviewProperty);
            setActiveTab('decision_center');
          }}
        />
      )}

      {/* 8. Step 3 Decision Loop: Final Outcome & Effort-Adjusted Attribution Modal */}
      {activeFinalOutcomeProperty && (
        <FinalOutcomeModal
          property={activeFinalOutcomeProperty}
          onClose={closeFinalOutcomeModal}
        />
      )}
    </div>
  );
}
