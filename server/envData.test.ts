import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchLiveEnvironmentalSnapshot, searchLocations } from './envData.ts';
import { DEFAULT_CITY } from '../src/data/presets.ts';

test('searchLocations merges Open-Meteo results with presets and deduplicates', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        results: [
          {
            id: 12345,
            name: 'New Delhi',
            admin1: 'Delhi',
            country: 'India',
            country_code: 'IN',
            latitude: 28.6139,
            longitude: 77.209,
            timezone: 'Asia/Kolkata',
          },
          {
            id: 99999,
            name: 'Jaipur',
            admin1: 'Rajasthan',
            country: 'India',
            country_code: 'IN',
            latitude: 26.9124,
            longitude: 75.7873,
            timezone: 'Asia/Kolkata',
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )) as typeof fetch;

  try {
    const results = await searchLocations('Delhi');
    assert.ok(results.some((r) => r.name === 'Jaipur'));
    const delhiCount = results.filter((r) => r.name.toLowerCase() === 'new delhi').length;
    assert.equal(delhiCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('searchLocations falls back cleanly to presets on network failure', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error('offline');
  }) as typeof fetch;

  try {
    const results = await searchLocations('Mumbai');
    assert.ok(results.some((r) => r.id === 'mumbai-in'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchLiveEnvironmentalSnapshot parses live feeds, converts CO, caches, and falls back gracefully', async () => {
  const originalFetch = globalThis.fetch;
  const now = new Date();
  const isoHour = `${now.toISOString().slice(0, 13)}:00`;
  const today = now.toISOString().slice(0, 10);

  const customCity = {
    id: 'test-pune-unique',
    name: 'Pune Test',
    region: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    latitude: 18.5246,
    longitude: 73.8786,
    timezone: 'Asia/Kolkata',
    isIndia: true,
  };

  let fetchCalls = 0;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    fetchCalls++;
    const url = String(input);
    if (url.includes('air-quality-api.open-meteo.com')) {
      return new Response(
        JSON.stringify({
          current: {
            time: isoHour,
            pm10: 95,
            pm2_5: 52,
            carbon_monoxide: 1200,
            nitrogen_dioxide: 28,
            sulphur_dioxide: 10,
            ozone: 42,
            us_aqi: 142,
          },
          hourly: {
            time: [isoHour],
            pm10: [95],
            pm2_5: [52],
            us_aqi: [142],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({
        current: {
          temperature_2m: 26,
          relative_humidity_2m: 58,
          wind_speed_10m: 11,
          weather_code: 1,
        },
        hourly: {
          time: [isoHour],
          temperature_2m: [26],
          wind_speed_10m: [11],
          visibility: [10000],
        },
        daily: {
          time: [today],
          temperature_2m_max: [30],
          temperature_2m_min: [20],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const live = await fetchLiveEnvironmentalSnapshot(customCity);
    assert.equal(live.dataStatus, 'LIVE');
    assert.equal(live.pollutants.co, 1.2); // 1200 ug/m3 -> 1.2 mg/m3
    assert.equal(live.weather.visibilityKm, 10);
    assert.equal(live.cpcbCategory, 'Satisfactory');
    assert.equal(fetchCalls, 2);

    // Second call hits server cache without extra network requests
    const cached = await fetchLiveEnvironmentalSnapshot(customCity);
    assert.equal(cached.dataStatus, 'CACHED');
    assert.equal(fetchCalls, 2);

    // bypassCache: true forces a fresh upstream fetch
    const refreshed = await fetchLiveEnvironmentalSnapshot(customCity, { bypassCache: true });
    assert.equal(refreshed.dataStatus, 'LIVE');
    assert.equal(fetchCalls, 4);

    // Distinct coordinates where upstream returns 503 should produce DEMO_FALLBACK
    globalThis.fetch = (async () => new Response('Unavailable', { status: 503 })) as typeof fetch;
    const fallbackLoc = { ...DEFAULT_CITY, latitude: 12.99, longitude: 80.29 };
    const fallback = await fetchLiveEnvironmentalSnapshot(fallbackLoc);
    assert.equal(fallback.dataStatus, 'DEMO_FALLBACK');
    assert.ok(fallback.statusMessage.includes('demonstration fallback'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchLiveEnvironmentalSnapshot handles malformed current.time safely', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('air-quality-api.open-meteo.com')) {
      return new Response(
        JSON.stringify({
          current: { time: 'not-a-valid-timestamp', pm2_5: 40, pm10: 70 },
          hourly: { time: [], pm10: [], pm2_5: [], us_aqi: [] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ current: {}, hourly: {}, daily: {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    const loc = { ...DEFAULT_CITY, id: 'malformed-time-test', latitude: 15.12, longitude: 75.45 };
    const snap = await fetchLiveEnvironmentalSnapshot(loc, { bypassCache: true });
    assert.equal(snap.dataStatus, 'LIVE');
    assert.ok(!Number.isNaN(Date.parse(snap.measuredAt)));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
