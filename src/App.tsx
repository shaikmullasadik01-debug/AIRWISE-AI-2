import { Suspense, lazy } from 'react';
import { useAirwiseState } from './hooks/useAirwiseState.ts';
import { WorkspaceLayout } from './components/WorkspaceLayout.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';

const AssistantPage = lazy(() =>
  import('./pages/AssistantPage.tsx').then((m) => ({ default: m.AssistantPage }))
);
const RoutinePage = lazy(() =>
  import('./pages/RoutinePage.tsx').then((m) => ({ default: m.RoutinePage }))
);
const IndoorPage = lazy(() =>
  import('./pages/IndoorPage.tsx').then((m) => ({ default: m.IndoorPage }))
);
const SustainabilityPage = lazy(() =>
  import('./pages/SustainabilityPage.tsx').then((m) => ({ default: m.SustainabilityPage }))
);
const CalculatorPage = lazy(() =>
  import('./pages/CalculatorPage.tsx').then((m) => ({ default: m.CalculatorPage }))
);
const InsightsPage = lazy(() =>
  import('./pages/InsightsPage.tsx').then((m) => ({ default: m.InsightsPage }))
);
const CommunityPage = lazy(() =>
  import('./pages/CommunityPage.tsx').then((m) => ({ default: m.CommunityPage }))
);
const NotificationsPage = lazy(() =>
  import('./pages/NotificationsPage.tsx').then((m) => ({ default: m.NotificationsPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage.tsx').then((m) => ({ default: m.SettingsPage }))
);

export default function App() {
  const {
    activePage,
    location,
    snapshot,
    loadingFeed,
    profile,
    indoorTasks,
    alternatives,
    savedGreeneryTipIds,
    joinedChallenges,
    calcInput,
    alertPrefs,
    completedRoutinePeriods,
    alerts,
    unreadAlertsCount,
    indoorProgressPercent,
    sustainabilityScore,
    calcResult,
    navigate,
    setLocation,
    refreshFeed,
    togglePeriod,
    toggleTask,
    toggleAdopted,
    toggleSavedGreeneryTip,
    toggleJoinChallenge,
    setCalcInput,
    setAlertPrefs,
    markAlertRead,
    markAllAlertsRead,
    updateProfile,
    importPreferences,
    clearAllData,
  } = useAirwiseState();

  if (activePage === 'landing') {
    return (
      <ErrorBoundary onReset={() => navigate('dashboard')}>
        <LandingPage snapshot={snapshot} onNavigate={navigate} />
      </ErrorBoundary>
    );
  }

  return (
    <WorkspaceLayout
      activePage={activePage}
      onNavigate={navigate}
      location={location}
      unreadAlertsCount={unreadAlertsCount}
    >
      <ErrorBoundary onReset={() => navigate('dashboard')}>
        <Suspense
          fallback={
            <output className="block rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
              Loading module...
            </output>
          }
        >
          {activePage === 'dashboard' && (
            <DashboardPage
              snapshot={snapshot}
              loading={loadingFeed}
              indoorProgressPercent={indoorProgressPercent}
              sustainabilityScore={sustainabilityScore}
              weeklyCo2SavedKg={calcResult.weeklySavingsKg}
              onSelectLocation={setLocation}
              onRefresh={refreshFeed}
              onNavigate={navigate}
            />
          )}

          {activePage === 'assistant' && <AssistantPage snapshot={snapshot} profile={profile} />}

          {activePage === 'routine' && (
            <RoutinePage
              snapshot={snapshot}
              profile={profile}
              completedPeriods={completedRoutinePeriods}
              onTogglePeriod={togglePeriod}
              onNavigate={navigate}
            />
          )}

          {activePage === 'indoor' && (
            <IndoorPage snapshot={snapshot} tasks={indoorTasks} onToggleTask={toggleTask} />
          )}

          {activePage === 'sustainability' && (
            <SustainabilityPage
              snapshot={snapshot}
              alternatives={alternatives}
              savedGreeneryTipIds={savedGreeneryTipIds}
              onToggleAdopted={toggleAdopted}
              onToggleSavedGreeneryTip={toggleSavedGreeneryTip}
              onApplyCarbonPreset={(patch) => setCalcInput((prev) => ({ ...prev, ...patch }))}
              onNavigate={navigate}
            />
          )}

          {activePage === 'calculator' && (
            <CalculatorPage
              input={calcInput}
              onChangeInput={setCalcInput}
              onResetInput={() =>
                setCalcInput((prev) => ({
                  carKmReplacedByTransitPerWeek: 30,
                  carKmCarpoolPerWeek: 16,
                  carKmReplacedByWalkCyclePerWeek: 8,
                  electricitySavedKwhPerWeek: 10,
                  ledBulbsReplacedCount: 4,
                  wasteReducedKgPerWeek: 3,
                  gridRegion: prev.gridRegion,
                  householdSize: prev.householdSize,
                }))
              }
            />
          )}

          {activePage === 'insights' && <InsightsPage snapshot={snapshot} />}

          {activePage === 'community' && (
            <CommunityPage
              snapshot={snapshot}
              joinedChallengeIds={joinedChallenges}
              onToggleJoinChallenge={toggleJoinChallenge}
            />
          )}

          {activePage === 'notifications' && (
            <NotificationsPage
              alerts={alerts}
              preferences={alertPrefs}
              onMarkRead={markAlertRead}
              onMarkAllRead={markAllAlertsRead}
              onUpdatePreferences={setAlertPrefs}
              onNavigate={navigate}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              profile={profile}
              calcInput={calcInput}
              alertPrefs={alertPrefs}
              onUpdateProfile={updateProfile}
              onImportPreferences={importPreferences}
              onClearAllData={clearAllData}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </WorkspaceLayout>
  );
}
