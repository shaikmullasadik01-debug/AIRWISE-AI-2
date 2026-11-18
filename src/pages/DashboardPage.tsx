import { Cloud } from 'lucide-react';
import type { EnvironmentalSnapshot, PageId } from '../types/airwise.ts';
import { LocationSelector } from '../components/LocationSelector.tsx';
import { DataStatusBanner } from '../components/DataStatusBanner.tsx';
import { AirQualityMap } from '../components/AirQualityMap.tsx';
import { AqiHeroSection } from '../components/dashboard/AqiHeroSection.tsx';
import { PollutantsGrid } from '../components/dashboard/PollutantsGrid.tsx';
import { TrendsSection } from '../components/dashboard/TrendsSection.tsx';

interface DashboardPageProps {
  snapshot: EnvironmentalSnapshot;
  loading: boolean;
  indoorProgressPercent: number;
  sustainabilityScore: number;
  weeklyCo2SavedKg: number;
  onSelectLocation: (loc: EnvironmentalSnapshot['location']) => void;
  onRefresh: () => void;
  onNavigate: (page: PageId) => void;
}

export function DashboardPage({
  snapshot,
  loading,
  indoorProgressPercent,
  sustainabilityScore,
  weeklyCo2SavedKg,
  onSelectLocation,
  onRefresh,
  onNavigate,
}: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <LocationSelector currentLocation={snapshot.location} onSelectLocation={onSelectLocation} />

      <DataStatusBanner snapshot={snapshot} loading={loading} onRefresh={onRefresh} />

      <AqiHeroSection snapshot={snapshot} />

      <PollutantsGrid snapshot={snapshot} />

      {/* Household Readiness KPI Strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Household Action Metrics">
        <button
          type="button"
          onClick={() => onNavigate('indoor')}
          className="rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#38BDF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          <p className="text-xs font-semibold text-slate-500">Indoor Air Checklist Progress</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#102A43] tabular-nums">
            {indoorProgressPercent}%
          </p>
          <p className="mt-1 text-xs text-slate-600">Review bedroom, kitchen & purifier tasks</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('sustainability')}
          className="rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#20C997] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          <p className="text-xs font-semibold text-slate-500">Household Sustainability Score</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#102A43] tabular-nums">
            {sustainabilityScore} / 100
          </p>
          <p className="mt-1 text-xs text-slate-600">Based on adopted low-emission habits</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('calculator')}
          className="rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#38BDF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          <p className="text-xs font-semibold text-slate-500">Estimated Weekly Carbon Savings</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#20C997] tabular-nums">
            {weeklyCo2SavedKg.toFixed(1)} kg CO2e
          </p>
          <p className="mt-1 text-xs text-slate-600">Open calculator for annual & community impact</p>
        </button>
      </section>

      <TrendsSection snapshot={snapshot} />

      <AirQualityMap
        currentLocation={snapshot.location}
        cpcbAqi={snapshot.cpcbAqi}
        cpcbCategory={snapshot.cpcbCategory}
        onSelectLocation={onSelectLocation}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Cloud className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
          <span>Need tailored family advice for {snapshot.location.name}?</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate('routine')}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-[#102A43] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          >
            View Daily Routine
          </button>
          <button
            type="button"
            onClick={() => onNavigate('assistant')}
            className="rounded-lg bg-[#102A43] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          >
            Ask AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
