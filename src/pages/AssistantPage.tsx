import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Send, ShieldAlert, User } from 'lucide-react';
import type {
  AssistantStructuredReply,
  EnvironmentalSnapshot,
  FamilyProfile,
} from '../types/airwise.ts';
import { AqiStatusBadge } from '../components/AqiBadge.tsx';
import { formatHouseholdGroups } from '../lib/recommendations.ts';

interface AssistantPageProps {
  snapshot: EnvironmentalSnapshot;
  profile: FamilyProfile;
}

interface ChatExchange {
  id: string;
  question: string;
  reply: AssistantStructuredReply;
}

function keyStrings(items: string[], prefix: string): Array<{ key: string; text: string }> {
  const counts = new Map<string, number>();
  return items.map((text) => {
    const count = (counts.get(text) ?? 0) + 1;
    counts.set(text, count);
    return { key: `${prefix}-${text}-${count}`, text };
  });
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
  const [exchanges, setExchanges] = useState<ChatExchange[]>([]);
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
      {/* Live Context Strip */}
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

      {/* Quick Action Questions */}
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
              className="rounded-lg border border-slate-200 bg-[#F4F8FB] px-3 py-2 text-left text-xs font-medium text-[#102A43] transition-colors hover:border-[#38BDF8] hover:bg-sky-50 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* Conversation History */}
      <section className="space-y-5" aria-label="Assistant Responses" aria-live="polite">
        {exchanges.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Bot className="mx-auto h-9 w-9 text-[#20C997]" aria-hidden="true" />
            <h3 className="mt-3 font-display text-base font-bold text-[#102A43]">
              Ask about outdoor safety, indoor air, or daily habits
            </h3>
            <p className="mx-auto mt-1.5 max-w-lg text-sm text-slate-600">
              Select any quick question above or type your own below. Every answer separates measured facts from estimates and explains what to do, why, when, and limitations.
            </p>
          </div>
        ) : (
          exchanges.map((ex) => (
            <div key={ex.id} className="space-y-3">
              {/* User Question */}
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-2xl rounded-xl bg-[#102A43] px-4 py-3 text-sm text-white">
                  {ex.question}
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[#102A43]">
                  <User className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>

              {/* Assistant Structured Reply */}
              <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-[#20C997]" aria-hidden="true" />
                    <h3 className="font-display text-base font-bold text-[#102A43]">
                      AIRWISE Family Guidance
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    Engine: {ex.reply.source === 'gemini-4-hydrogen' ? 'Gemini AI + Live Context' : 'Verified Rule Engine'}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#102A43]">{ex.reply.summary}</p>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-[#F4F8FB] p-4">
                    <h4 className="text-xs font-bold text-[#102A43]">Measured Facts</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
                      {keyStrings(ex.reply.measuredFacts, `${ex.id}-fact`).map((item) => (
                        <li key={item.key}>{item.text}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-[#F4F8FB] p-4">
                    <h4 className="text-xs font-bold text-[#102A43]">Contextual Estimates</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
                      {keyStrings(ex.reply.contextualEstimates, `${ex.id}-est`).map((item) => (
                        <li key={item.key}>{item.text}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-500">What Action to Take</dt>
                    <dd className="mt-0.5 text-sm text-[#102A43]">{ex.reply.recommendation.what}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Why It Matters</dt>
                    <dd className="mt-0.5 text-sm text-slate-700">{ex.reply.recommendation.why}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">When to Act</dt>
                    <dd className="mt-0.5 text-sm text-slate-700">{ex.reply.recommendation.when}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Expected Benefits</dt>
                    <dd className="mt-0.5 text-sm text-slate-700">{ex.reply.recommendation.expectedBenefits}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Estimated Environmental Impact</dt>
                    <dd className="mt-0.5 text-sm text-slate-700">{ex.reply.recommendation.estimatedImpact}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Confidence & Limitations</dt>
                    <dd className="mt-0.5 text-sm text-slate-600">{ex.reply.recommendation.confidenceAndLimitations}</dd>
                  </div>
                </dl>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-[#102A43]">Practical Next Steps</h4>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-700">
                    {keyStrings(ex.reply.actionSteps, `${ex.id}-step`).map((item) => (
                      <li key={item.key}>{item.text}</li>
                    ))}
                  </ol>
                </div>

                <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <span>{ex.reply.disclaimer}</span>
                </p>
              </article>
            </div>
          ))
        )}
      </section>

      {/* Ask Form */}
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
            className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#102A43] placeholder:text-slate-400 focus:border-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#102A43] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a3f63] disabled:opacity-50 whitespace-nowrap shrink-0"
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
