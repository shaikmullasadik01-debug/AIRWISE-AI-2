import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import type { DataStatus, EnvironmentalSnapshot } from '../types/airwise.ts';
import { formatLocalDateTime, formatLocalTime } from '../lib/date.ts';

interface DataStatusBannerProps {
  snapshot: EnvironmentalSnapshot;
  loading: boolean;
  onRefresh: () => void;
}

interface StatusViewMeta {
  label: string;
  Icon: typeof CheckCircle2;
  iconClass: string;
  cardClass: string;
}

const DATA_STATUS_META: Record<DataStatus, StatusViewMeta> = {
  LIVE: {
    label: 'LIVE ENVIRONMENTAL DATA',
    Icon: CheckCircle2,
    iconClass: 'text-emerald-700',
    cardClass: 'border-slate-200 bg-white text-[#102A43]',
  },
  CACHED: {
    label: 'LIVE FEED (Recent Cache)',
    Icon: Clock,
    iconClass: 'text-sky-700',
    cardClass: 'border-slate-200 bg-white text-[#102A43]',
  },
  DEMO_FALLBACK: {
    label: 'DEMO DATA (Live Feed Unavailable)',
    Icon: AlertCircle,
    iconClass: 'text-amber-700',
    cardClass: 'border-amber-300 bg-amber-50/90 text-amber-950',
  },
  UNAVAILABLE: {
    label: 'DATA UNAVAILABLE',
    Icon: AlertCircle,
    iconClass: 'text-amber-700',
    cardClass: 'border-amber-300 bg-amber-50/90 text-amber-950',
  },
};

export function DataStatusBanner({ snapshot, loading, onRefresh }: DataStatusBannerProps) {
  const isInitialConnecting =
    loading && snapshot.statusMessage.startsWith('Connecting to live');

  const meta: StatusViewMeta = isInitialConnecting
    ? {
        label: 'FETCHING LIVE ENVIRONMENTAL DATA',
        Icon: RefreshCw,
        iconClass: 'animate-spin text-sky-700',
        cardClass: 'border-slate-200 bg-white text-[#102A43]',
      }
    : DATA_STATUS_META[snapshot.dataStatus];

  const { Icon } = meta;
  const formattedMeasured = formatLocalDateTime(snapshot.measuredAt);
  const formattedUpdated = formatLocalTime(snapshot.lastSuccessfulUpdate);

  return (
    <section
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${meta.cardClass}`}
      aria-label="Environmental Data Provenance"
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.iconClass}`} aria-hidden="true" />
        <div className="space-y-0.5 text-sm" aria-live="polite">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-medium">
            <span className="font-semibold">{meta.label}</span>
            <span className="text-slate-700">— {snapshot.stationLabel}</span>
          </div>
          <p className="text-xs text-slate-600">
            {snapshot.statusMessage} Provider: {snapshot.provider}. Observation:{' '}
            <span className="font-mono tabular-nums">{formattedMeasured}</span> · Synced:{' '}
            <span className="font-mono tabular-nums">{formattedUpdated}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#102A43] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] disabled:opacity-50 whitespace-nowrap shrink-0"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>{loading ? 'Refreshing...' : 'Refresh Feed'}</span>
      </button>
    </section>
  );
}
