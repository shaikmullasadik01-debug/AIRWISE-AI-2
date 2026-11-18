import { useEffect, useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateCarbonImpact, type CarbonCalculatorInput } from '../lib/impact.ts';
import { CarbonControlsPanel } from '../components/calculator/CarbonControlsPanel.tsx';
import { CarbonReductionGallery } from '../components/sustainability/CarbonReductionGallery.tsx';

interface CalculatorPageProps {
  input: CarbonCalculatorInput;
  onChangeInput: (next: CarbonCalculatorInput) => void;
  onResetInput: () => void;
}

const SHORT_NAMES: Record<string, string> = {
  transit: 'Transit',
  carpool: 'Carpool',
  active: 'Walk/Cycle',
  electricity: 'Power',
  led: 'LEDs',
  waste: 'Waste',
};

export function CalculatorPage({ input, onChangeInput, onResetInput }: CalculatorPageProps) {
  const result = useMemo(() => calculateCarbonImpact(input), [input]);
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  function updateField<K extends keyof CarbonCalculatorInput>(
    key: K,
    value: CarbonCalculatorInput[K]
  ) {
    onChangeInput({ ...input, [key]: value });
  }

  function applyScenarioPatch(title: string, patch: Partial<CarbonCalculatorInput>) {
    onChangeInput({ ...input, ...patch });
    setAppliedBanner(
      `Applied scenario: ${title}. Recalculated weekly and annual CO2e savings above.`
    );
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setAppliedBanner(null), 4000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const chartData = useMemo(
    () =>
      result.breakdown.map((b) => ({
        name: SHORT_NAMES[b.id] ?? b.label,
        Baseline: b.baselineKgPerWeek,
        Alternative: b.alternativeKgPerWeek,
      })),
    [result.breakdown]
  );

  return (
    <div className="space-y-6">
      {/* Top KPI Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Calculated CO2e Savings">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Daily Savings</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#102A43] tabular-nums">
            {result.dailySavingsKg.toFixed(2)} kg
          </p>
          <p className="mt-1 text-[11px] text-slate-500">CO2e / day</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Weekly Savings</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#0F766E] tabular-nums">
            {result.weeklySavingsKg.toFixed(2)} kg
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Baseline {result.weeklyBaselineKg} − Alt {result.weeklyAlternativeKg}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Monthly Savings</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#102A43] tabular-nums">
            {result.monthlySavingsKg.toFixed(1)} kg
          </p>
          <p className="mt-1 text-[11px] text-slate-500">30-day projection</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Annual Household Impact</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#102A43] tabular-nums">
            {result.annualSavingsKg.toFixed(0)} kg
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {result.perPersonAnnualSavingsKg.toFixed(0)} kg/member ·{' '}
            {result.community100HomesAnnualTonnes.toFixed(1)} t per 100 homes
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <CarbonControlsPanel
          input={input}
          onChangeField={updateField}
          onResetInput={onResetInput}
        />

        {/* Chart & Methodology */}
        <section className="space-y-5 lg:col-span-7" aria-label="Emissions Comparison and Breakdown">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-base font-bold text-[#102A43]">
              Baseline vs. Low-Emission Alternative (Weekly kg CO2e)
            </h2>
            <p className="text-xs text-slate-500">
              Formula: Estimated CO2e Savings = Baseline Emissions − Alternative Emissions (±
              {result.uncertaintyRangePercent}% uncertainty band)
            </p>
            <div className="mt-4 h-64 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} unit=" kg" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Baseline" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Alternative" fill="#20C997" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold text-[#102A43]">
              Transparent Factor Breakdown (Weekly kg CO2e)
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Weekly baseline vs low-emission alternative CO2e breakdown by household activity
                </caption>
                <thead className="border-b border-slate-200 text-slate-600">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                    <th scope="col" className="py-2 px-2 text-right font-semibold">Baseline</th>
                    <th scope="col" className="py-2 px-2 text-right font-semibold">Alternative</th>
                    <th scope="col" className="py-2 pl-2 text-right font-semibold">Net Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.breakdown.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2 pr-3">
                        <div className="font-medium text-[#102A43]">{row.label}</div>
                        <div className="text-[11px] text-slate-600">{row.factorSummary}</div>
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums">
                        {row.baselineKgPerWeek}
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums">
                        {row.alternativeKgPerWeek}
                      </td>
                      <td className="py-2 pl-2 text-right font-mono font-semibold text-[#0F766E] tabular-nums">
                        {row.savingsKgPerWeek}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Assumptions & Carbon vs Exposure Note */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2" aria-label="Methodology and Context">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-sm font-bold text-[#102A43]">
            Assumptions & Uncertainty Disclosure
          </h2>
          <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-xs text-slate-600">
            {result.assumptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-5 text-xs text-[#102A43]">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
            <div>
              <h2 className="font-display text-sm font-bold">
                Carbon Reduction vs. Personal Exposure Reduction
              </h2>
              <p className="mt-1.5 leading-relaxed text-slate-700">{result.exposureVsCarbonNote}</p>
            </div>
          </div>
        </div>
      </section>

      {appliedBanner && (
        <output className="block rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">
          {appliedBanner}
        </output>
      )}

      <CarbonReductionGallery
        heading="Visual Actions to Reduce Household Carbon Emissions"
        subtitle="Select any pictured practice below to load its typical weekly activity shift into your calculator."
        actionLabel="Apply Action Values"
        onSelectAction={(action) => applyScenarioPatch(action.title, action.presetPatch)}
      />
    </div>
  );
}
