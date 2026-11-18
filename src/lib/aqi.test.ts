import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCpcbAqi,
  calculateCpcbSubIndex,
  calculateUsAqiFromParticulates,
  calculateWhoRatios,
  getCpcbCategory,
  getCpcbCategoryMeta,
  getUsAqiCategory,
  sanitizeMeasurement,
} from './aqi.ts';

test('CPCB NAQI returns all 6 official categories and metadata accurately', () => {
  assert.equal(getCpcbCategory(null), 'Satisfactory');
  assert.equal(getCpcbCategory(25), 'Good');
  assert.equal(getCpcbCategory(75), 'Satisfactory');
  assert.equal(getCpcbCategory(150), 'Moderate');
  assert.equal(getCpcbCategory(250), 'Poor');
  assert.equal(getCpcbCategory(350), 'Very Poor');
  assert.equal(getCpcbCategory(450), 'Severe');

  const categories = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'] as const;
  for (const cat of categories) {
    const meta = getCpcbCategoryMeta(cat);
    assert.equal(meta.category, cat);
    assert.ok(meta.healthSummary.length > 10);
    assert.ok(meta.accessibleSymbol.startsWith('Level'));
  }
});

test('CPCB NAQI computes dominant pollutant across particulates and trace gases', () => {
  const pmResult = calculateCpcbAqi({
    pm25: 120,
    pm10: 110,
    no2: 35,
    so2: 12,
    co: 1.0,
    o3: 45,
  });
  assert.equal(pmResult.dominantPollutant, 'PM2.5');
  assert.equal(pmResult.category, 'Poor');
  assert.ok(pmResult.aqi !== null && pmResult.aqi >= 201 && pmResult.aqi <= 300);

  const coDominant = calculateCpcbAqi({
    pm25: 12,
    pm10: 25,
    no2: 20,
    so2: 10,
    co: 20,
    o3: 30,
  });
  assert.equal(coDominant.dominantPollutant, 'CO');
  assert.equal(coDominant.category, 'Very Poor');

  const no2Dominant = calculateCpcbAqi({
    pm25: 15,
    pm10: 30,
    no2: 250,
    so2: 15,
    co: 0.5,
    o3: 20,
  });
  assert.equal(no2Dominant.dominantPollutant, 'NO2');

  const allNull = calculateCpcbAqi({
    pm25: null,
    pm10: null,
    no2: null,
    so2: null,
    co: null,
    o3: null,
  });
  assert.equal(allNull.aqi, null);
  assert.equal(allNull.dominantPollutant, 'Unavailable');
});

test('CPCB sub-index and measurement sanitization clamp extreme or invalid values', () => {
  assert.equal(calculateCpcbSubIndex('pm25', null), null);
  assert.equal(calculateCpcbSubIndex('pm25', -10), null);
  assert.equal(calculateCpcbSubIndex('pm25', Number.NaN), null);
  assert.equal(calculateCpcbSubIndex('pm25', 1500), 500);
  assert.equal(sanitizeMeasurement(-5), null);
  assert.equal(sanitizeMeasurement(Number.POSITIVE_INFINITY), null);
  assert.equal(sanitizeMeasurement('42'), null);
  assert.equal(sanitizeMeasurement(99999, 5000), null);
  assert.equal(sanitizeMeasurement(42.37), 42.4);
});

test('US EPA AQI covers all 6 tiers and WHO ratios handle null pollutants cleanly', () => {
  assert.equal(getUsAqiCategory(null), 'Good');
  assert.equal(getUsAqiCategory(40), 'Good');
  assert.equal(getUsAqiCategory(80), 'Moderate');
  assert.equal(getUsAqiCategory(135), 'Unhealthy for Sensitive Groups');
  assert.equal(getUsAqiCategory(185), 'Unhealthy');
  assert.equal(getUsAqiCategory(260), 'Very Unhealthy');
  assert.equal(getUsAqiCategory(380), 'Hazardous');

  const usEmpty = calculateUsAqiFromParticulates(null, null);
  assert.equal(usEmpty.aqi, null);

  const us = calculateUsAqiFromParticulates(45, 80);
  assert.ok(us.aqi !== null && us.aqi >= 101);
  assert.equal(us.category, 'Unhealthy for Sensitive Groups');

  const ratios = calculateWhoRatios({
    pm25: 45,
    pm10: 90,
    no2: 50,
    so2: 20,
    co: 1,
    o3: 100,
  });
  assert.equal(ratios.pm25Multiple, 3);
  assert.equal(ratios.pm10Multiple, 2);
  assert.equal(ratios.no2Multiple, 2);
  assert.equal(ratios.o3Multiple, 1);

  const nullRatios = calculateWhoRatios({
    pm25: null,
    pm10: null,
    no2: null,
    so2: null,
    co: null,
    o3: null,
  });
  assert.deepEqual(nullRatios, {
    pm25Multiple: null,
    pm10Multiple: null,
    no2Multiple: null,
    o3Multiple: null,
  });
});
