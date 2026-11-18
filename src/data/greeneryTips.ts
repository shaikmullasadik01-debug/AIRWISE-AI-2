import type { GreeneryTip } from '../types/airwise.ts';

const GREENERY_TIPS: readonly GreeneryTip[] = [
  {
    id: 'tip-balcony-shade',
    category: 'Balcony & Home',
    title: 'Grow vertical trellis climbers & hardy potted shrubs on sunlit balconies',
    actionSummary:
      'Use drought-tolerant native species in terracotta planters or cedar trellises to shade exposed concrete walls and trap coarse roadside dust.',
    carbonBenefit:
      'External vegetative shading reduces wall heat gain, helping lower summer mechanical cooling electricity demand.',
    airQualityScope:
      'Traps settling coarse dust (PM10) outdoors; keep windows sealed and rely on HEPA filtration indoors when PM2.5 spikes.',
    careEffort: 'Low',
    bestSeason: 'Post-monsoon & Spring',
    imageUrl: '/src/assets/images/greenery_balcony_garden_1795018868154.jpg',
    imageAlt:
      'Sunlit urban apartment balcony with vertical wooden trellis planters and terracotta potted shrubs',
    imageFallbackTitle: 'Balcony Vertical Greenery',
    steps: [
      'Select hardy local species (e.g., jasmine, bougainvillea, vetiver, or rosemary) suited to your sun exposure.',
      'Use terracotta pots with drip trays and organic mulch to cut watering evaporation by up to 40%.',
      'Rinse dusty foliage with collected rainwater every 2 weeks so leaf surfaces keep capturing coarse particles.',
    ],
  },
  {
    id: 'tip-avenue-canopy',
    category: 'Neighborhood & Street',
    title: 'Protect & expand mature street tree canopy and shaded walking corridors',
    actionSummary:
      'Support housing-society tree pits and wide root zones along neighborhood footpaths so residents can walk or cycle comfortably under natural shade.',
    carbonBenefit:
      'Shaded walkways encourage short car-free errands (0 kg operational CO2e/km) and cool asphalt microclimates by 2–4°C.',
    airQualityScope:
      'Mature tree canopies intercept coarse dust and reduce local ozone formation rates via lower surface temperatures.',
    careEffort: 'Moderate',
    bestSeason: 'Early Monsoon',
    imageUrl: '/src/assets/images/urban_tree_canopy_1795018868663.jpg',
    imageAlt:
      'Tree-lined urban street with mature shaded canopy, native roadside bioswale, and pedestrian walkway',
    imageFallbackTitle: 'Urban Street Canopy',
    steps: [
      'Leave at least 1.5 m × 1.5 m of unsealed permeable soil around street tree trunks instead of pouring concrete.',
      'Choose deep-rooted native shade trees over fast-growing water-intensive exotics.',
      'Pair community tree care drives with shaded walk-to-school or metro-feeder routes when outdoor AQI <= 100.',
    ],
  },
  {
    id: 'tip-compost-no-burn',
    category: 'Soil & Compost',
    title: 'Turn dry leaves & kitchen scraps into garden mulch instead of burning',
    actionSummary:
      'Set up a compact aerated compost bin or leaf-mold pit for prunings and vegetable peels, replacing open yard burning.',
    carbonBenefit:
      'Diverting 5 kg/week of organic waste avoids ~3.50 kg CO2e/week in landfill methane and synthetic fertilizer use.',
    airQualityScope:
      'Eliminating backyard leaf burning immediately prevents dense neighborhood PM2.5, black carbon, and PAH smoke.',
    careEffort: 'Low',
    bestSeason: 'Year-round',
    imageUrl: '/src/assets/images/compost_zero_waste_1795018869469.jpg',
    imageAlt:
      'Sunlit garden corner featuring an enclosed wooden composter, dark soil bed, and potted herbs',
    imageFallbackTitle: 'Zero-Burn Leaf Composting',
    steps: [
      'Layer 2 parts dry brown leaves or shredded cardboard with 1 part moist kitchen vegetable scraps.',
      'Keep the bin slightly damp like a wrung sponge and turn every 10–14 days for odor-free aerobic breakdown.',
      'Spread finished dark compost as top mulch in balcony pots to retain moisture and cut potted soil purchases.',
    ],
  },
  {
    id: 'tip-west-window-shade',
    category: 'Energy & Cooling',
    title: 'Combine exterior plant shading with solar & louvered window cooling',
    actionSummary:
      'Block afternoon solar heat before it hits glass using pergola vines, exterior bamboo chicks, or louvered shutters alongside rooftop solar.',
    carbonBenefit:
      'Lowering indoor heat gain cuts air-conditioning runtime by 1.0–1.5 kWh/day (~5.0–7.5 kg CO2e/week on coal-heavy grids).',
    airQualityScope:
      'Allows you to raise AC setpoints to 24–25°C without overheating closed rooms during high-AQI afternoons.',
    careEffort: 'Low',
    bestSeason: 'Pre-summer',
    imageUrl: '/src/assets/images/home_solar_efficiency_1795018869134.jpg',
    imageAlt:
      'Modern urban home with rooftop solar panels, wooden louvered window shades, and terrace greenery',
    imageFallbackTitle: 'Passive Solar & Green Shading',
    steps: [
      'Prioritize shading south- and west-facing windows first, where afternoon heat load peaks.',
      'Pair exterior plant screens or louvers with ceiling fans so 24–25°C feels as comfortable as 21°C.',
      'If rooftop space is shared, advocate for housing-society rooftop solar for common elevators and corridor lighting.',
    ],
  },
  {
    id: 'tip-courtyard-bioswale',
    category: 'Neighborhood & Street',
    title: 'Replace bare dusty soil patches with native groundcover & mulch beds',
    actionSummary:
      'Cover bare roadside dirt strips or apartment setbacks with hardy perennial groundcover and woodchip mulch to stop windblown dust.',
    carbonBenefit:
      'Builds organic soil carbon locally while eliminating fuel-powered leaf blowers and frequent synthetic lawn mowing.',
    airQualityScope:
      'Directly suppresses soil and road-verge PM10 resuspension during dry, windy pre-monsoon afternoons.',
    careEffort: 'Low',
    bestSeason: 'Monsoon onset',
    imageUrl: '/src/assets/images/community_clean_air_1794844257865.jpg',
    imageAlt:
      'Neighborhood residents tending park trees and shaded cycling paths in crisp sunlight',
    imageFallbackTitle: 'Dust-Free Native Groundcover',
    steps: [
      'Identify bare dusty verge strips near building gates or driveways.',
      'Plant drought-tolerant creeping groundcovers and border with 5 cm of leaf mulch.',
      'Water deeply once a week rather than shallow daily misting to build resilient root depth.',
    ],
  },
  {
    id: 'tip-indoor-science-balance',
    category: 'Balcony & Home',
    title: 'Enjoy indoor culinary herbs safely while keeping HEPA filtration primary',
    actionSummary:
      'Keep low-moisture kitchen herbs on sunny windowsills for cooking self-reliance and stress relief, paired with realistic indoor air controls.',
    carbonBenefit:
      'Growing fresh herbs at home trims small plastic-packaged grocery trips while promoting attentive home energy habits.',
    airQualityScope:
      'Important nuance: Chamber research confirms indoor potted plants do NOT remove hazardous PM2.5 during winter smog—always rely on true HEPA filtration and range-hood venting.',
    careEffort: 'Low',
    bestSeason: 'Year-round',
    imageUrl: '/src/assets/images/family_clean_home_1794843520942.jpg',
    imageAlt:
      'Bright living room with sunlit window, clean indoor plants, and active HEPA air purifier',
    imageFallbackTitle: 'Realistic Indoor Greenery & HEPA',
    steps: [
      'Use clean breathable potting mix and avoid over-watering to prevent indoor mold spores.',
      'Keep air purifiers clear of plant foliage so intake vents maintain unobstructed CADR airflow.',
      'Never burn incense, mosquito coils, or scented candles indoors near plants or bedrooms.',
    ],
  },
];

export function getGreeneryTips(): GreeneryTip[] {
  return GREENERY_TIPS.map((tip) => ({ ...tip, steps: [...tip.steps] }));
}
