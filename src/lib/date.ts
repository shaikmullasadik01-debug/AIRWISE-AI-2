/**
 * Safe ISO timestamp parsing and locale-aware date/time formatters.
 * Prevents RangeError or "Invalid Date" strings when upstream timestamps are malformed.
 */
export function parseIsoTimestampOrNow(raw: unknown): string {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const ms = Date.parse(raw);
    if (Number.isFinite(ms)) {
      return new Date(ms).toISOString();
    }
  }
  return new Date().toISOString();
}

export function formatLocalTime(isoTimestamp: string): string {
  const ms = Date.parse(isoTimestamp);
  if (!Number.isFinite(ms)) return 'Time unavailable';
  return new Date(ms).toLocaleTimeString(undefined, { timeStyle: 'short' });
}

export function formatLocalDateTime(isoTimestamp: string): string {
  const ms = Date.parse(isoTimestamp);
  if (!Number.isFinite(ms)) return 'Timestamp unavailable';
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
