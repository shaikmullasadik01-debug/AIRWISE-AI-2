import test from 'node:test';
import assert from 'node:assert/strict';
import { formatLocalDateTime, formatLocalTime, parseIsoTimestampOrNow } from './date.ts';
import { sanitizeDownloadFilename } from './download.ts';
import { isWithinIndiaBounds, parseGridRegion } from './location.ts';
import { toggleListItem } from '../hooks/useAirwiseState.ts';

test('isWithinIndiaBounds classifies Indian and international coordinates accurately', () => {
  assert.equal(isWithinIndiaBounds(28.6139, 77.209), true); // New Delhi
  assert.equal(isWithinIndiaBounds(12.9716, 77.5946), true); // Bengaluru
  assert.equal(isWithinIndiaBounds(51.5074, -0.1278), false); // London
  assert.equal(isWithinIndiaBounds(35.6762, 139.6503), false); // Tokyo
  assert.equal(isWithinIndiaBounds(Number.NaN, 77.2), false);
});

test('parseGridRegion normalizes values safely', () => {
  assert.equal(parseGridRegion('GLOBAL'), 'GLOBAL');
  assert.equal(parseGridRegion('INDIA'), 'INDIA');
  assert.equal(parseGridRegion('UNKNOWN'), 'INDIA');
});

test('date helpers parse valid ISO strings and handle malformed dates gracefully', () => {
  const iso = parseIsoTimestampOrNow('2026-11-18T10:30:00Z');
  assert.equal(iso, '2026-11-18T10:30:00.000Z');

  const fallbackIso = parseIsoTimestampOrNow('not-a-valid-date');
  assert.ok(!Number.isNaN(Date.parse(fallbackIso)));

  assert.equal(formatLocalTime('invalid'), 'Time unavailable');
  assert.equal(formatLocalDateTime('invalid'), 'Timestamp unavailable');
  assert.ok(formatLocalTime('2026-11-18T10:30:00Z').length > 0);
  assert.ok(formatLocalDateTime('2026-11-18T10:30:00Z').length > 0);
});

test('sanitizeDownloadFilename strips path traversal and unsafe characters', () => {
  assert.equal(sanitizeDownloadFilename('../../etc/passwd'), 'etc_passwd');
  assert.equal(sanitizeDownloadFilename('airwise\x00card?.svg'), 'airwise_card_.svg');
  assert.equal(sanitizeDownloadFilename('...'), 'airwise-export.txt');
  assert.equal(sanitizeDownloadFilename('airwise-awareness-smog.svg'), 'airwise-awareness-smog.svg');
});

test('toggleListItem adds missing items and removes existing items immutably', () => {
  const initial = ['Morning', 'Evening'] as const;
  assert.deepEqual(toggleListItem(initial, 'Night'), ['Morning', 'Evening', 'Night']);
  assert.deepEqual(toggleListItem(initial, 'Morning'), ['Evening']);
});
