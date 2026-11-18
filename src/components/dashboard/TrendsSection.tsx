import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Table } from 'lucide-react';
import type { EnvironmentalSnapshot } from '../../types/airwise.ts';
import { analyzePollutionInsights } from '../../lib/recommendations.ts';
import { AccessibleHourlyTable } from '../AccessibleHourlyTable.tsx';

interface TrendsSectionProps {
  snapshot: EnvironmentalSnapshot;
}

export function TrendsSection({ snapshot }: TrendsSectionProps) {
  const [showAccessibleTable, setShowAccessibleTable] = useState(false);

  const insights = useMemo(() => analyzePollutionInsights(snapshot), [snapshot]);

  const chartData = useMemo(
    () =>
      snapshot.hourly.map((h) => ({
        time: h.time,
        label: h.label,
        pm25: h.pm25,
        pm10: h.pm10,
        cpcbAqi: h.cpcbAqi,
        phase: h.isForecast ? 'Forecast' : 'Observed',
      })),
    [snapshot.hourly]
  );

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-12" aria-label="Pollution Trends and Distribution">
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-[#102A43]">
              48-Hour Particulate Trend (Observed + Provider Forecast)
            </h2>
            <p className="text-xs text-slate-500">
              Hourly PM2.5 and PM10 concentrations in µg/m³ ({snapshot.location.name})
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAccessibleTable((v) => !v)}
            aria-expanded={showAccessibleTable}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-[#102A43] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          >
            <Table className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{showAccessibleTable ? 'Hide Data Table' : 'Accessible Table'}</span>
          </button>
        </div>

        <div className="mt-4 h-64 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" µg" />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  borderColor: '#CBD5E1',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="pm10"
                name="PM10 (µg/m³)"
                stroke="#38BDF8"
                fill="#38BDF8"
                fillOpacity={0.14}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pm25"
                name="PM2.5 (µg/m³)"
                stroke="#102A43"
                fill="#20C997"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {showAccessibleTable && (
          <AccessibleHourlyTable rows={chartData} mode="particulates" />
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
        <h2 className="font-display text-base font-bold text-[#102A43]">
          AQI Category Distribution
        </h2>
        <p className="text-xs text-slate-500">Hours per CPCB category in 48h window</p>
        <div className="mt-4 h-48 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insights.categoryDistribution} layout="vertical" margin={{ left: 10, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#102A43' }} width={86} />
              <Tooltip />
              <Bar dataKey="hours" name="Hours" radius={[0, 4, 4, 0]}>
                {insights.categoryDistribution.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ul className="sr-only" aria-label="AQI Category Distribution Summary">
          {insights.categoryDistribution.map((entry) => (
            <li key={`sr-${entry.category}`}>
              {entry.category}: {entry.hours} hours
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-[#102A43]">3-Day Daily Outlook</p>
          {snapshot.daily.map((day) => (
            <div key={day.date} className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{day.label}</span>
              <span className="font-mono text-slate-500 tabular-nums">
                {day.avgPm25 !== null ? `${day.avgPm25} µg/m³` : 'N/A'}
              </span>
              <span className="font-semibold text-[#102A43]">{day.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
