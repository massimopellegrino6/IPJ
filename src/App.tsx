import React, { useState, useMemo } from 'react';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/views/OverviewView';
import { OpportunitiesView } from './components/views/OpportunitiesView';
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

import { 
  PROPERTIES_DATABASE, 
  DECISION_CENTER_TASKS, 
  DECISION_HISTORY_DATA, 
  TERRITORY_METRICS 
} from './data/mockIntelligenceDatabase';
import { PropertyItem, SubDimension, ActionScenario, DecisionTask, DecisionHistoryItem } from './types/intelligence';
import { CheckCircle2 } from 'lucide-react';

const PROTOTYPE_VERSION = 'v0.1';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainNavTab>('overview');

  // Database State
  const [properties, setProperties] = useState<PropertyItem[]>(PROPERTIES_DATABASE);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem>(PROPERTIES_DATABASE[0]);
  const [decisionTasks, setDecisionTasks] = useState<DecisionTask[]>(DECISION_CENTER_TASKS);
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryItem[]>(DECISION_HISTORY_DATA);

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
  const handleConfirmDecision = (
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
      executedBy: 'Marco Rossi (Responsabile Acquisizioni)',
      timestamp: 'Adesso',
      confidenceScore: selectedProperty.ratingConfidence
    };

    setDecisionHistory(prev => [newLog, ...prev]);

    // Also remove task from Decision Center if matching
    setDecisionTasks(prev => prev.filter(t => t.propertyId !== selectedProperty.id));

    const decisionLabel = type === 'ACCEPTED' ? 'Accettata' : type === 'MODIFIED' ? 'Modificata' : 'Rifiutata';
    setToastMessage(`Decisione demo registrata: ${decisionLabel} • Stato del prototipo aggiornato`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick execution from Decision Center
  const handleExecuteTask = (
    taskId: string,
    actionType: 'ACCEPTED' | 'MODIFIED' | 'DECLINED',
    notes?: string
  ) => {
    const task = decisionTasks.find(t => t.id === taskId);
    if (!task) return;

    const newLog: DecisionHistoryItem = {
      id: `hist_${Date.now()}`,
      propertyId: task.propertyId,
      propertyTitle: task.propertyTitle,
      decisionType: actionType,
      recommendedAction: task.recommendation,
      executedPrice: 349000,
      humanNotes: notes || `Azione rapida: ${actionType}`,
      executedBy: 'Marco Rossi (Responsabile Acquisizioni)',
      timestamp: 'Adesso',
      confidenceScore: task.confidence
    };

    setDecisionHistory(prev => [newLog, ...prev]);
    setDecisionTasks(prev => prev.filter(t => t.id !== taskId));

    const actionLabel = actionType === 'ACCEPTED' ? 'Accettata' : actionType === 'MODIFIED' ? 'Modificata' : 'Rifiutata';
    setToastMessage(`Decisione ${actionLabel}: ${task.propertyTitle} registrata nel log di audit`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Compare Modal
  const handleCompareProperties = (selectedList: PropertyItem[]) => {
    setPropertiesToCompare(selectedList);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* 1. Compact Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        decisionCount={decisionTasks.length}
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

          {activeTab === 'property_intelligence' && (
            <PropertyIntelligenceView
              property={selectedProperty}
              allProperties={properties}
              onSelectProperty={handleSelectProperty}
              onOpenExplainability={handleOpenExplainability}
              onOpenDecisionModal={handleOpenDecisionModal}
              onBack={() => setActiveTab('opportunities')}
            />
          )}

          {activeTab === 'decision_center' && (
            <DecisionCenterView
              tasks={decisionTasks}
              history={decisionHistory}
              properties={properties}
              onSelectProperty={handleSelectProperty}
              onExecuteTask={handleExecuteTask}
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
            <AnalyticsView />
          )}

          {activeTab === 'data_integrations' && (
            <DataIntegrationsView />
          )}

          {activeTab === 'methodology' && (
            <MethodologyView />
          )}

          {(activeTab === 'organization' || activeTab === 'settings') && (
            <OrganizationSettingsView mode={activeTab === 'organization' ? 'organization' : 'settings'} />
          )}
        </main>
      </div>

      <div className="fixed bottom-4 left-4 z-50 rounded-full border border-amber-400/40 bg-amber-950/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-xl backdrop-blur-sm">
        Prototype {PROTOTYPE_VERSION} · Dati e integrazioni simulati
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
    </div>
  );
}
