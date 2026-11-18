import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCarbonImpact, EMISSION_FACTORS } from './impact.ts';

test('calculateCarbonImpact applies Baseline - Alternative formula across all categories', () => {
  const res = calculateCarbonImpact({
    carKmReplacedByTransitPerWeek: 50,
    carKmCarpoolPerWeek: 10,
    carKmReplacedByWalkCyclePerWeek: 10,
    electricitySavedKwhPerWeek: 10,
    ledBulbsReplacedCount: 5,
    wasteReducedKgPerWeek: 4,
    gridRegion: 'INDIA',
    householdSize: 2,
  });

  const expectedTransitSavings =
    50 * (EMISSION_FACTORS.CAR_PETROL_KG_PER_KM - EMISSION_FACTORS.PUBLIC_TRANSIT_KG_PER_KM);
  const expectedCarpoolSavings =
    10 * (EMISSION_FACTORS.CAR_PETROL_KG_PER_KM - EMISSION_FACTORS.CARPOOL_2P_KG_PER_KM);
  const expectedActiveSavings = 10 * EMISSION_FACTORS.CAR_PETROL_KG_PER_KM;
  const expectedPowerSavings = 10 * EMISSION_FACTORS.GRID_INDIA_KG_PER_KWH;
  const expectedLedSavings =
    5 * EMISSION_FACTORS.LED_KWH_SAVED_PER_BULB_WEEK * EMISSION_FACTORS.GRID_INDIA_KG_PER_KWH;
  const expectedWasteSavings = 4 * EMISSION_FACTORS.WASTE_AVOIDED_KG_CO2E_PER_KG;

  const expectedWeekly =
    Math.round(
      (expectedTransitSavings +
        expectedCarpoolSavings +
        expectedActiveSavings +
        expectedPowerSavings +
        expectedLedSavings +
        expectedWasteSavings) *
        100
    ) / 100;

  assert.ok(Math.abs(res.weeklySavingsKg - expectedWeekly) <= 0.05);
  assert.equal(
    res.weeklySavingsKg,
    Math.round((res.weeklyBaselineKg - res.weeklyAlternativeKg) * 100) / 100
  );
  assert.equal(res.uncertaintyRangePercent, 18);
  assert.equal(res.breakdown.length, 6);
  assert.ok(res.annualSavingsKg > res.monthlySavingsKg);
  assert.ok(res.community100HomesAnnualTonnes > 0);
  assert.ok(res.exposureVsCarbonNote.includes('personal exposure reduction'));
});

test('calculateCarbonImpact clamps invalid/extreme inputs and respects global grid region', () => {
  const resIndia = calculateCarbonImpact({
    carKmReplacedByTransitPerWeek: -20,
    carKmCarpoolPerWeek: Number.NaN,
    carKmReplacedByWalkCyclePerWeek: Number.POSITIVE_INFINITY,
    electricitySavedKwhPerWeek: 10,
    ledBulbsReplacedCount: 0,
    wasteReducedKgPerWeek: 0,
    gridRegion: 'INDIA',
    householdSize: 0,
  });

  const resGlobal = calculateCarbonImpact({
    carKmReplacedByTransitPerWeek: 0,
    carKmCarpoolPerWeek: 0,
    carKmReplacedByWalkCyclePerWeek: 0,
    electricitySavedKwhPerWeek: 10,
    ledBulbsReplacedCount: 0,
    wasteReducedKgPerWeek: 0,
    gridRegion: 'GLOBAL',
    householdSize: 99,
  });

  assert.equal(resIndia.weeklySavingsKg, 7.16);
  assert.equal(resGlobal.weeklySavingsKg, 4.75);
  assert.equal(resIndia.perPersonAnnualSavingsKg, resIndia.annualSavingsKg);
  // householdSize is clamped at max 20
  assert.equal(
    resGlobal.perPersonAnnualSavingsKg,
    Math.round((resGlobal.annualSavingsKg / 20) * 100) / 100
  );
});
