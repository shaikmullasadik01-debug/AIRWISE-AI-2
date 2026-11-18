/**
 * Shared geographic and grid-region helpers used by both client UI and backend routes.
 */
export function isWithinIndiaBounds(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= 6.5 &&
    latitude <= 36.0 &&
    longitude >= 68.0 &&
    longitude <= 97.5
  );
}

export function parseGridRegion(value: string): 'INDIA' | 'GLOBAL' {
  return value === 'GLOBAL' ? 'GLOBAL' : 'INDIA';
}
