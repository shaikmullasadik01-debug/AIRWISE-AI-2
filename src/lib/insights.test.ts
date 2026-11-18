import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoFallbackSnapshot, DEFAULT_CITY } from '../data/presets.ts';
import type { EnvironmentalSnapshot, HourlyPoint } from '../types/airwise.ts';
import { analyzePollutionInsights } from './insights.ts';

function buildCustomSnapshot(
  hourly: HourlyPoint[],
  windSpeedKmh = 8,
  humidityPercent = 60
): EnvironmentalSnapshot {
  const base = buildDemoFallbackSnapshot(DEFAULT_CITY);
  return {
    ...base,
    hourly,
    weather: {
      ...base.weather,
      windSpeedKmh,
      humidityPercent,
    },
  };
}

function makeHourlySequence(
  pastPm25: number[],
  futurePm25: number[],
  aqis?: number[]
): HourlyPoint[] {
  const combined = [...pastPm25, ...futurePm25];
  return combined.map((pm25, index) => ({
    time: `2026-01-01T${String(index % 24).padStart(2, '0')}:00`,
    label: `${String(index % 24).padStart(2, '0')}:00`,
    pm25,
    pm10: pm25 * 1.6,
    usAqi: aqis?.[index] ?? pm25 * 2,
    cpcbAqi: aqis?.[index] ?? pm25 * 2,
    temperatureC: 22,
    windSpeedKmh: 8,
    isForecast: index >= pastPm25.length,
  }));
}

test('analyzePollutionInsights classifies Rising, Improving, Stable, and Insufficient Data trends', () => {
  const rising = analyzePollutionInsights(
    buildCustomSnapshot(makeHourlySequence([40, 42, 44, 45], [70, 72, 74, 76]))
  );
  assert.equal(rising.trendDirection, 'Rising');
  assert.ok((rising.trendDeltaPercent ?? 0) >= 12);

  const improving = analyzePollutionInsights(
    buildCustomSnapshot(makeHourlySequence([90, 88, 86, 84], [45, 44, 42, 40]))
  );
  assert.equal(improving.trendDirection, 'Improving');
  assert.ok((improving.trendDeltaPercent ?? 0) <= -12);

  const stable = analyzePollutionInsights(
    buildCustomSnapshot(makeHourlySequence([60, 61, 60, 59], [62, 60, 61, 60]))
  );
  assert.equal(stable.trendDirection, 'Stable');

  const insufficient = analyzePollutionInsights(
    buildCustomSnapshot(makeHourlySequence([60, 62], [65, 66]))
  );
  assert.equal(insufficient.trendDirection, 'Insufficient Data');
  assert.equal(insufficient.trendDeltaPercent, null);
});

test('analyzePollutionInsights evaluates High/Moderate/Low stagnation risk and all 6 CPCB buckets', () => {
  const allCategoryAqis = [35, 85, 150, 240, 350, 440];
  const highRisk = analyzePollutionInsights(
    buildCustomSnapshot(
      makeHourlySequence([20, 40, 80, 110], [160, 210], allCategoryAqis),
      4,
      75
    )
  );
  assert.equal(highRisk.stagnationRisk, 'High');
  assert.ok(highRisk.weatherExplanation.includes('4 km/h'));
  assert.ok(highRisk.peakWindow.includes('210'));
  assert.ok(highRisk.cleanestWindow.includes('20'));

  const counts = Object.fromEntries(
    highRisk.categoryDistribution.map((item) => [item.category, item.hours])
  );
  assert.deepEqual(counts, {
    Good: 1,
    Satisfactory: 1,
    Moderate: 1,
    Poor: 1,
    'Very Poor': 1,
    Severe: 1,
  });

  const moderateRisk = analyzePollutionInsights(
    buildCustomSnapshot(makeHourlySequence([40, 40, 40, 40], [40, 40, 40, 40]), 9, 55)
  );
  assert.equal(moderateRisk.stagnationRisk, 'Moderate');

  const lowRisk = analyzePollutionInsights(
    buildCustomSnapshot(makeHourlySequence([40, 40, 40, 40], [40, 40, 40, 40]), 16, 45)
  );
  assert.equal(lowRisk.stagnationRisk, 'Low');
});
