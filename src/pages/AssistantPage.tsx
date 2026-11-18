import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Send } from 'lucide-react';
import type {
  AssistantStructuredReply,
  EnvironmentalSnapshot,
  FamilyProfile,
} from '../types/airwise.ts';
import { AqiStatusBadge } from '../components/AqiBadge.tsx';
import { formatHouseholdGroups } from '../lib/recommendations.ts';
import {
  AssistantExchangeCard,
  type AssistantExchange,
} from '../components/assistant/AssistantExchangeCard.tsx';

interface AssistantPageProps {
  snapshot: EnvironmentalSnapshot;
  profile: FamilyProfile;
}

const QUICK_QUESTIONS = [
  'Is it safe for my children to play outside today?',
  'What should my family do during severe smog?',
  'Is morning walking advisable today?',
  'How can I improve my bedroom air quality?',
  'What precautions should elderly family members take?',
  'Should I keep my windows open?',
  'How can I reduce exposure while commuting?',
  'What can I do to reduce my carbon footprint?',
];

export function AssistantPage({ snapshot, profile }: AssistantPageProps) {
  const [question, setQuestion] = useState('');
  const [exchanges, setExchanges] = useState<AssistantExchange[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  async function askQuestion(text: string) {
    const clean = text.trim();
    if (clean.length < 3) {
      setErrorMsg('Please enter a question of at least 3 characters.');
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: clean,
          locationName: `${snapshot.location.name}, ${snapshot.location.country}`,
          countryCode: snapshot.location.countryCode,
          cpcbAqi: snapshot.cpcbAqi,
          cpcbCategory: snapshot.cpcbCategory,
          usAqi: snapshot.usAqi,
          pm25: snapshot.pollutants.pm25,
          pm10: snapshot.pollutants.pm10,
          no2: snapshot.pollutants.no2,
          o3: snapshot.pollutants.o3,
          temperatureC: snapshot.weather.temperatureC,
          humidityPercent: snapshot.weather.humidityPercent,
          windSpeedKmh: snapshot.weather.windSpeedKmh,
          dataStatus: snapshot.dataStatus,
          householdGroups: profile.groups,
        }),
      });

      const data = (await res.json()) as { reply?: AssistantStructuredReply; error?: string };
      if (controller.signal.aborted) return;

      const reply = data.reply;
      if (!res.ok || !reply) {
        setErrorMsg(data.error ?? 'Could not generate advice right now. Please try again.');
        return;
      }

      setExchanges((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          question: clean,
          reply,
        },
      ]);
      setQuestion('');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setErrorMsg('Network error reaching the AI assistant endpoint.');
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false);
      }
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void askQuestion(question);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            Active Assistant Context · {snapshot.location.name} ({snapshot.dataStatus})
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Household profile:{' '}
            <span className="font-medium text-[#102A43]">
              {formatHouseholdGroups(profile.groups)}
            </span>
          </p>
        </div>
        <AqiStatusBadge category={snapshot.cpcbCategory} aqi={snapshot.cpcbAqi} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Quick Questions">
        <h2 className="font-display text-sm font-bold text-[#102A43]">
          Common Family Air Quality Questions
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={submitting}
              onClick={() => void askQuestion(q)}
              className="rounded-lg border border-slate-200 bg-[#F4F8FB] px-3 py-2 text-left text-xs font-medium text-[#102A43] transition-colors hover:border-[#38BDF8] hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5" aria-label="Assistant Responses" aria-live="polite">
        {exchanges.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Bot className="mx-auto h-9 w-9 text-[#0F766E]" aria-hidden="true" />
            <h3 className="mt-3 font-display text-base font-bold text-[#102A43]">
              Ask about outdoor safety, indoor air, or daily habits
            </h3>
            <p className="mx-auto mt-1.5 max-w-lg text-sm text-slate-600">
              Select any quick question above or type your own below. Every answer separates measured facts from estimates and explains what to do, why, when, and limitations.
            </p>
          </div>
        ) : (
          exchanges.map((ex) => <AssistantExchangeCard key={ex.id} exchange={ex} />)
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-4"
        aria-label="Ask AI Family Assistant"
      >
        <label htmlFor="assistant-question-input" className="sr-only">
          Ask an air quality or family protection question
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="assistant-question-input"
            type="text"
            maxLength={600}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask about air quality in ${snapshot.location.name}, indoor rooms, or commuting...`}
            className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#102A43] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#102A43] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>{submitting ? 'Analyzing...' : 'Ask Assistant'}</span>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Questions are sanitized server-side and grounded in measured telemetry.</span>
          <span className="font-mono tabular-nums">{question.length}/600</span>
        </div>
        {errorMsg && (
          <p className="mt-2 text-xs font-medium text-red-700" role="alert">
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}
