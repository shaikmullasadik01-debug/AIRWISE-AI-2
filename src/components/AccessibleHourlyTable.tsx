export interface HourlyTableRow {
  time?: string;
  label: string;
  phase: string;
  pm25?: number | null;
  pm10?: number | null;
  cpcbAqi: number | null;
  windSpeedKmh?: number | null;
}

interface AccessibleHourlyTableProps {
  rows: HourlyTableRow[];
  mode: 'particulates' | 'dispersion';
}

export function AccessibleHourlyTable({ rows, mode }: AccessibleHourlyTableProps) {
  const caption =
    mode === 'particulates'
      ? 'Hourly PM2.5, PM10, and CPCB AQI readings across observed and forecast hours'
      : 'Hourly CPCB AQI and wind dispersion speed readings across observed and forecast hours';

  return (
    <div className="mt-4 max-h-56 overflow-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Time</th>
            <th scope="col" className="px-3 py-2 font-semibold">Phase</th>
            {mode === 'particulates' ? (
              <>
                <th scope="col" className="px-3 py-2 text-right font-semibold">PM2.5 (µg/m³)</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">PM10 (µg/m³)</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">CPCB AQI</th>
              </>
            ) : (
              <>
                <th scope="col" className="px-3 py-2 text-right font-semibold">CPCB AQI</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Wind (km/h)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
          {rows.slice(0, 24).map((row) => (
            <tr key={row.time ?? `${row.label}-${row.phase}`}>
              <td className="px-3 py-1.5">{row.label}</td>
              <td className="px-3 py-1.5 font-sans">{row.phase}</td>
              {mode === 'particulates' ? (
                <>
                  <td className="px-3 py-1.5 text-right">{row.pm25 ?? 'N/A'}</td>
                  <td className="px-3 py-1.5 text-right">{row.pm10 ?? 'N/A'}</td>
                  <td className="px-3 py-1.5 text-right">{row.cpcbAqi ?? 'N/A'}</td>
                </>
              ) : (
                <>
                  <td className="px-3 py-1.5 text-right">{row.cpcbAqi ?? 'N/A'}</td>
                  <td className="px-3 py-1.5 text-right">{row.windSpeedKmh ?? 'N/A'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
