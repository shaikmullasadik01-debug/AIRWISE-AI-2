import type { AlertPreferences, CityLocation, FamilyProfile, PageId } from '../types/airwise.ts';
import type { CarbonCalculatorInput } from './impact.ts';
import { PersistedStateSchema } from './validation.ts';

export const STORAGE_KEY = 'airwise_ai_state_v1';

export type RoutinePeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface PersistedState {
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

export function isPageId(value: string): value is PageId {
  return (VALID_PAGES as readonly string[]).includes(value);
}

export function parseHashPage(hash: string): PageId | null {
  const clean = hash.replace(/^#/, '');
  return isPageId(clean) ? clean : null;
}

export function toggleListItem<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

export function addUniqueItem<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? [...list] : [...list, item];
}

export function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = PersistedStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function savePersistedState(payload: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access errors gracefully
  }
}
