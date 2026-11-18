import type {
  EnvironmentalSnapshot,
  FamilyProfile,
  HouseholdGroup,
  RoutineSlot,
  StructuredRecommendation,
} from '../types/airwise.ts';

const HOUSEHOLD_LABELS: Record<HouseholdGroup, string> = {
  adults: 'Adults',
  children: 'Children',
  olderAdults: 'Older adults',
  respiratorySensitivities: 'Respiratory sensitivities',
  outdoorWorkers: 'Outdoor workers',
  fitnessEnthusiasts: 'Fitness enthusiasts',
  workFromHome: 'Work from home',
  dailyCommuters: 'Daily commuters',
};

export function formatHouseholdGroups(groups: HouseholdGroup[]): string {
  if (!groups.length) return 'General household';
  return groups.map((g) => HOUSEHOLD_LABELS[g] ?? g).join(', ');
}

function resolveRoutineSuitability(
  avoidCondition: boolean,
  cautionCondition: boolean
): RoutineSlot['airSuitability'] {
  if (avoidCondition) return 'Avoid Outdoor Exposure';
  if (cautionCondition) return 'Caution';
  return 'Suitable';
}

function selectByAqiTier<T>(highRisk: boolean, elevated: boolean, highVal: T, elevatedVal: T, lowVal: T): T {
  if (highRisk) return highVal;
  if (elevated) return elevatedVal;
  return lowVal;
}

export function buildDailyRoutine(
  snapshot: EnvironmentalSnapshot,
  profile: FamilyProfile
): RoutineSlot[] {
  const aqi = snapshot.cpcbAqi ?? 120;
  const category = snapshot.cpcbCategory;
  const wind = snapshot.weather.windSpeedKmh ?? 8;
  const hasChildren = profile.groups.includes('children');
  const hasOlder = profile.groups.includes('olderAdults');
  const hasSensitive = profile.groups.includes('respiratorySensitivities');
  const isCommuter = profile.groups.includes('dailyCommuters');
  const isFitness = profile.groups.includes('fitnessEnthusiasts');
  const isOutdoorWorker = profile.groups.includes('outdoorWorkers');

  const highRisk = aqi > 200;
  const elevated = aqi > 100 && aqi <= 200;

  const morningSuitability = resolveRoutineSuitability(
    highRisk,
    elevated || hasSensitive || hasChildren || hasOlder
  );
  const afternoonSuitability = resolveRoutineSuitability(
    aqi > 300,
    aqi > 150 || (wind < 6 && aqi > 100)
  );
  const eveningSuitability = resolveRoutineSuitability(highRisk, elevated);
  const morningSummary = selectByAqiTier(
    highRisk,
    elevated,
    'Elevated morning pollution risk — keep exercise and children indoors.',
    'Moderate morning particulates — favor low-traffic corridors.',
    'Favorable morning air — good window for outdoor movement.'
  );
  const sensitiveQualifier =
    hasChildren || hasSensitive ? ' especially for children and respiratory-sensitive members' : '';
  const morningWhat = selectByAqiTier(
    highRisk,
    elevated,
    'Replace morning outdoor walks, jogging, or playground time with indoor stretching or low-dust home workouts.',
    `Limit vigorous outdoor exertion${sensitiveQualifier}; keep walks to tree-lined side streets away from main roads.`,
    'Proceed with normal outdoor walking or light exercise while checking hourly changes.'
  );

  const morningActions: StructuredRecommendation[] = [
    {
      id: 'morning-check',
      title: highRisk ? 'Move morning exercise indoors' : 'Time morning outdoor activity carefully',
      priority: selectByAqiTier(highRisk, elevated, 'Urgent', 'High', 'Low'),
      what: morningWhat,
      why: `Morning surface inversions and cool temperatures (${snapshot.weather.temperatureC !== null ? `${snapshot.weather.temperatureC}°C` : 'calm air'}) often trap fine particulates near ground level before daytime solar warming disperses them.`,
      when: 'Between 06:00 and 09:30 local time.',
      expectedBenefits: highRisk
        ? 'Significantly lowers inhaled PM2.5 dose during deep breathing.'
        : 'Reduces peak roadside particulate intake during morning rush hour.',
      estimatedImpact: 'Exercise increases breathing volume 3–6x; shifting indoors during Poor+ AQI cuts active PM2.5 inhalation substantially.',
      confidenceAndLimitations: 'High confidence for exposure reduction; exact indoor PM2.5 depends on window sealing and filtration.',
      factBasis: `Current CPCB AQI is ${snapshot.cpcbAqi ?? 'unavailable'} (${category}), PM2.5 is ${snapshot.pollutants.pm25 ?? 'N/A'} µg/m³.`,
    },
  ];

  if (isFitness && (highRisk || elevated)) {
    morningActions.push({
      id: 'morning-fitness',
      title: 'Adapt athletic training intensity',
      priority: 'High',
      what: 'Use indoor cycling, mobility, or strength sessions instead of outdoor tempo runs.',
      why: 'High ventilation rates during cardio bypass nasal filtration and draw fine particulates deeper into airways.',
      when: 'During your planned morning workout window.',
      expectedBenefits: 'Preserves cardiovascular training consistency while avoiding acute airway irritation.',
      estimatedImpact: 'Avoids elevated particulate deposition associated with vigorous outdoor exertion.',
      confidenceAndLimitations: 'Guidance based on standard public-health exercise advisories; consult a physician if you experience symptoms.',
      factBasis: `Dominant pollutant: ${snapshot.dominantPollutant}.`,
    });
  }

  const afternoonActions: StructuredRecommendation[] = [
    {
      id: 'afternoon-commute',
      title: isCommuter || isOutdoorWorker ? 'Use lower-traffic commute corridors' : 'Plan midday errands efficiently',
      priority: highRisk ? 'High' : 'Moderate',
      what: isCommuter
        ? 'Use metro/rail or closed-cabin public transit where available, combine errands into one trip, and avoid idling in congested intersections.'
        : 'Schedule essential outdoor errands during midday dispersion windows rather than peak traffic hours.',
      why: `Wind speed is ${wind} km/h. Road corridors carry elevated NO2 and fresh tailpipe particulates compared to residential blocks.`,
      when: '12:00 to 16:00 local time (usually better vertical mixing than dawn/dusk).',
      expectedBenefits: 'Lowers both personal traffic exhaust exposure and per-trip tailpipe emissions.',
      estimatedImpact: 'Combining errands and choosing transit cuts per-km commute CO2e by ~65% while reducing roadside NO2 exposure.',
      confidenceAndLimitations: 'Midday dispersion is typical but can vary during winter temperature inversions or dust events.',
      factBasis: `Wind speed ${wind} km/h; NO2 reading ${snapshot.pollutants.no2 ?? 'N/A'} µg/m³.`,
    },
  ];

  if (isOutdoorWorker && aqi > 150) {
    afternoonActions.push({
      id: 'afternoon-worker',
      title: 'Wear a well-fitting particulate respirator (N95/FFP2)',
      priority: 'Urgent',
      what: 'Use a properly fitted N95/FFP2 mask during prolonged outdoor work and take scheduled breaks indoors when feasible.',
      why: 'Cloth or loose surgical masks do not seal tightly against fine PM2.5 particulates.',
      when: 'Throughout outdoor shifts whenever AQI exceeds 150.',
      expectedBenefits: 'Significantly reduces inhaled particulate matter when outdoor presence is unavoidable.',
      estimatedImpact: 'Properly sealed N95 respirators filter >=95% of test particulates under standard fit conditions.',
      confidenceAndLimitations: 'Real-world protection drops if facial seal is compromised; replace masks when damp or soiled.',
      factBasis: `CPCB AQI ${aqi} (${category}).`,
    });
  }

  const eveningActions: StructuredRecommendation[] = [
    {
      id: 'evening-ventilation',
      title: aqi <= 100 ? 'Cross-ventilate living spaces briefly' : 'Keep windows closed & dampen dust',
      priority: highRisk ? 'High' : 'Moderate',
      what: aqi <= 100
        ? 'Open opposite windows for 15–25 minutes before evening traffic peaks to refresh indoor CO2 and cooking odors.'
        : 'Keep exterior windows and door gaps sealed; use damp mopping instead of dry sweeping and run kitchen exhaust during cooking.',
      why: aqi <= 100
        ? 'Outdoor air is within Good/Satisfactory bounds, making natural cross-ventilation effective for lowering indoor CO2 and VOCs.'
        : 'Evening cooling and rush-hour traffic typically push PM2.5 upward; dry sweeping resuspends settled dust.',
      when: '17:30 to 20:30 local time.',
      expectedBenefits: aqi <= 100
        ? 'Refreshes indoor oxygen/CO2 balance without elevating indoor PM2.5.'
        : 'Prevents outdoor smog ingress and indoor dust resuspension.',
      estimatedImpact: 'Damp cleaning + range hood venting prevents sharp indoor PM2.5 spikes during dinner prep.',
      confidenceAndLimitations: 'If indoor CO2 rises in sealed rooms, brief targeted ventilation or mechanical filtered air intake is needed.',
      factBasis: `Outdoor PM2.5 is ${snapshot.pollutants.pm25 ?? 'N/A'} µg/m³.`,
    },
  ];

  const nightActions: StructuredRecommendation[] = [
    {
      id: 'night-bedroom',
      title: profile.hasPurifier ? 'Run bedroom HEPA purifier on sleep mode' : 'Prepare clean-air sleep zone',
      priority: highRisk || hasChildren || hasOlder ? 'High' : 'Moderate',
      what: profile.hasPurifier
        ? 'Set your HEPA purifier to continuous quiet/sleep speed with bedroom doors closed and avoid burning incense or candles.'
        : 'Keep bedroom windows latched during overnight smog hours, wipe bedside surfaces with a damp cloth, and maintain 40–55% relative humidity.',
      why: 'Households spend 7–9 continuous hours in bedrooms overnight while ambient winter smog frequently peaks between midnight and 07:00.',
      when: '21:30 until morning wake-up.',
      expectedBenefits: 'Supports cleaner overnight breathing environment for children, older adults, and sensitive individuals.',
      estimatedImpact: 'Maintaining a clean-air bedroom provides 8 hours of reduced particulate exposure daily.',
      confidenceAndLimitations: 'True HEPA filtration captures particulates (PM2.5/PM10) but not gases (NO2/CO) unless equipped with sufficient activated carbon.',
      factBasis: `Outdoor humidity ${snapshot.weather.humidityPercent ?? 'N/A'}%; tomorrow forecast peak is tracked in Insights.`,
    },
  ];

  return [
    {
      period: 'Morning',
      timeWindow: '06:00 – 11:00',
      airSuitability: morningSuitability,
      summary: morningSummary,
      actions: morningActions,
    },
    {
      period: 'Afternoon',
      timeWindow: '11:00 – 17:00',
      airSuitability: afternoonSuitability,
      summary:
        wind >= 10
          ? 'Stronger afternoon breeze aids dispersion; still avoid heavy traffic corridors.'
          : 'Light winds limit dispersion — minimize roadside idling and combine trips.',
      actions: afternoonActions,
    },
    {
      period: 'Evening',
      timeWindow: '17:00 – 21:30',
      airSuitability: eveningSuitability,
      summary:
        aqi <= 100
          ? 'Suitable for brief cross-ventilation before late-evening traffic.'
          : 'Keep home sealed against evening smog buildup; vent kitchen cooking fumes.',
      actions: eveningActions,
    },
    {
      period: 'Night',
      timeWindow: '21:30 – 06:00',
      airSuitability: highRisk ? 'Avoid Outdoor Exposure' : 'Caution',
      summary: 'Protect overnight sleep air quality and check tomorrow’s AQI forecast.',
      actions: nightActions,
    },
  ];
}
