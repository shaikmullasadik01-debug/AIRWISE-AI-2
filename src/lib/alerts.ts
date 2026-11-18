import type { EnvironmentalSnapshot, SmartAlert } from '../types/airwise.ts';

export function buildSmartAlerts(snapshot: EnvironmentalSnapshot): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date().toISOString();
  const aqi = snapshot.cpcbAqi;
  const pm25 = snapshot.pollutants.pm25;

  if (aqi !== null && aqi > 300) {
    alerts.push({
      id: 'alert-severe',
      type: 'severe_aqi',
      severity: 'Critical',
      title: `${snapshot.cpcbCategory} Air Quality Alert (CPCB AQI ${aqi})`,
      message: `Outdoor air in ${snapshot.location.name} is ${snapshot.cpcbCategory}. Avoid outdoor exercise, keep windows closed, and prioritize indoor HEPA filtration.`,
      actionLabel: 'Open Daily Routine',
      targetPage: 'routine',
      timestamp: now,
      read: false,
    });
  } else if (aqi !== null && aqi > 200) {
    alerts.push({
      id: 'alert-poor',
      type: 'severe_aqi',
      severity: 'Warning',
      title: `Poor Air Quality Advisory (CPCB AQI ${aqi})`,
      message: `Particulate levels in ${snapshot.location.name} may cause discomfort on prolonged exposure. Children and older adults should limit outdoor exertion.`,
      actionLabel: 'View Family Guidance',
      targetPage: 'assistant',
      timestamp: now,
      read: false,
    });
  }

  // Check rising PM2.5 in next 6 hours from hourly forecast
  const forecastPoints = snapshot.hourly.filter((h) => h.isForecast).slice(0, 6);
  const maxForecastPm25 = forecastPoints.reduce(
    (m, p) => (p.pm25 !== null && p.pm25 > m ? p.pm25 : m),
    0
  );
  if (pm25 !== null && maxForecastPm25 > pm25 * 1.25 && maxForecastPm25 > 45) {
    alerts.push({
      id: 'alert-rising',
      type: 'rising_pm25',
      severity: 'Warning',
      title: 'Forecasted PM2.5 Rise in Next 6 Hours',
      message: `Provider forecast indicates PM2.5 climbing from ${pm25} µg/m³ toward ~${Math.round(maxForecastPm25)} µg/m³. Plan outdoor errands earlier and close windows before evening.`,
      actionLabel: 'Inspect Forecast',
      targetPage: 'insights',
      timestamp: now,
      read: false,
    });
  }

  // Good ventilation window detection
  if (aqi !== null && aqi <= 100) {
    alerts.push({
      id: 'alert-vent',
      type: 'ventilation_window',
      severity: 'Info',
      title: 'Suitable Cross-Ventilation Window Active',
      message: `Outdoor AQI is ${aqi} (${snapshot.cpcbCategory}). Opening opposite windows for 15–20 minutes can safely refresh indoor air.`,
      actionLabel: 'Indoor Optimizer',
      targetPage: 'indoor',
      timestamp: now,
      read: false,
    });
  }

  alerts.push({
    id: 'alert-filter',
    type: 'filter_maintenance',
    severity: 'Advisory',
    title: 'Monthly Pre-Filter & Exhaust Check',
    message:
      'Check purifier pre-filters and kitchen range hood grease traps to maintain airflow efficiency during urban haze episodes.',
    actionLabel: 'Room Checklist',
    targetPage: 'indoor',
    timestamp: now,
    read: false,
  });

  alerts.push({
    id: 'alert-sustain',
    type: 'sustainability_goal',
    severity: 'Info',
    title: 'Weekly Low-Emission Check-In',
    message:
      'Log car trips replaced by public transit or energy savings to measure your household CO2e impact.',
    actionLabel: 'Open Calculator',
    targetPage: 'calculator',
    timestamp: now,
    read: false,
  });

  return alerts;
}
