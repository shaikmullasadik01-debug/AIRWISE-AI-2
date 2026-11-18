import { Bot, ShieldAlert, User } from 'lucide-react';
import type { AssistantStructuredReply } from '../../types/airwise.ts';

export interface AssistantExchange {
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

interface AssistantExchangeCardProps {
  exchange: AssistantExchange;
}

export function AssistantExchangeCard({ exchange }: AssistantExchangeCardProps) {
  const { id, question, reply } = exchange;
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-2xl rounded-xl bg-[#102A43] px-4 py-3 text-sm text-white">
          {question}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[#102A43]">
          <User className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#0F766E]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-[#102A43]">
              AIRWISE Family Guidance
            </h3>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Engine: {reply.source === 'gemini-4-hydrogen' ? 'Gemini AI + Live Context' : 'Verified Rule Engine'}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#102A43]">{reply.summary}</p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-[#F4F8FB] p-4">
            <h4 className="text-xs font-bold text-[#102A43]">Measured Facts</h4>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
              {keyStrings(reply.measuredFacts, `${id}-fact`).map((item) => (
                <li key={item.key}>{item.text}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-[#F4F8FB] p-4">
            <h4 className="text-xs font-bold text-[#102A43]">Contextual Estimates</h4>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
              {keyStrings(reply.contextualEstimates, `${id}-est`).map((item) => (
                <li key={item.key}>{item.text}</li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-500">What Action to Take</dt>
            <dd className="mt-0.5 text-sm text-[#102A43]">{reply.recommendation.what}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Why It Matters</dt>
            <dd className="mt-0.5 text-sm text-slate-700">{reply.recommendation.why}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">When to Act</dt>
            <dd className="mt-0.5 text-sm text-slate-700">{reply.recommendation.when}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Expected Benefits</dt>
            <dd className="mt-0.5 text-sm text-slate-700">{reply.recommendation.expectedBenefits}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Estimated Environmental Impact</dt>
            <dd className="mt-0.5 text-sm text-slate-700">{reply.recommendation.estimatedImpact}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Confidence & Limitations</dt>
            <dd className="mt-0.5 text-sm text-slate-600">
              {reply.recommendation.confidenceAndLimitations}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-[#102A43]">Practical Next Steps</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-700">
            {keyStrings(reply.actionSteps, `${id}-step`).map((item) => (
              <li key={item.key}>{item.text}</li>
            ))}
          </ol>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span>{reply.disclaimer}</span>
        </p>
      </article>
    </div>
  );
}
