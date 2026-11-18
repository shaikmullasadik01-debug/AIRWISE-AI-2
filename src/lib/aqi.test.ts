import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCpcbAqi,
  calculateCpcbSubIndex,
  calculateUsAqiFromParticulates,
  calculateWhoRatios,
  getCpcbCategory,
  sanitizeMeasurement,
} from './aqi.ts';

test('CPCB NAQI returns all 6 official categories accurately', () => {
  assert.equal(getCpcbCategory(25), 'Good');
  assert.equal(getCpcbCategory(75), 'Satisfactory');
  assert.equal(getCpcbCategory(150), 'Moderate');
  assert.equal(getCpcbCategory(250), 'Poor');
  assert.equal(getCpcbCategory(350), 'Very Poor');
  assert.equal(getCpcbCategory(450), 'Severe');
});

test('CPCB NAQI computes dominant pollutant and max sub-index', () => {
  const result = calculateCpcbAqi({
    pm25: 120,
    pm10: 110,
    no2: 35,
    so2: 12,
    co: 1.0,
    o3: 45,
  });
  assert.equal(result.dominantPollutant, 'PM2.5');
  assert.equal(result.category, 'Poor');
  assert.ok(result.aqi !== null && result.aqi >= 201 && result.aqi <= 300);
});

test('CPCB sub-index handles null and negative measurements safely', () => {
  assert.equal(calculateCpcbSubIndex('pm25', null), null);
  assert.equal(calculateCpcbSubIndex('pm25', -10), null);
  assert.equal(sanitizeMeasurement(-5), null);
  assert.equal(sanitizeMeasurement(99999, 5000), null);
  assert.equal(sanitizeMeasurement(42.37), 42.4);
});

test('US EPA AQI differs cleanly from CPCB NAQI and computes WHO multiples', () => {
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
});
