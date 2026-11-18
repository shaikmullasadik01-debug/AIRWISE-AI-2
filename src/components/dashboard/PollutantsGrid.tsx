import { useMemo } from 'react';
import type { EnvironmentalSnapshot } from '../../types/airwise.ts';
import { WHO_2021_GUIDELINES } from '../../lib/aqi.ts';

interface PollutantsGridProps {
  snapshot: EnvironmentalSnapshot;
}

export function PollutantsGrid({ snapshot }: PollutantsGridProps) {
  const pollutantsList = useMemo(
    () => [
      {
        key: 'PM2.5',
        value: snapshot.pollutants.pm25,
        unit: 'µg/m³',
        whoLimit: WHO_2021_GUIDELINES.pm25_24h,
        ratio: snapshot.whoRatios.pm25Multiple,
      },
      {
        key: 'PM10',
        value: snapshot.pollutants.pm10,
        unit: 'µg/m³',
        whoLimit: WHO_2021_GUIDELINES.pm10_24h,
        ratio: snapshot.whoRatios.pm10Multiple,
      },
      {
        key: 'NO2',
        value: snapshot.pollutants.no2,
        unit: 'µg/m³',
        whoLimit: WHO_2021_GUIDELINES.no2_24h,
        ratio: snapshot.whoRatios.no2Multiple,
      },
      {
        key: 'SO2',
        value: snapshot.pollutants.so2,
        unit: 'µg/m³',
        whoLimit: WHO_2021_GUIDELINES.so2_24h,
        ratio: null,
      },
      {
        key: 'CO',
        value: snapshot.pollutants.co,
        unit: 'mg/m³',
        whoLimit: null,
        ratio: null,
      },
      {
        key: 'O3',
        value: snapshot.pollutants.o3,
        unit: 'µg/m³',
        whoLimit: WHO_2021_GUIDELINES.o3_8h,
        ratio: snapshot.whoRatios.o3Multiple,
      },
    ],
    [snapshot.pollutants, snapshot.whoRatios]
  );

  return (
    <section aria-label="Pollutant Concentrations">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-[#102A43]">
          Measured & Modeled Pollutant Breakdown
        </h2>
        <span className="text-xs text-slate-500">Compared against WHO 2021 24h/8h guidelines</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {pollutantsList.map((p) => (
          <div key={p.key} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-[#102A43]">{p.key}</span>
              <span>{p.unit}</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-[#102A43] tabular-nums">
              {p.value !== null ? p.value : 'N/A'}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {p.whoLimit !== null
                ? `WHO limit: ${p.whoLimit} ${p.unit}${p.ratio ? ` (${p.ratio}x)` : ''}`
                : '8-hr CO guideline'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
