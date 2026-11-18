import { Droplets, Eye, Thermometer, Wind } from 'lucide-react';
import type { EnvironmentalSnapshot } from '../../types/airwise.ts';
import { getCpcbCategoryMeta } from '../../lib/aqi.ts';
import { AqiStatusBadge } from '../AqiBadge.tsx';

interface AqiHeroSectionProps {
  snapshot: EnvironmentalSnapshot;
}

const CPCB_SCALE_ITEMS = [
  { name: 'Good', range: '0–50', color: 'bg-[#20C997]' },
  { name: 'Satisfactory', range: '51–100', color: 'bg-[#38BDF8]' },
  { name: 'Moderate', range: '101–200', color: 'bg-[#F59E0B]' },
  { name: 'Poor', range: '201–300', color: 'bg-orange-600' },
  { name: 'Very Poor', range: '301–400', color: 'bg-[#EF4444]' },
  { name: 'Severe', range: '401–500', color: 'bg-rose-900' },
] as const;

export function AqiHeroSection({ snapshot }: AqiHeroSectionProps) {
  const meta = getCpcbCategoryMeta(snapshot.cpcbCategory);

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-12" aria-label="Air Quality Summary">
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Indian CPCB NAQI Scale (0–500) · Dominant Pollutant: {snapshot.dominantPollutant}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-4">
              <span className="font-mono text-5xl font-bold tracking-tight text-[#102A43] tabular-nums">
                {snapshot.cpcbAqi ?? '—'}
              </span>
              <AqiStatusBadge category={snapshot.cpcbCategory} aqi={snapshot.cpcbAqi} />
            </div>
            <p className="mt-3 text-sm text-slate-700">{meta.healthSummary}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold text-slate-500">Official CPCB / NAQI Categories</p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-6">
            {CPCB_SCALE_ITEMS.map((cat) => {
              const isCurrent = snapshot.cpcbCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  className={`rounded-md border px-2 py-1.5 ${
                    isCurrent ? 'border-[#102A43] bg-slate-50 font-semibold' : 'border-slate-200'
                  }`}
                >
                  <div className={`mb-1 h-1.5 w-full rounded-full ${cat.color}`} aria-hidden="true" />
                  <div className="truncate text-[#102A43]">{cat.name}</div>
                  <div className="font-mono text-slate-500 tabular-nums">{cat.range}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:col-span-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-sm font-bold text-[#102A43]">
            Index Comparison: CPCB vs US AQI vs WHO
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-[#F4F8FB] p-3">
              <span className="block text-[11px] font-medium text-slate-600">Indian CPCB</span>
              <span className="mt-1 block font-mono text-xl font-bold text-[#102A43] tabular-nums">
                {snapshot.cpcbAqi ?? 'N/A'}
              </span>
              <span className="text-[11px] text-slate-600">{snapshot.cpcbCategory}</span>
            </div>
            <div className="rounded-lg bg-[#F4F8FB] p-3">
              <span className="block text-[11px] font-medium text-slate-600">US EPA AQI</span>
              <span className="mt-1 block font-mono text-xl font-bold text-[#102A43] tabular-nums">
                {snapshot.usAqi ?? 'N/A'}
              </span>
              <span className="block text-[11px] leading-tight text-slate-600">{snapshot.usCategory}</span>
            </div>
            <div className="rounded-lg bg-[#F4F8FB] p-3">
              <span className="block text-[11px] font-medium text-slate-600">WHO PM2.5</span>
              <span className="mt-1 block font-mono text-xl font-bold text-[#102A43] tabular-nums">
                {snapshot.whoRatios.pm25Multiple !== null ? `${snapshot.whoRatios.pm25Multiple}x` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-600">of 15 µg/m³</span>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-slate-500">
            US AQI uses stricter 2024 PM2.5 breakpoints and a 0–500 scale peaking earlier than CPCB NAQI; WHO guidelines represent 24-hour health benchmarks.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-[#102A43]">Current Weather Context</h2>
            <span className="text-xs text-slate-500">{snapshot.weather.weatherSummary}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <span className="block text-[11px] text-slate-500">Temp</span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {snapshot.weather.temperatureC !== null ? `${snapshot.weather.temperatureC}°C` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
              <div>
                <span className="block text-[11px] text-slate-500">Humidity</span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {snapshot.weather.humidityPercent !== null ? `${snapshot.weather.humidityPercent}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <div>
                <span className="block text-[11px] text-slate-500">Wind</span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {snapshot.weather.windSpeedKmh !== null ? `${snapshot.weather.windSpeedKmh} km/h` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
              <div>
                <span className="block text-[11px] text-slate-500">Visibility</span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {snapshot.weather.visibilityKm !== null ? `${snapshot.weather.visibilityKm} km` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
