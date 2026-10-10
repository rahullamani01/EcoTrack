import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SyncProvider, useSync } from './context/SyncContext';
import { Navbar, ActiveScreen } from './components/Navbar';
import { Footer } from './components/Footer';
import { OfflineBanner } from './components/OfflineBanner';
import { AuthModal } from './components/AuthModal';
import { ExportModal } from './components/ExportModal';
import { FacilityReportModal } from './components/FacilityReportModal';
import { EventRegisterModal } from './components/EventRegisterModal';

import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { ChallengesView } from './views/ChallengesView';
import { InitiativesView } from './views/InitiativesView';
import { EventsView } from './views/EventsView';
import { ProfileView } from './views/ProfileView';
import { CampusMapView } from './views/CampusMapView';
import { EcoGuideView } from './views/EcoGuideView';
import { WasteSortingView } from './views/WasteSortingView';
import { SustainabilityReportsView } from './views/SustainabilityReportsView';
import { TreeMonitoringView } from './views/TreeMonitoringView';

import { CampusEvent, DateRangeFilter } from './types';

const MainApp: React.FC = () => {
  const { metrics, benchmarks } = useSync();

  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<DateRangeFilter>({
    preset: 'semester',
    startDate: 'Aug 25, 2025',
    endDate: 'Dec 18, 2025',
    label: 'Fall Semester 2025',
  });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenExport = (dateRange: DateRangeFilter) => {
    setExportDateRange(dateRange);
    setExportModalOpen(true);
  };

  const handleSelectEvent = (event: CampusEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface transition-colors duration-200">
      {/* Sticky Top Header Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Container with offset for fixed header */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {/* Offline & Real-Time Synchronization Banner */}
        <OfflineBanner />

        {/* View Routing */}
        {currentScreen === 'home' && (
          <HomeView
            onNavigate={setCurrentScreen}
            onOpenAuth={handleOpenAuth}
            onOpenReportModal={() => setReportModalOpen(true)}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {currentScreen === 'ecoguide' && (
          <EcoGuideView />
        )}

        {currentScreen === 'waste-sorting' && (
          <WasteSortingView />
        )}

        {currentScreen === 'reports' && (
          <SustainabilityReportsView onOpenExportModal={handleOpenExport} />
        )}

        {currentScreen === 'trees' && (
          <TreeMonitoringView />
        )}

        {currentScreen === 'campus-map' && (
          <CampusMapView onOpenReportModal={() => setReportModalOpen(true)} />
        )}

        {currentScreen === 'campus-impact' && (
          <DashboardView
            onOpenExportModal={handleOpenExport}
            onOpenReportModal={() => setReportModalOpen(true)}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'challenges' && (
          <ChallengesView onOpenAuth={handleOpenAuth} />
        )}

        {currentScreen === 'initiatives' && (
          <InitiativesView
            onOpenReportModal={() => setReportModalOpen(true)}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'events' && (
          <EventsView
            onSelectEvent={handleSelectEvent}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileView onOpenAuth={handleOpenAuth} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setCurrentScreen} onOpenAuth={handleOpenAuth} />

      {/* Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        metrics={metrics}
        benchmarks={benchmarks}
        dateRange={exportDateRange}
      />

      <FacilityReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <EventRegisterModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <MainApp />
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
