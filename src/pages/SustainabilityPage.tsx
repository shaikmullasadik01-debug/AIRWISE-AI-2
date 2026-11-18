import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Info, Leaf } from 'lucide-react';
import type { CarbonCalculatorInput } from '../lib/impact.ts';
import type { EnvironmentalSnapshot, LifestyleAlternative, PageId } from '../types/airwise.ts';
import { handleTabListKeyDown } from '../lib/a11y.ts';
import { getGreeneryTips } from '../lib/recommendations.ts';
import { GreeneryTipsGallery } from '../components/sustainability/GreeneryTipsGallery.tsx';
import { CarbonReductionGallery } from '../components/sustainability/CarbonReductionGallery.tsx';

interface SustainabilityPageProps {
  snapshot: EnvironmentalSnapshot;
  alternatives: LifestyleAlternative[];
  savedGreeneryTipIds: readonly string[];
  onToggleAdopted: (id: string) => void;
  onToggleSavedGreeneryTip: (id: string) => void;
  onApplyCarbonPreset?: (patch: Partial<CarbonCalculatorInput>) => void;
  onNavigate?: (page: PageId) => void;
}

type CategoryFilter = 'All' | 'Transport' | 'Energy' | 'Household' | 'Greenery';

const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  'All',
  'Transport',
  'Energy',
  'Household',
  'Greenery',
];

export function SustainabilityPage({
  snapshot,
  alternatives,
  savedGreeneryTipIds,
  onToggleAdopted,
  onToggleSavedGreeneryTip,
  onApplyCarbonPreset,
  onNavigate,
}: SustainabilityPageProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const greeneryTips = useMemo(() => getGreeneryTips(), []);

  const adopted = useMemo(() => alternatives.filter((a) => a.adopted), [alternatives]);
  const totalWeeklyKg = useMemo(
    () => adopted.reduce((s, a) => s + a.estimatedReductionKgPerWeek, 0),
    [adopted]
  );
  const sustainabilityScore =
    alternatives.length > 0 ? Math.min(100, Math.round((adopted.length / alternatives.length) * 100)) : 0;

  const visible = useMemo(
    () =>
      categoryFilter === 'All'
        ? alternatives
        : alternatives.filter((a) => a.category === categoryFilter),
    [alternatives, categoryFilter]
  );

  const outdoorHigh = (snapshot.cpcbAqi ?? 120) > 150;

  return (
    <div className="space-y-8">
      {/* Header KPI Strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Sustainability Impact Summary">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Household Sustainability Score</p>
          <p className="mt-1 font-mono text-3xl font-bold text-[#102A43] tabular-nums">
            {sustainabilityScore} / 100
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {adopted.length} of {alternatives.length} low-emission habits active · {savedGreeneryTipIds.length} greenery tips saved
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Estimated Weekly Reduction</p>
          <p className="mt-1 font-mono text-3xl font-bold text-[#0F766E] tabular-nums">
            {totalWeeklyKg.toFixed(2)} kg
          </p>
          <p className="mt-1 text-xs text-slate-600">CO2e from adopted habits</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Projected Annual Savings</p>
          <p className="mt-1 font-mono text-3xl font-bold text-[#102A43] tabular-nums">
            {(totalWeeklyKg * 52).toFixed(0)} kg
          </p>
          <p className="mt-1 text-xs text-slate-600">Based on consistent weekly practice</p>
        </div>
      </section>

      {outdoorHigh && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <p>
            <strong>Air Quality Context ({snapshot.location.name}):</strong> Current CPCB AQI is{' '}
            <span className="font-mono">{snapshot.cpcbAqi}</span> ({snapshot.cpcbCategory}). When outdoor pollution is elevated, prioritize closed-cabin public transit or consolidated errands over prolonged unmasked outdoor cycling.
          </p>
        </div>
      )}

      {/* Visual Carbon Emissions Reduction Playbook */}
      <CarbonReductionGallery
        heading="Visual Guide: Everyday Actions That Lower Household Emissions"
        subtitle="Inspect how clean transit, passive solar cooling, zero-burn composting, and urban greenery cut CO2e—then model them directly in the Carbon Calculator."
        actionLabel="Model in Calculator"
        onSelectAction={(action) => {
          onApplyCarbonPreset?.(action.presetPatch);
          onNavigate?.('calculator');
        }}
      />

      {/* Urban Greenery Tips */}
      <GreeneryTipsGallery
        tips={greeneryTips}
        savedTipIds={savedGreeneryTipIds}
        onToggleSavedTip={onToggleSavedGreeneryTip}
      />

      {/* Category Filter */}
      <section aria-label="Low-Emission Daily Habits" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5"
            role="tablist"
            aria-label="Filter sustainability habits"
          >
            {CATEGORY_FILTERS.map((cat) => {
              const active = categoryFilter === cat;
              const slug = cat.toLowerCase();
              return (
                <button
                  key={cat}
                  id={`sustainability-tab-${slug}`}
                  type="button"
                  role="tab"
                  tabIndex={active ? 0 : -1}
                  aria-selected={active}
                  aria-controls="sustainability-habits-panel"
                  onClick={() => setCategoryFilter(cat)}
                  onKeyDown={(e) =>
                    handleTabListKeyDown(e, CATEGORY_FILTERS, categoryFilter, setCategoryFilter)
                  }
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                    active ? 'bg-[#102A43] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-600">
            Toggle habits your household is adopting to update your score
          </span>
        </div>

        {/* Alternatives List */}
        <div
          id="sustainability-habits-panel"
          className="space-y-4"
          role="tabpanel"
          aria-labelledby={`sustainability-tab-${categoryFilter.toLowerCase()}`}
        >
          {visible.map((alt) => (
            <article key={alt.id} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Leaf className="h-3.5 w-3.5 text-[#0F766E]" aria-hidden="true" />
                    <span className="font-semibold text-[#102A43]">{alt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Confidence: {alt.confidenceLevel}</span>
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-[#102A43]">{alt.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[#0F766E] tabular-nums">
                    −{alt.estimatedReductionKgPerWeek.toFixed(2)} kg CO2e/wk
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleAdopted(alt.id)}
                    aria-pressed={alt.adopted}
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                      alt.adopted
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'border-slate-300 bg-white text-[#102A43] hover:bg-slate-50'
                    }`}
                  >
                    {alt.adopted ? (
                      <CheckCircle2 className="h-4 w-4 text-[#0F766E]" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    )}
                    <span>{alt.adopted ? 'Adopted' : 'Adopt Habit'}</span>
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-500">Current Habit</dt>
                  <dd className="mt-0.5 text-sm text-slate-700">{alt.currentHabit}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Recommended Alternative</dt>
                  <dd className="mt-0.5 text-sm text-[#102A43]">{alt.recommendedAlternative}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Calculation Methodology</dt>
                  <dd className="mt-0.5 font-mono text-slate-700">{alt.methodology}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Assumptions & Scope</dt>
                  <dd className="mt-0.5 text-slate-600">{alt.assumptions}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
