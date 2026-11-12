import React, { useState, useEffect } from 'react';
import { Sidebar } from './layouts/Sidebar';
import { Header } from './layouts/Header';
import { RightSidebar } from './layouts/RightSidebar';
import { FaultInjectionModal } from './components/FaultInjectionModal';
import { useTrafficStream } from './hooks/useTrafficStream';
import { api } from './services/api';
import { NavTab, SensorState, Corridor } from './types';

// Pages
import { CommandCenterPage } from './pages/CommandCenterPage';
import { LiveTrafficMapPage } from './pages/LiveTrafficMapPage';
import { RouteIntelligencePage } from './pages/RouteIntelligencePage';
import { CorridorMonitoringPage } from './pages/CorridorMonitoringPage';
import { TrafficForecastingPage } from './pages/TrafficForecastingPage';
import { EdgeIntelligencePage } from './pages/EdgeIntelligencePage';
import { FogNetworkPage } from './pages/FogNetworkPage';
import { MLLaboratoryPage } from './pages/MLLaboratoryPage';
import { BigDataAnalyticsPage } from './pages/BigDataAnalyticsPage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { SystemObservabilityPage } from './pages/SystemObservabilityPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('command-center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [faultModalOpen, setFaultModalOpen] = useState<boolean>(false);
  const [selectedSensor, setSelectedSensor] = useState<SensorState | null>(null);
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [awsMode, setAwsMode] = useState<string>('AWS_MODE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real-time telemetry via WebSocket
  const streamData = useTrafficStream();

  // Load corridors & summary metadata on start
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [c, s] = await Promise.all([
          api.getCorridors(),
          api.getCommandCenterSummary()
        ]);
        setCorridors(c);
        if (s?.aws_mode) {
          setAwsMode(s.aws_mode);
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    }
    loadInitialData();
  }, []);

  const handleSelectSensor = (sensor: SensorState | null) => {
    setSelectedSensor(sensor);
    if (sensor && currentTab !== 'live-map') {
      setCurrentTab('live-map');
    }
  };

  const handleSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    // Check if query matches a corridor
    const matchedCorridor = corridors.find(c => 
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
    if (matchedCorridor) {
      setCurrentTab('corridors');
      return;
    }

    // Check if query matches a sensor
    const matchedSensor = streamData.sensors.find(s => 
      s.sensor_id.toLowerCase().includes(q) || s.intersection_name.toLowerCase().includes(q)
    );
    if (matchedSensor) {
      handleSelectSensor(matchedSensor);
      return;
    }

    // Otherwise navigate to live map
    setCurrentTab('live-map');
  };

  const activeAlerts = streamData.alerts.filter((a) => a.status === 'ACTIVE');

  const tabTitles: Record<NavTab, string> = {
    'command-center': 'Command Center',
    'live-map': 'Traffic Map',
    'routes': 'Route Intelligence',
    'corridors': 'Corridor Monitor',
    'forecasting': 'ML Forecasting',
    'edge': 'Edge Intelligence',
    'fog': 'Fog Network',
    'ml-lab': 'ML Laboratory',
    'big-data': 'Data Lake Analytics',
    'alerts': 'Alert Center',
    'observability': 'System Health'
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-slate-800 font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeAlertsCount={activeAlerts.length}
      />

      {/* 2. Middle Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-canvas">
        {/* Top Header */}
        <Header
          currentTabName={tabTitles[currentTab] || 'Dashboard'}
          isConnected={streamData.isConnected}
          awsMode={awsMode}
          ticks={streamData.summary.ticks}
          onOpenFaultInjection={() => setFaultModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto px-8 pt-6 pb-8 custom-scrollbar">
          {currentTab === 'command-center' && (
            <CommandCenterPage
              sensors={streamData.sensors}
              fogZones={streamData.fog_zones}
              corridors={corridors}
              alerts={streamData.alerts}
              summary={streamData.summary}
              onNavigate={setCurrentTab}
              onSelectSensor={handleSelectSensor}
            />
          )}

          {currentTab === 'live-map' && (
            <LiveTrafficMapPage
              sensors={streamData.sensors}
              corridors={corridors}
              selectedSensor={selectedSensor}
              onSelectSensor={handleSelectSensor}
            />
          )}

          {currentTab === 'routes' && <RouteIntelligencePage />}

          {currentTab === 'corridors' && (
            <CorridorMonitoringPage
              corridors={corridors}
              sensors={streamData.sensors}
              onSelectSensor={handleSelectSensor}
            />
          )}

          {currentTab === 'forecasting' && (
            <TrafficForecastingPage
              corridors={corridors}
              sensors={streamData.sensors}
            />
          )}

          {currentTab === 'edge' && <EdgeIntelligencePage />}

          {currentTab === 'fog' && <FogNetworkPage />}

          {currentTab === 'ml-lab' && <MLLaboratoryPage />}

          {currentTab === 'big-data' && <BigDataAnalyticsPage />}

          {currentTab === 'alerts' && <AlertCenterPage />}

          {currentTab === 'observability' && <SystemObservabilityPage />}
        </main>
      </div>

      {/* 3. Right Sidebar - Profile & Operational Dispatch Feed (matching reference image) */}
      <RightSidebar
        sensorsCount={streamData.sensors.length || 30}
        awsMode={awsMode}
        alerts={streamData.alerts}
        onOpenFaultInjection={() => setFaultModalOpen(true)}
        onNavigate={setCurrentTab}
      />

      {/* Interactive Fault & Incident Injection Modal */}
      <FaultInjectionModal
        isOpen={faultModalOpen}
        onClose={() => setFaultModalOpen(false)}
        corridors={corridors}
        sensors={streamData.sensors}
      />
    </div>
  );
};

export default App;
