import type { AqiCategory, EnvironmentalSnapshot, HourlyPoint } from '../types/airwise.ts';

const CPCB_CATEGORIES: readonly AqiCategory[] = [
  'Good',
  'Satisfactory',
  'Moderate',
  'Poor',
  'Very Poor',
  'Severe',
];

const CATEGORY_COLORS: Record<AqiCategory, string> = {
  Good: '#20C997',
  Satisfactory: '#38BDF8',
  Moderate: '#F59E0B',
  Poor: '#EA580C',
  'Very Poor': '#EF4444',
  Severe: '#991B1B',
};

export interface PollutionInsights {
  trendDirection: 'Rising' | 'Improving' | 'Stable' | 'Insufficient Data';
  trendDeltaPercent: number | null;
  peakWindow: string;
  cleanestWindow: string;
  stagnationRisk: 'High' | 'Moderate' | 'Low';
  weatherExplanation: string;
  categoryDistribution: Array<{ category: AqiCategory; hours: number; color: string }>;
}

function classifyStagnationRisk(wind: number, humidity: number): 'High' | 'Moderate' | 'Low' {
  if (wind < 6 && humidity > 65) return 'High';
  if (wind < 11) return 'Moderate';
  return 'Low';
}

function formatStagnationExplanation(
  risk: 'High' | 'Moderate' | 'Low',
  wind: number,
  humidity: number
): string {
  if (risk === 'High') {
    return `Low wind speeds (${wind} km/h) combined with elevated humidity (${humidity}%) trap urban particulates close to the ground, increasing winter smog persistence.`;
  }
  if (risk === 'Moderate') {
    return `Moderate air movement (${wind} km/h) provides partial dispersion, though rush-hour emissions can still accumulate in street canyons.`;
  }
  return `Brisk winds (${wind} km/h) help dilute localized particulates, though upwind regional smoke can still affect readings.`;
}

export function analyzePollutionInsights(snapshot: EnvironmentalSnapshot): PollutionInsights {
  const valid = snapshot.hourly.filter(
    (h): h is HourlyPoint & { pm25: number; cpcbAqi: number } =>
      h.pm25 !== null && h.cpcbAqi !== null
  );
  const past = valid.filter((h) => !h.isForecast);
  const future = valid.filter((h) => h.isForecast);

  let trendDirection: PollutionInsights['trendDirection'] = 'Insufficient Data';
  let trendDeltaPercent: number | null = null;

  if (past.length >= 4 && future.length >= 4) {
    const recentSlice = past.slice(-6);
    const nextSlice = future.slice(0, 6);
    const recentAvg =
      recentSlice.reduce((s, p) => s + p.pm25, 0) / recentSlice.length;
    const nextAvg =
      nextSlice.reduce((s, p) => s + p.pm25, 0) / nextSlice.length;
    if (recentAvg > 0) {
      trendDeltaPercent = Math.round(((nextAvg - recentAvg) / recentAvg) * 100);
      if (trendDeltaPercent >= 12) trendDirection = 'Rising';
      else if (trendDeltaPercent <= -12) trendDirection = 'Improving';
      else trendDirection = 'Stable';
    }
  }

  let peakPoint = valid[0];
  let cleanestPoint = valid[0];
  for (const p of valid) {
    if (peakPoint && p.pm25 > peakPoint.pm25) peakPoint = p;
    if (cleanestPoint && p.pm25 < cleanestPoint.pm25) cleanestPoint = p;
  }

  const wind = snapshot.weather.windSpeedKmh ?? 8;
  const humidity = snapshot.weather.humidityPercent ?? 60;
  const stagnationRisk = classifyStagnationRisk(wind, humidity);
  const weatherExplanation = formatStagnationExplanation(stagnationRisk, wind, humidity);

  const counts: Record<AqiCategory, number> = {
    Good: 0,
    Satisfactory: 0,
    Moderate: 0,
    Poor: 0,
    'Very Poor': 0,
    Severe: 0,
  };

  for (const h of valid) {
    const a = h.cpcbAqi;
    if (a <= 50) counts.Good++;
    else if (a <= 100) counts.Satisfactory++;
    else if (a <= 200) counts.Moderate++;
    else if (a <= 300) counts.Poor++;
    else if (a <= 400) counts['Very Poor']++;
    else counts.Severe++;
  }

  const categoryDistribution = CPCB_CATEGORIES.map((category) => ({
    category,
    hours: counts[category],
    color: CATEGORY_COLORS[category],
  }));

  return {
    trendDirection,
    trendDeltaPercent,
    peakWindow: peakPoint ? `${peakPoint.label} (~${peakPoint.pm25} µg/m³ PM2.5)` : 'Insufficient data',
    cleanestWindow: cleanestPoint
      ? `${cleanestPoint.label} (~${cleanestPoint.pm25} µg/m³ PM2.5)`
      : 'Insufficient data',
    stagnationRisk,
    weatherExplanation,
    categoryDistribution,
  };
}
