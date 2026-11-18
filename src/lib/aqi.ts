import type { AqiCategory, PollutantReadings, UsAqiCategory } from '../types/airwise.ts';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

/**
 * Official CPCB (Central Pollution Control Board, India) National Air Quality Index (NAQI)
 * 24-hr / 8-hr linear sub-index breakpoints.
 */
const CPCB_BREAKPOINTS: Record<keyof PollutantReadings, Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500 },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

/**
 * Updated 2024 US EPA PM2.5 and PM10 breakpoints for side-by-side comparison.
 */
const US_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
];

const US_PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

export const WHO_2021_GUIDELINES = {
  pm25_24h: 15,
  pm25_annual: 5,
  pm10_24h: 45,
  no2_24h: 25,
  so2_24h: 40,
  o3_8h: 100,
} as const;

const POLLUTANT_KEYS: readonly (keyof PollutantReadings)[] = [
  'pm25',
  'pm10',
  'no2',
  'so2',
  'co',
  'o3',
];

const POLLUTANT_LABELS: Record<keyof PollutantReadings, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  no2: 'NO2',
  so2: 'SO2',
  co: 'CO',
  o3: 'O3',
};

function computeLinearSubIndex(value: number, breakpoints: readonly Breakpoint[]): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  const rounded = Math.round(value * 10) / 10;

  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (!bp) continue;
    if (rounded <= bp.cHigh) {
      const prev = i > 0 ? breakpoints[i - 1] : undefined;
      const cLow = prev ? prev.cHigh : bp.cLow;
      const ratio = (rounded - cLow) / Math.max(0.001, bp.cHigh - cLow);
      const sub = Math.round(bp.iLow + ratio * (bp.iHigh - bp.iLow));
      return Math.max(0, Math.min(500, sub));
    }
  }
  return 500;
}

export function calculateCpcbSubIndex(pollutant: keyof PollutantReadings, value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  return computeLinearSubIndex(value, CPCB_BREAKPOINTS[pollutant]);
}

export function calculateCpcbAqi(readings: PollutantReadings): {
  aqi: number | null;
  category: AqiCategory;
  dominantPollutant: string;
} {
  let maxSub = -1;
  let dominant = 'Unavailable';

  for (const key of POLLUTANT_KEYS) {
    const sub = calculateCpcbSubIndex(key, readings[key]);
    if (sub !== null && sub > maxSub) {
      maxSub = sub;
      dominant = POLLUTANT_LABELS[key];
    }
  }

  if (maxSub < 0) {
    return { aqi: null, category: 'Satisfactory', dominantPollutant: 'Unavailable' };
  }

  return {
    aqi: maxSub,
    category: getCpcbCategory(maxSub),
    dominantPollutant: dominant,
  };
}

export function getCpcbCategory(aqi: number | null): AqiCategory {
  if (aqi === null || !Number.isFinite(aqi)) return 'Satisfactory';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function calculateUsAqiFromParticulates(pm25: number | null, pm10: number | null): {
  aqi: number | null;
  category: UsAqiCategory;
} {
  const subs: number[] = [];
  if (pm25 !== null && Number.isFinite(pm25) && pm25 >= 0) {
    subs.push(computeLinearSubIndex(pm25, US_PM25_BREAKPOINTS));
  }
  if (pm10 !== null && Number.isFinite(pm10) && pm10 >= 0) {
    subs.push(computeLinearSubIndex(pm10, US_PM10_BREAKPOINTS));
  }
  if (subs.length === 0) {
    return { aqi: null, category: 'Good' };
  }
  const max = Math.max(...subs);
  return { aqi: max, category: getUsAqiCategory(max) };
}

export function getUsAqiCategory(aqi: number | null): UsAqiCategory {
  if (aqi === null || !Number.isFinite(aqi)) return 'Good';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export interface AqiVisualMeta {
  category: AqiCategory;
  rangeLabel: string;
  hexColor: string;
  bgTintClass: string;
  textClass: string;
  borderClass: string;
  healthSummary: string;
  accessibleSymbol: string;
}

const CPCB_CATEGORY_META: Record<AqiCategory, AqiVisualMeta> = {
  Good: {
    category: 'Good',
    rangeLabel: '0–50',
    hexColor: '#20C997',
    bgTintClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    healthSummary: 'Minimal impact; suitable for normal outdoor activities.',
    accessibleSymbol: 'Level 1 / Optimal',
  },
  Satisfactory: {
    category: 'Satisfactory',
    rangeLabel: '51–100',
    hexColor: '#38BDF8',
    bgTintClass: 'bg-sky-50',
    textClass: 'text-sky-800',
    borderClass: 'border-sky-200',
    healthSummary: 'Minor breathing discomfort possible for unusually sensitive people.',
    accessibleSymbol: 'Level 2 / Acceptable',
  },
  Moderate: {
    category: 'Moderate',
    rangeLabel: '101–200',
    hexColor: '#F59E0B',
    bgTintClass: 'bg-amber-50',
    textClass: 'text-amber-900',
    borderClass: 'border-amber-200',
    healthSummary: 'Breathing discomfort possible for children, older adults, and sensitive groups.',
    accessibleSymbol: 'Level 3 / Caution',
  },
  Poor: {
    category: 'Poor',
    rangeLabel: '201–300',
    hexColor: '#EA580C',
    bgTintClass: 'bg-orange-50',
    textClass: 'text-orange-900',
    borderClass: 'border-orange-200',
    healthSummary: 'Breathing discomfort on prolonged exposure; shift intense exercise indoors.',
    accessibleSymbol: 'Level 4 / Unhealthy',
  },
  'Very Poor': {
    category: 'Very Poor',
    rangeLabel: '301–400',
    hexColor: '#EF4444',
    bgTintClass: 'bg-red-50',
    textClass: 'text-red-900',
    borderClass: 'border-red-200',
    healthSummary: 'High risk of respiratory irritation on prolonged exposure; protect indoors.',
    accessibleSymbol: 'Level 5 / High Alert',
  },
  Severe: {
    category: 'Severe',
    rangeLabel: '401–500',
    hexColor: '#991B1B',
    bgTintClass: 'bg-rose-100',
    textClass: 'text-rose-950',
    borderClass: 'border-rose-300',
    healthSummary: 'Severe air episode; avoid outdoor exertion and seal/filter indoor spaces.',
    accessibleSymbol: 'Level 6 / Severe Emergency',
  },
};

export function getCpcbCategoryMeta(category: AqiCategory): AqiVisualMeta {
  return CPCB_CATEGORY_META[category];
}

export function sanitizeMeasurement(value: unknown, maxBound = 5000): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > maxBound) {
    return null;
  }
  return Math.round(value * 10) / 10;
}

export function calculateWhoRatios(readings: PollutantReadings) {
  return {
    pm25Multiple:
      readings.pm25 !== null
        ? Math.round((readings.pm25 / WHO_2021_GUIDELINES.pm25_24h) * 10) / 10
        : null,
    pm10Multiple:
      readings.pm10 !== null
        ? Math.round((readings.pm10 / WHO_2021_GUIDELINES.pm10_24h) * 10) / 10
        : null,
    no2Multiple:
      readings.no2 !== null
        ? Math.round((readings.no2 / WHO_2021_GUIDELINES.no2_24h) * 10) / 10
        : null,
    o3Multiple:
      readings.o3 !== null
        ? Math.round((readings.o3 / WHO_2021_GUIDELINES.o3_8h) * 10) / 10
        : null,
  };
}
