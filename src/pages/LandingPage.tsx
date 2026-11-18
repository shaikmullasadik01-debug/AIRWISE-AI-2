import { ArrowRight, Bot, CheckCircle2, Leaf, ShieldCheck, Users, Wind } from 'lucide-react';
import type { EnvironmentalSnapshot, PageId } from '../types/airwise.ts';
import { formatLocalTime } from '../lib/date.ts';
import { Logo } from '../components/Logo.tsx';
import { SafeImage } from '../components/SafeImage.tsx';
import { AqiStatusBadge } from '../components/AqiBadge.tsx';

interface LandingPageProps {
  snapshot: EnvironmentalSnapshot;
  onNavigate: (page: PageId) => void;
}

interface QuestionCardData {
  step: string;
  accentClass: string;
  colSpanClass: string;
  title: string;
  description: string;
  cta: string;
  targetPage: PageId;
}

const FIVE_QUESTIONS: readonly QuestionCardData[] = [
  {
    step: '01. Ambient Safety',
    accentClass: 'text-[#20C997]',
    colSpanClass: 'md:col-span-3',
    title: 'How safe is the air around me?',
    description:
      'Compare official Indian CPCB NAQI categories, US EPA AQI, and WHO 2021 guideline multiples with live PM2.5, PM10, NO2, SO2, CO, and O3 readings.',
    cta: 'Inspect Live Dashboard',
    targetPage: 'dashboard',
  },
  {
    step: '02. Family Action',
    accentClass: 'text-[#38BDF8]',
    colSpanClass: 'md:col-span-3',
    title: 'What should my family do today?',
    description:
      'Receive morning-to-night schedules and Gemini-powered natural language guidance adapted to children, older adults, commuters, and respiratory sensitivities.',
    cta: 'Open Daily Routine Planner',
    targetPage: 'routine',
  },
  {
    step: '03. Home Protection',
    accentClass: 'text-[#20C997]',
    colSpanClass: 'md:col-span-2',
    title: 'How can I protect indoor air quality?',
    description:
      'Room-by-room checklists for ventilation timing, HEPA filtration, kitchen exhaust, damp cleaning, and humidity control.',
    cta: 'Open Indoor Optimizer',
    targetPage: 'indoor',
  },
  {
    step: '04. Daily Habits',
    accentClass: 'text-[#F59E0B]',
    colSpanClass: 'md:col-span-2',
    title: 'Which habits reduce exposure & emissions?',
    description:
      'Actionable alternatives across transport, home energy, and household routines with transparent confidence ratings.',
    cta: 'Explore Sustainability Hub',
    targetPage: 'sustainability',
  },
  {
    step: '05. Measurable Impact',
    accentClass: 'text-[#102A43]',
    colSpanClass: 'md:col-span-2',
    title: 'How much impact can my choices create?',
    description:
      'Calculate daily, weekly, monthly, and annual CO2e savings from documented emission factors with clear assumptions.',
    cta: 'Launch Impact Calculator',
    targetPage: 'calculator',
  },
];

const WORKFLOW_STEPS = [
  {
    step: 'Step 01',
    title: 'Fetch verified atmospheric & weather feeds',
    description:
      'Server-side requests pull hourly pollutant concentrations and wind/humidity data for your chosen city or coordinates after permission.',
  },
  {
    step: 'Step 02',
    title: 'Contextualize for your household profile',
    description:
      'Without collecting personal medical records, recommendations adjust for children, older adults, daily commuters, or indoor workers.',
  },
  {
    step: 'Step 03',
    title: 'Turn readings into low-exposure, low-carbon habits',
    description:
      'Review morning-to-night schedules, safe ventilation windows, and measurable CO2e reductions in one unified workspace.',
  },
] as const;

const TRUST_PILLARS = [
  {
    title: 'No Invented Measurements',
    description:
      'Live air quality and weather arrive via server-side API calls. If a provider is unreachable, AIRWISE AI explicitly marks the view as DEMO DATA or DATA UNAVAILABLE.',
  },
  {
    title: 'Clear Standard Distinctions',
    description:
      'Indian CPCB NAQI categories, US EPA AQI breakpoints, and WHO 2021 health guidelines are presented side by side so families never confuse scales.',
  },
  {
    title: 'Privacy-First Architecture',
    description:
      'Location detection runs only after explicit permission. Household preferences stay in local browser storage with one-click deletion in Settings & Privacy.',
  },
] as const;

const GREENERY_VISUAL_CARDS = [
  {
    category: 'Balcony & Cooling',
    title: 'Shade walls with vertical greenery to trim summer AC demand',
    imageUrl: '/src/assets/images/greenery_balcony_garden_1795018868154.jpg',
    imageAlt: 'Sunlit apartment balcony filled with native potted plants and vertical timber trellises',
    fallbackTitle: 'Balcony Greenery Shading',
    targetPage: 'sustainability' as PageId,
    cta: 'Explore Greenery Tips',
  },
  {
    category: 'Home Energy',
    title: 'Combine passive window louvers, LEDs & rooftop solar capacity',
    imageUrl: '/src/assets/images/home_solar_efficiency_1795018869134.jpg',
    imageAlt: 'Modern home featuring rooftop solar panels, wooden louvers, and terrace greenery',
    fallbackTitle: 'Solar & Passive Cooling',
    targetPage: 'calculator' as PageId,
    cta: 'Model Power Savings',
  },
  {
    category: 'Zero-Burn Organics',
    title: 'Compost leaves & food scraps instead of open smoke-producing fires',
    imageUrl: '/src/assets/images/compost_zero_waste_1795018869469.jpg',
    imageAlt: 'Tidy backyard garden corner with wooden composter, rich dark soil, and potted herbs',
    fallbackTitle: 'Zero-Burn Composting',
    targetPage: 'sustainability' as PageId,
    cta: 'View Composting Steps',
  },
] as const;

export function LandingPage({ snapshot, onNavigate }: LandingPageProps) {
  const isLive = snapshot.dataStatus === 'LIVE' || snapshot.dataStatus === 'CACHED';

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#102A43]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#102A43] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
          <Logo onClick={() => onNavigate('landing')} />

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex" aria-label="Primary">
            <a href="#live-air" className="shrink-0 whitespace-nowrap underline-offset-4 hover:text-[#102A43] hover:underline">
              Live Air
            </a>
            <a href="#family-shield" className="shrink-0 whitespace-nowrap underline-offset-4 hover:text-[#102A43] hover:underline">
              Family Shield
            </a>
            <a href="#impact" className="shrink-0 whitespace-nowrap underline-offset-4 hover:text-[#102A43] hover:underline">
              Impact
            </a>
            <a href="#community" className="shrink-0 whitespace-nowrap underline-offset-4 hover:text-[#102A43] hover:underline">
              Community
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="shrink-0 whitespace-nowrap rounded-lg bg-[#102A43] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              Open Workspace
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section id="live-air" className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-xs font-semibold tracking-wide text-[#20C997]">
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
                  <Bot className="h-4 w-4 text-[#20C997]" aria-hidden="true" />
                  <span>Meet Your AI Assistant</span>
                </button>
              </div>

              {/* Live AQI Preview Strip */}
              <div className="mt-8 rounded-xl border border-slate-200 bg-[#F4F8FB] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {isLive ? 'Live Regional Reading' : 'Offline Demonstration Snapshot'} ·{' '}
                    <strong className="text-[#102A43]">
                      {snapshot.location.name}, {snapshot.location.country}
                    </strong>
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatLocalTime(snapshot.measuredAt)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                  <AqiStatusBadge category={snapshot.cpcbCategory} aqi={snapshot.cpcbAqi} />
                  <div className="flex items-center gap-5 text-xs">
                    <div>
                      <span className="block text-slate-500">PM2.5</span>
                      <span className="font-mono text-sm font-semibold text-[#102A43] tabular-nums">
                        {snapshot.pollutants.pm25 !== null ? `${snapshot.pollutants.pm25} µg/m³` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">US AQI</span>
                      <span className="font-mono text-sm font-semibold text-[#102A43] tabular-nums">
                        {snapshot.usAqi ?? 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Wind</span>
                      <span className="font-mono text-sm font-semibold text-[#102A43] tabular-nums">
                        {snapshot.weather.windSpeedKmh !== null ? `${snapshot.weather.windSpeedKmh} km/h` : 'N/A'}
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

        {/* Five Questions / Core Capabilities */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#102A43] sm:text-3xl">
              Five practical questions answered with scientific clarity
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Every insight separates measured atmospheric data from estimates and explains what to do, why it matters, when to act, and its limitations.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-6">
            {FIVE_QUESTIONS.map((q) => (
              <div key={q.step} className={`rounded-xl border border-slate-200 bg-white p-6 ${q.colSpanClass}`}>
                <p className={`font-mono text-xs font-semibold ${q.accentClass}`}>{q.step}</p>
                <h3 className="mt-2 font-display text-lg font-bold text-[#102A43]">{q.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{q.description}</p>
                <button
                  type="button"
                  onClick={() => onNavigate(q.targetPage)}
                  className="mt-4 text-xs font-semibold text-[#102A43] underline underline-offset-4 hover:text-[#20C997] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                >
                  {q.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* How AIRWISE AI Works */}
        <section className="border-y border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold text-[#102A43]">How AIRWISE AI works</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              {WORKFLOW_STEPS.map((item) => (
                <div key={item.step}>
                  <p className="font-mono text-xs font-semibold text-slate-400">{item.step}</p>
                  <h3 className="mt-1 font-display text-base font-bold text-[#102A43]">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Family Protection & Indoor Air */}
        <section id="family-shield" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:h-full">
                <SafeImage
                  src="/src/assets/images/family_clean_home_1794843520942.jpg"
                  alt="Modern sunlit apartment living room with HEPA air purifier near window"
                  fallbackTitle="Clean Indoor Living Environment"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#20C997]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Family & Indoor Air Shield</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#102A43]">
                Built for severe winter smog and everyday indoor living
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                When outdoor AQI crosses into Poor, Very Poor, or Severe territory, families spend up to 90% of their time indoors. AIRWISE AI guides safe cross-ventilation timing, bedroom clean-air zones, kitchen range hood venting, and damp dust removal—while transparently explaining filter limitations.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#20C997]" aria-hidden="true" />
                  <span>Room-by-room checklist across 5 home spaces</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#20C997]" aria-hidden="true" />
                  <span>Dynamic ventilation & smog alerts</span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => onNavigate('indoor')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#102A43] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                >
                  <span>Open Indoor Air Optimizer</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability & Community */}
        <section id="impact" className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#38BDF8]">
                <Leaf className="h-4 w-4" aria-hidden="true" />
                <span>Sustainability & Collective Action</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#102A43]">
                Quantify emissions saved with transparent methodology
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Use documented emission factors to calculate daily, monthly, and annual CO2e reductions from shifting car trips to metro/bus, carpooling, cutting standby electricity, and avoiding open waste burning.
              </p>

              <div id="community" className="mt-6 rounded-xl border border-slate-200 bg-[#F4F8FB] p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
                  <Users className="h-4 w-4 text-[#20C997]" aria-hidden="true" />
                  <span>Community Air Quality Hub</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Join weekly neighborhood challenges, estimate collective 100-home impact, and generate privacy-safe awareness cards without exposing personal location data.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('calculator')}
                    className="rounded-lg bg-[#102A43] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                  >
                    Open Carbon Calculator
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('community')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#102A43] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                  >
                    Visit Community Hub
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:h-full">
                <SafeImage
                  src="/src/assets/images/sustainable_commute_1794843521630.jpg"
                  alt="Electric light-rail tram and shaded urban bicycle lane at golden hour"
                  fallbackTitle="Low-Emission Urban Mobility"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {GREENERY_VISUAL_CARDS.map((card) => (
                <article
                  key={card.title}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#F4F8FB]"
                >
                  <div className="aspect-4/3 w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                    <SafeImage
                      src={card.imageUrl}
                      alt={card.imageAlt}
                      fallbackTitle={card.fallbackTitle}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-xs font-semibold text-[#20C997]">{card.category}</p>
                      <h3 className="mt-1 font-display text-base font-bold text-[#102A43] text-balance">
                        {card.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(card.targetPage)}
                      className="mt-4 self-start text-xs font-semibold text-[#102A43] underline underline-offset-4 hover:text-[#20C997] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                    >
                      {card.cta}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Transparency */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#102A43]">
              <Wind className="h-4 w-4 text-[#20C997]" aria-hidden="true" />
              <span>Trust, Scientific Integrity & Privacy</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 text-sm text-slate-600 md:grid-cols-3">
              {TRUST_PILLARS.map((pillar) => (
                <div key={pillar.title}>
                  <h3 className="font-semibold text-[#102A43]">{pillar.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-semibold text-[#102A43]">AIRWISE AI · Urban Air Quality Assistant</p>
            <p className="mt-1">
              Environmental decision support only. Not a substitute for medical diagnosis or emergency civic advisories.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#102A43]">
              Dashboard
            </button>
            <button type="button" onClick={() => onNavigate('assistant')} className="hover:text-[#102A43]">
              AI Assistant
            </button>
            <button type="button" onClick={() => onNavigate('insights')} className="hover:text-[#102A43]">
              Insights
            </button>
            <button type="button" onClick={() => onNavigate('settings')} className="hover:text-[#102A43]">
              Settings & Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
