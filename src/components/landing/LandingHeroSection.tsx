import { ArrowRight, Bot } from 'lucide-react';
import type { EnvironmentalSnapshot, PageId } from '../../types/airwise.ts';
import { formatLocalTime } from '../../lib/date.ts';
import { SafeImage } from '../SafeImage.tsx';
import { AqiStatusBadge } from '../AqiBadge.tsx';

interface LandingHeroSectionProps {
  snapshot: EnvironmentalSnapshot;
  onNavigate: (page: PageId) => void;
}

export function LandingHeroSection({ snapshot, onNavigate }: LandingHeroSectionProps) {
  const isLive = snapshot.dataStatus === 'LIVE' || snapshot.dataStatus === 'CACHED';

  return (
    <section id="live-air" className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16">
        <div className="flex flex-col justify-center lg:col-span-6">
          <p className="text-xs font-semibold tracking-wide text-[#0F766E]">
            Urban Environmental Intelligence · CPCB & WHO Aligned
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,4vw,3.6rem)] font-extrabold leading-[1.08] tracking-tight text-[#102A43] text-balance">
            BREATHE BETTER. LIVE SMARTER.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Your intelligent companion for cleaner air, healthier homes, and sustainable everyday living.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#102A43] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              <span>Explore My Air Quality</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#102A43] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              <Bot className="h-4 w-4 text-[#0F766E]" aria-hidden="true" />
              <span>Meet Your AI Assistant</span>
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-[#F4F8FB] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>
                {isLive ? 'Live Regional Reading' : 'Offline Demonstration Snapshot'} ·{' '}
                <strong className="text-[#102A43]">
                  {snapshot.location.name}, {snapshot.location.country}
                </strong>
              </span>
              <span className="font-mono tabular-nums">{formatLocalTime(snapshot.measuredAt)}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <AqiStatusBadge category={snapshot.cpcbCategory} aqi={snapshot.cpcbAqi} />
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <span className="block text-slate-600">PM2.5</span>
                  <span className="font-mono text-sm font-semibold text-[#102A43] tabular-nums">
                    {snapshot.pollutants.pm25 !== null ? `${snapshot.pollutants.pm25} µg/m³` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-600">US AQI</span>
                  <span className="font-mono text-sm font-semibold text-[#102A43] tabular-nums">
                    {snapshot.usAqi ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-600">Wind</span>
                  <span className="font-mono text-sm font-semibold text-[#102A43] tabular-nums">
                    {snapshot.weather.windSpeedKmh !== null
                      ? `${snapshot.weather.windSpeedKmh} km/h`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:h-full">
            <SafeImage
              src="/src/assets/images/hero_clean_city_1794843521205.jpg"
              alt="Sunlit modern green urban neighborhood with clear sky and pedestrian promenade"
              fallbackTitle="Clean Urban Living"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
