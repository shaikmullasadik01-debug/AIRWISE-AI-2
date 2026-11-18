import type { PageId } from '../../types/airwise.ts';

interface LandingCapabilitiesSectionProps {
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
    accentClass: 'text-[#0F766E]',
    colSpanClass: 'md:col-span-3',
    title: 'How safe is the air around me?',
    description:
      'Compare official Indian CPCB NAQI categories, US EPA AQI, and WHO 2021 guideline multiples with live PM2.5, PM10, NO2, SO2, CO, and O3 readings.',
    cta: 'Inspect Live Dashboard',
    targetPage: 'dashboard',
  },
  {
    step: '02. Family Action',
    accentClass: 'text-[#0369A1]',
    colSpanClass: 'md:col-span-3',
    title: 'What should my family do today?',
    description:
      'Receive morning-to-night schedules and Gemini-powered natural language guidance adapted to children, older adults, commuters, and respiratory sensitivities.',
    cta: 'Open Daily Routine Planner',
    targetPage: 'routine',
  },
  {
    step: '03. Home Protection',
    accentClass: 'text-[#0F766E]',
    colSpanClass: 'md:col-span-2',
    title: 'How can I protect indoor air quality?',
    description:
      'Room-by-room checklists for ventilation timing, HEPA filtration, kitchen exhaust, damp cleaning, and humidity control.',
    cta: 'Open Indoor Optimizer',
    targetPage: 'indoor',
  },
  {
    step: '04. Daily Habits',
    accentClass: 'text-[#B45309]',
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

export function LandingCapabilitiesSection({ onNavigate }: LandingCapabilitiesSectionProps) {
  return (
    <>
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
                className="mt-4 text-xs font-semibold text-[#102A43] underline underline-offset-4 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              >
                {q.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-[#102A43]">How AIRWISE AI works</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {WORKFLOW_STEPS.map((item) => (
              <div key={item.step}>
                <p className="font-mono text-xs font-semibold text-slate-500">{item.step}</p>
                <h3 className="mt-1 font-display text-base font-bold text-[#102A43]">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
