import { ArrowRight, Leaf } from 'lucide-react';
import type { CarbonCalculatorInput } from '../../lib/impact.ts';
import { SafeImage } from '../SafeImage.tsx';

export interface CarbonVisualAction {
  id: string;
  domainLabel: string;
  title: string;
  summary: string;
  impactMetric: string;
  imageUrl: string;
  imageAlt: string;
  imageFallbackTitle: string;
  presetPatch: Partial<CarbonCalculatorInput>;
}

const CARBON_VISUAL_ACTIONS: readonly CarbonVisualAction[] = [
  {
    id: 'action-transit',
    domainLabel: 'Clean Mobility',
    title: 'Shift Solo Car Commutes to Metro, Bus & Cycling',
    summary:
      'Replacing 36 km/week of urban solo driving with rail/bus plus 10 km cycling cuts fuel burn and tailpipe NO2 near schools.',
    impactMetric: '−6.38 kg CO2e/wk',
    imageUrl: '/src/assets/images/sustainable_commute_1794843521630.jpg',
    imageAlt: 'Electric urban light rail tram alongside a shaded tree-lined cycling path',
    imageFallbackTitle: 'Public Transit & Active Travel',
    presetPatch: {
      carKmReplacedByTransitPerWeek: 36,
      carKmReplacedByWalkCyclePerWeek: 10,
    },
  },
  {
    id: 'action-solar-cooling',
    domainLabel: 'Home Energy',
    title: 'Shade Windows, Upgrade LEDs & Tap Rooftop Solar',
    summary:
      'External louvers, green shading, 8 LED upgrades, and setting cooling to 25°C trim weekday grid peak electricity.',
    impactMetric: '−16.72 kg CO2e/wk',
    imageUrl: '/src/assets/images/home_solar_efficiency_1795018869134.jpg',
    imageAlt: 'Modern eco-conscious home with rooftop solar array, wooden window louvers, and terrace greenery',
    imageFallbackTitle: 'Solar & Passive Cooling',
    presetPatch: {
      electricitySavedKwhPerWeek: 16,
      ledBulbsReplacedCount: 8,
    },
  },
  {
    id: 'action-compost',
    domainLabel: 'Zero-Burn Organics',
    title: 'Compost Garden Leaves & Food Scraps',
    summary:
      'Diverting 6 kg/week of organic waste into home garden mulch eliminates landfill methane and toxic open leaf-smoke.',
    impactMetric: '−4.20 kg CO2e/wk',
    imageUrl: '/src/assets/images/compost_zero_waste_1795018869469.jpg',
    imageAlt: 'Sunlit garden composter surrounded by potted herbs and rich organic soil',
    imageFallbackTitle: 'Garden & Kitchen Composting',
    presetPatch: {
      wasteReducedKgPerWeek: 6,
    },
  },
  {
    id: 'action-canopy-balcony',
    domainLabel: 'Urban Greenery',
    title: 'Cool Façades with Vertical Trellises & Tree Shade',
    summary:
      'Planting hardy shrubs on west-facing balconies and keeping street tree beds permeable reduces summer building heat gain.',
    impactMetric: '−5.73 kg CO2e/wk',
    imageUrl: '/src/assets/images/greenery_balcony_garden_1795018868154.jpg',
    imageAlt: 'Sunlit balcony garden with vertical timber trellises and terracotta potted shrubs',
    imageFallbackTitle: 'Green Balcony Cooling',
    presetPatch: {
      electricitySavedKwhPerWeek: 8,
    },
  },
];

interface CarbonReductionGalleryProps {
  heading: string;
  subtitle: string;
  actionLabel: string;
  onSelectAction: (action: CarbonVisualAction) => void;
}

export function CarbonReductionGallery({
  heading,
  subtitle,
  actionLabel,
  onSelectAction,
}: CarbonReductionGalleryProps) {
  return (
    <section aria-label="Visual Carbon Reduction Guide" className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E]">
          <Leaf className="h-4 w-4" aria-hidden="true" />
          <span>Visual Carbon Reduction Playbook</span>
        </div>
        <h2 className="mt-1 font-display text-lg font-bold text-[#102A43]">{heading}</h2>
        <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARBON_VISUAL_ACTIONS.map((action) => (
          <article
            key={action.id}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="aspect-4/3 w-full overflow-hidden border-b border-slate-200 bg-slate-100">
              <SafeImage
                src={action.imageUrl}
                alt={action.imageAlt}
                fallbackTitle={action.imageFallbackTitle}
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-500">{action.domainLabel}</span>
                  <span className="font-mono font-bold text-[#0F766E] tabular-nums">
                    {action.impactMetric}
                  </span>
                </div>
                <h3 className="mt-1.5 font-display text-sm font-bold text-[#102A43] text-balance">
                  {action.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{action.summary}</p>
              </div>

              <button
                type="button"
                onClick={() => onSelectAction(action)}
                className="mt-4 inline-flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#102A43] transition-colors hover:border-[#102A43] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
