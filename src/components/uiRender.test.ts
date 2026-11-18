import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildDemoFallbackSnapshot, DEFAULT_CITY } from '../data/presets.ts';
import {
  buildSmartAlerts,
  getGreeneryTips,
  getInitialIndoorChecklist,
  getInitialLifestyleAlternatives,
} from '../lib/recommendations.ts';
import { DEFAULT_ALERT_PREFS, DEFAULT_CALC_INPUT, DEFAULT_PROFILE } from '../hooks/useAirwiseState.ts';
import { LandingPage } from '../pages/LandingPage.tsx';
import { DashboardPage } from '../pages/DashboardPage.tsx';
import { AssistantPage } from '../pages/AssistantPage.tsx';
import { RoutinePage } from '../pages/RoutinePage.tsx';
import { IndoorPage } from '../pages/IndoorPage.tsx';
import { SustainabilityPage } from '../pages/SustainabilityPage.tsx';
import { CalculatorPage } from '../pages/CalculatorPage.tsx';
import { InsightsPage } from '../pages/InsightsPage.tsx';
import { CommunityPage } from '../pages/CommunityPage.tsx';
import { NotificationsPage } from '../pages/NotificationsPage.tsx';
import { SettingsPage } from '../pages/SettingsPage.tsx';
import { WorkspaceLayout } from '../components/WorkspaceLayout.tsx';
import { AccessibleHourlyTable } from '../components/AccessibleHourlyTable.tsx';
import { AqiStatusBadge } from '../components/AqiBadge.tsx';
import { DataStatusBanner } from '../components/DataStatusBanner.tsx';
import { ErrorBoundary } from '../components/ErrorBoundary.tsx';

const noop = () => {};

function assertCleanRender(html: string, label: string) {
  assert.ok(html.length > 50, `${label} rendered unexpectedly empty markup`);
  assert.equal(html.includes('NaN'), false, `${label} rendered NaN`);
  assert.equal(html.includes('undefined'), false, `${label} rendered undefined`);
}

test('All workspace pages and landing view render cleanly without NaN or undefined and include a11y landmarks', () => {
  const snapshot = buildDemoFallbackSnapshot(DEFAULT_CITY);
  const tasks = getInitialIndoorChecklist();
  const alternatives = getInitialLifestyleAlternatives();
  const alerts = buildSmartAlerts(snapshot);

  const landingHtml = renderToStaticMarkup(
    createElement(LandingPage, { snapshot, onNavigate: noop })
  );
  assertCleanRender(landingHtml, 'LandingPage');
  assert.ok(landingHtml.includes('id="main-content"'));
  assert.ok(landingHtml.includes('tabindex="-1"') || landingHtml.includes('tabIndex="-1"'));
  assert.ok(landingHtml.includes('<h1'));
  assert.ok(landingHtml.includes('alt="'));
  assert.equal(landingHtml.includes('text-[#20C997]'), false);

  const pages: Array<[string, string]> = [
    [
      'DashboardPage',
      renderToStaticMarkup(
        createElement(DashboardPage, {
          snapshot,
          loading: false,
          indoorProgressPercent: 40,
          sustainabilityScore: 50,
          weeklyCo2SavedKg: 12.4,
          onSelectLocation: noop,
          onRefresh: noop,
          onNavigate: noop,
        })
      ),
    ],
    [
      'AssistantPage',
      renderToStaticMarkup(
        createElement(AssistantPage, { snapshot, profile: DEFAULT_PROFILE })
      ),
    ],
    [
      'RoutinePage',
      renderToStaticMarkup(
        createElement(RoutinePage, {
          snapshot,
          profile: DEFAULT_PROFILE,
          completedPeriods: ['Morning'],
          onTogglePeriod: noop,
          onNavigate: noop,
        })
      ),
    ],
    [
      'IndoorPage',
      renderToStaticMarkup(
        createElement(IndoorPage, { snapshot, tasks, onToggleTask: noop })
      ),
    ],
    [
      'SustainabilityPage',
      renderToStaticMarkup(
        createElement(SustainabilityPage, {
          snapshot,
          alternatives,
          savedGreeneryTipIds: ['tip-balcony-shade'],
          onToggleAdopted: noop,
          onToggleSavedGreeneryTip: noop,
          onApplyCarbonPreset: noop,
          onNavigate: noop,
        })
      ),
    ],
    [
      'CalculatorPage',
      renderToStaticMarkup(
        createElement(CalculatorPage, {
          input: DEFAULT_CALC_INPUT,
          onChangeInput: noop,
          onResetInput: noop,
        })
      ),
    ],
    [
      'InsightsPage',
      renderToStaticMarkup(createElement(InsightsPage, { snapshot })),
    ],
    [
      'CommunityPage',
      renderToStaticMarkup(
        createElement(CommunityPage, {
          snapshot,
          joinedChallengeIds: ['chal-transit'],
          onToggleJoinChallenge: noop,
        })
      ),
    ],
    [
      'NotificationsPage',
      renderToStaticMarkup(
        createElement(NotificationsPage, {
          alerts,
          preferences: DEFAULT_ALERT_PREFS,
          onMarkRead: noop,
          onMarkAllRead: noop,
          onUpdatePreferences: noop,
          onNavigate: noop,
        })
      ),
    ],
    [
      'SettingsPage',
      renderToStaticMarkup(
        createElement(SettingsPage, {
          profile: DEFAULT_PROFILE,
          calcInput: DEFAULT_CALC_INPUT,
          alertPrefs: DEFAULT_ALERT_PREFS,
          onUpdateProfile: noop,
          onImportPreferences: noop,
          onClearAllData: noop,
        })
      ),
    ],
  ];

  for (const [name, html] of pages) {
    assertCleanRender(html, name);
  }

  const sustainabilityHtml = pages.find(([n]) => n === 'SustainabilityPage')?.[1] ?? '';
  assert.ok(sustainabilityHtml.includes('role="tablist"'));
  assert.ok(sustainabilityHtml.includes('tabindex="0"') || sustainabilityHtml.includes('tabIndex="0"'));
  assert.ok(sustainabilityHtml.includes('tabindex="-1"') || sustainabilityHtml.includes('tabIndex="-1"'));
  assert.ok(sustainabilityHtml.includes('aria-controls='));
  assert.ok(sustainabilityHtml.includes('aria-labelledby='));

  const calculatorHtml = pages.find(([n]) => n === 'CalculatorPage')?.[1] ?? '';
  assert.ok(calculatorHtml.includes('<caption class="sr-only">'));
  assert.ok(calculatorHtml.includes('scope="col"'));

  const workspaceHtml = renderToStaticMarkup(
    createElement(
      WorkspaceLayout,
      {
        activePage: 'dashboard',
        onNavigate: noop,
        location: DEFAULT_CITY,
        unreadAlertsCount: alerts.length,
      },
      createElement('div', null, 'Workspace Body')
    )
  );
  assertCleanRender(workspaceHtml, 'WorkspaceLayout');
  assert.ok(workspaceHtml.includes('id="main-workspace"'));
  assert.ok(workspaceHtml.includes('aria-current="page"'));
  assert.ok(workspaceHtml.includes('aria-controls="mobile-navigation-drawer"'));
  assert.ok(workspaceHtml.includes('Skip to workspace content'));
});

test('Shared UI atoms render accessible semantic HTML', () => {
  const snapshot = buildDemoFallbackSnapshot(DEFAULT_CITY);
  const tips = getGreeneryTips();
  assert.ok(tips.length >= 4);

  const badgeHtml = renderToStaticMarkup(
    createElement(AqiStatusBadge, { category: 'Poor', aqi: 245 })
  );
  assert.ok(badgeHtml.includes('<output'));
  assert.ok(badgeHtml.includes('Level 4 / Unhealthy'));

  const bannerHtml = renderToStaticMarkup(
    createElement(DataStatusBanner, { snapshot, loading: false, onRefresh: noop })
  );
  assert.ok(bannerHtml.includes('aria-live="polite"'));
  assert.ok(bannerHtml.includes('DEMO DATA'));

  const tableHtml = renderToStaticMarkup(
    createElement(AccessibleHourlyTable, {
      mode: 'particulates',
      rows: [
        {
          time: '2026-01-01T10:00',
          label: '10:00',
          phase: 'Observed',
          pm25: 58,
          pm10: 112,
          cpcbAqi: 96,
        },
      ],
    })
  );
  assert.ok(tableHtml.includes('<table'));
  assert.ok(tableHtml.includes('<caption class="sr-only">'));
  assert.ok(tableHtml.includes('scope="col"'));
  assert.ok(tableHtml.includes('10:00'));

  const boundaryHtml = renderToStaticMarkup(
    createElement(ErrorBoundary, null, createElement('p', null, 'Safe child'))
  );
  assert.ok(boundaryHtml.includes('Safe child'));
});
