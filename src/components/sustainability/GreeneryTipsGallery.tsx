import { useMemo, useState } from 'react';
import { BookmarkCheck, BookmarkPlus, Sprout } from 'lucide-react';
import type { GreeneryTip, GreeneryTipCategory } from '../../types/airwise.ts';
import { SafeImage } from '../SafeImage.tsx';

interface GreeneryTipsGalleryProps {
  tips: readonly GreeneryTip[];
  savedTipIds: readonly string[];
  onToggleSavedTip: (id: string) => void;
}

type TipFilter = 'All' | GreeneryTipCategory;

const TIP_FILTERS: readonly TipFilter[] = [
  'All',
  'Balcony & Home',
  'Neighborhood & Street',
  'Soil & Compost',
  'Energy & Cooling',
];

export function GreeneryTipsGallery({
  tips,
  savedTipIds,
  onToggleSavedTip,
}: GreeneryTipsGalleryProps) {
  const [filter, setFilter] = useState<TipFilter>('All');
  const savedSet = useMemo(() => new Set(savedTipIds), [savedTipIds]);

  const visibleTips = useMemo(
    () => (filter === 'All' ? tips : tips.filter((tip) => tip.category === filter)),
    [filter, tips]
  );

  return (
    <section aria-label="Urban Greenery Tips" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#20C997]">
            <Sprout className="h-4 w-4" aria-hidden="true" />
            <span>Urban Greenery & Cooling Practice</span>
          </div>
          <h2 className="mt-1 font-display text-lg font-bold text-[#102A43]">
            Practical Greenery Tips for Cleaner Air & Lower Cooling Load
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Save seasonal balcony, composting, and neighborhood canopy actions to your household plan ({savedTipIds.length} saved).
          </p>
        </div>

        <div
          className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5"
          role="tablist"
          aria-label="Filter greenery tips by setting"
        >
          {TIP_FILTERS.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(cat)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                  active ? 'bg-[#102A43] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
        role="tabpanel"
        aria-label={`${filter} greenery tips`}
      >
        {visibleTips.map((tip) => {
          const isSaved = savedSet.has(tip.id);
          return (
            <article
              key={tip.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="aspect-4/3 w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                <SafeImage
                  src={tip.imageUrl}
                  alt={tip.imageAlt}
                  fallbackTitle={tip.imageFallbackTitle}
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-[#102A43]">{tip.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tip.careEffort} care effort</span>
                    <span aria-hidden="true">·</span>
                    <span>Best season: {tip.bestSeason}</span>
                  </div>

                  <h3 className="mt-1.5 font-display text-base font-bold text-[#102A43] text-balance">
                    {tip.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{tip.actionSummary}</p>

                  <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <dt className="font-semibold text-[#20C997]">Carbon & Energy Effect</dt>
                      <dd className="mt-0.5 text-slate-700">{tip.carbonBenefit}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Air Quality Scope</dt>
                      <dd className="mt-0.5 text-slate-600">{tip.airQualityScope}</dd>
                    </div>
                  </dl>

                  <ul className="mt-3 list-disc space-y-1 border-t border-slate-100 pt-3 pl-4 text-xs text-slate-600">
                    {tip.steps.map((step) => (
                      <li key={`${tip.id}-${step}`}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onToggleSavedTip(tip.id)}
                    aria-pressed={isSaved}
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                      isSaved
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'border-slate-300 bg-white text-[#102A43] hover:bg-slate-50'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-[#20C997]" aria-hidden="true" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    )}
                    <span>{isSaved ? 'Saved to Household Plan' : 'Save Tip'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
