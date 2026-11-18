import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AlertPreferences,
  CityLocation,
  EnvironmentalSnapshot,
  FamilyProfile,
  IndoorRoomTask,
  LifestyleAlternative,
  PageId,
  SmartAlert,
} from '../types/airwise.ts';
import { buildDemoFallbackSnapshot, DEFAULT_CITY, PRESET_CITIES } from '../data/presets.ts';
import {
  buildSmartAlerts,
  getInitialIndoorChecklist,
  getInitialLifestyleAlternatives,
} from '../lib/recommendations.ts';
import { calculateCarbonImpact, type CarbonCalculatorInput } from '../lib/impact.ts';
import { PersistedStateSchema } from '../lib/validation.ts';

const STORAGE_KEY = 'airwise_ai_state_v1';

export const DEFAULT_PROFILE: FamilyProfile = {
  householdSize: 3,
  groups: ['adults', 'children', 'dailyCommuters'],
  preferredStandard: 'CPCB',
  hasPurifier: true,
  gridRegion: 'INDIA',
};

export const DEFAULT_CALC_INPUT: CarbonCalculatorInput = {
  carKmReplacedByTransitPerWeek: 30,
  carKmCarpoolPerWeek: 16,
  carKmReplacedByWalkCyclePerWeek: 8,
  electricitySavedKwhPerWeek: 10,
  ledBulbsReplacedCount: 4,
  wasteReducedKgPerWeek: 3,
  gridRegion: 'INDIA',
  householdSize: 3,
};

export const DEFAULT_ALERT_PREFS: AlertPreferences = {
  severeAqi: true,
  risingPm25: true,
  forecastAlerts: true,
  ventilationWindows: true,
  filterMaintenance: true,
  sustainabilityGoals: true,
};

export type RoutinePeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

interface PersistedState {
  locationId?: string;
  customLocation?: CityLocation;
  profile?: FamilyProfile;
  completedTaskIds?: string[];
  completedRoutinePeriods?: RoutinePeriod[];
  adoptedHabitIds?: string[];
  savedGreeneryTipIds?: string[];
  joinedChallengeIds?: string[];
  readAlertIds?: string[];
  calcInput?: CarbonCalculatorInput;
  alertPrefs?: AlertPreferences;
}

const VALID_PAGES: readonly PageId[] = [
  'landing',
  'dashboard',
  'assistant',
  'routine',
  'indoor',
  'sustainability',
  'calculator',
  'insights',
  'community',
  'notifications',
  'settings',
];

function isPageId(value: string): value is PageId {
  return (VALID_PAGES as readonly string[]).includes(value);
}

function parseHashPage(): PageId | null {
  const hash = window.location.hash.replace('#', '');
  return isPageId(hash) ? hash : null;
}

function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = PersistedStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

async function requestAirQualitySnapshot(
  targetLoc: CityLocation,
  bypassCache: boolean,
  signal: AbortSignal
): Promise<EnvironmentalSnapshot> {
  try {
    const qs = new URLSearchParams({
      lat: String(targetLoc.latitude),
      lon: String(targetLoc.longitude),
      name: targetLoc.name,
      region: targetLoc.region,
      country: targetLoc.country,
      countryCode: targetLoc.countryCode,
      timezone: targetLoc.timezone,
      ...(bypassCache ? { refresh: '1' } : {}),
    });
    const res = await fetch(`/api/air-quality?${qs.toString()}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { snapshot?: EnvironmentalSnapshot };
    return data.snapshot ?? buildDemoFallbackSnapshot(targetLoc);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    return buildDemoFallbackSnapshot(targetLoc);
  }
}

export function useAirwiseState() {
  const initialPersisted = useMemo(() => loadPersistedState(), []);

  const [activePage, setActivePage] = useState<PageId>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return 'dashboard';
    return parseHashPage() ?? 'landing';
  });

  const [location, setLocation] = useState<CityLocation>(() => {
    if (initialPersisted.customLocation) return initialPersisted.customLocation;
    if (initialPersisted.locationId) {
      return PRESET_CITIES.find((c) => c.id === initialPersisted.locationId) ?? DEFAULT_CITY;
    }
    return DEFAULT_CITY;
  });

  const [snapshot, setSnapshot] = useState<EnvironmentalSnapshot>(() =>
    buildDemoFallbackSnapshot(location, 'Connecting to live environmental telemetry...')
  );
  const [settledLocationId, setSettledLocationId] = useState<string | null>(null);
  const [manualRefreshing, setManualRefreshing] = useState<boolean>(false);
  const loadingFeed = manualRefreshing || settledLocationId !== location.id;

  const [profile, setProfile] = useState<FamilyProfile>(
    initialPersisted.profile ?? DEFAULT_PROFILE
  );
  const [indoorTasks, setIndoorTasks] = useState<IndoorRoomTask[]>(() => {
    const doneSet = new Set(initialPersisted.completedTaskIds ?? []);
    return getInitialIndoorChecklist().map((t) => ({ ...t, completed: doneSet.has(t.id) }));
  });
  const [alternatives, setAlternatives] = useState<LifestyleAlternative[]>(() => {
    const adoptedSet = new Set(initialPersisted.adoptedHabitIds ?? ['alt-transit']);
    return getInitialLifestyleAlternatives().map((a) => ({ ...a, adopted: adoptedSet.has(a.id) }));
  });
  const [savedGreeneryTipIds, setSavedGreeneryTipIds] = useState<string[]>(
    initialPersisted.savedGreeneryTipIds ?? ['tip-balcony-shade']
  );
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>(
    initialPersisted.joinedChallengeIds ?? ['chal-transit']
  );
  const [calcInput, setCalcInput] = useState<CarbonCalculatorInput>(
    initialPersisted.calcInput ?? DEFAULT_CALC_INPUT
  );
  const [alertPrefs, setAlertPrefs] = useState<AlertPreferences>(
    initialPersisted.alertPrefs ?? DEFAULT_ALERT_PREFS
  );
  const [completedRoutinePeriods, setCompletedRoutinePeriods] = useState<RoutinePeriod[]>(
    initialPersisted.completedRoutinePeriods ?? []
  );
  const [readAlertIds, setReadAlertIds] = useState<string[]>(initialPersisted.readAlertIds ?? []);

  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    void requestAirQualitySnapshot(location, false, controller.signal)
      .then((nextSnapshot) => {
        if (controller.signal.aborted) return;
        setSnapshot(nextSnapshot);
        setSettledLocationId(location.id);
        setManualRefreshing(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setSettledLocationId(location.id);
          setManualRefreshing(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [location]);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHashPage();
      if (next) setActivePage(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        locationId: location.id,
        customLocation: location,
        profile,
        completedTaskIds: indoorTasks.filter((t) => t.completed).map((t) => t.id),
        completedRoutinePeriods,
        adoptedHabitIds: alternatives.filter((a) => a.adopted).map((a) => a.id),
        savedGreeneryTipIds,
        joinedChallengeIds: joinedChallenges,
        readAlertIds,
        calcInput,
        alertPrefs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    location,
    profile,
    indoorTasks,
    completedRoutinePeriods,
    alternatives,
    savedGreeneryTipIds,
    joinedChallenges,
    readAlertIds,
    calcInput,
    alertPrefs,
  ]);

  const navigate = useCallback((page: PageId) => {
    setActivePage(page);
    const targetHash = page === 'landing' ? '' : `#${page}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash || window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const alerts: SmartAlert[] = useMemo(() => {
    const readSet = new Set(readAlertIds);
    return buildSmartAlerts(snapshot).map((a) => ({
      ...a,
      read: readSet.has(a.id),
    }));
  }, [snapshot, readAlertIds]);

  const unreadAlertsCount = useMemo(
    () => alerts.filter((a) => !a.read).length,
    [alerts]
  );

  const indoorProgressPercent = useMemo(() => {
    const done = indoorTasks.filter((t) => t.completed).length;
    return indoorTasks.length > 0 ? Math.round((done / indoorTasks.length) * 100) : 0;
  }, [indoorTasks]);

  const sustainabilityScore = useMemo(() => {
    const adopted = alternatives.filter((a) => a.adopted).length;
    return alternatives.length > 0 ? Math.round((adopted / alternatives.length) * 100) : 0;
  }, [alternatives]);

  const calcResult = useMemo(() => calculateCarbonImpact(calcInput), [calcInput]);

  const refreshFeed = useCallback(() => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    setManualRefreshing(true);

    void requestAirQualitySnapshot(location, true, controller.signal)
      .then((nextSnapshot) => {
        if (controller.signal.aborted) return;
        setSnapshot(nextSnapshot);
        setSettledLocationId(location.id);
        setManualRefreshing(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setSettledLocationId(location.id);
          setManualRefreshing(false);
        }
      });
  }, [location]);

  const togglePeriod = useCallback((period: RoutinePeriod) => {
    setCompletedRoutinePeriods((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    );
  }, []);

  const toggleTask = useCallback((id: string) => {
    setIndoorTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const toggleAdopted = useCallback((id: string) => {
    setAlternatives((prev) =>
      prev.map((a) => (a.id === id ? { ...a, adopted: !a.adopted } : a))
    );
  }, []);

  const toggleSavedGreeneryTip = useCallback((id: string) => {
    setSavedGreeneryTipIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleJoinChallenge = useCallback((id: string) => {
    setJoinedChallenges((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setReadAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setReadAlertIds(alerts.map((a) => a.id));
  }, [alerts]);

  const updateProfile = useCallback((next: FamilyProfile) => {
    setProfile(next);
    setCalcInput((prev) => ({
      ...prev,
      gridRegion: next.gridRegion,
      householdSize: next.householdSize,
    }));
  }, []);

  const importPreferences = useCallback(
    (imported: {
      profile?: FamilyProfile;
      calcInput?: CarbonCalculatorInput;
      alertPrefs?: AlertPreferences;
    }) => {
      if (imported.profile) setProfile(imported.profile);
      if (imported.calcInput) setCalcInput(imported.calcInput);
      if (imported.alertPrefs) setAlertPrefs(imported.alertPrefs);
    },
    []
  );

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation(DEFAULT_CITY);
    setProfile(DEFAULT_PROFILE);
    setIndoorTasks(getInitialIndoorChecklist());
    setCompletedRoutinePeriods([]);
    setAlternatives(getInitialLifestyleAlternatives());
    setSavedGreeneryTipIds([]);
    setJoinedChallenges([]);
    setCalcInput(DEFAULT_CALC_INPUT);
    setAlertPrefs(DEFAULT_ALERT_PREFS);
    setReadAlertIds([]);
  }, []);

  return {
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
  };
}
