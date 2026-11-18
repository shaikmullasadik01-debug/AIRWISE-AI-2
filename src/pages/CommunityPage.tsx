import { useMemo, useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { COMMUNITY_CHALLENGES, type CommunityChallenge } from '../data/presets.ts';
import type { EnvironmentalSnapshot } from '../types/airwise.ts';
import { handleTabListKeyDown } from '../lib/a11y.ts';
import { SafeImage } from '../components/SafeImage.tsx';
import { AwarenessCardBuilder } from '../components/community/AwarenessCardBuilder.tsx';

interface CommunityPageProps {
  snapshot: EnvironmentalSnapshot;
  joinedChallengeIds: string[];
  onToggleJoinChallenge: (id: string) => void;
}

type ChallengeFilter = 'All' | CommunityChallenge['category'];

const CHALLENGE_FILTERS: readonly ChallengeFilter[] = [
  'All',
  'Transport',
  'Energy',
  'Indoor',
  'Neighborhood',
];

export function CommunityPage({
  snapshot,
  joinedChallengeIds,
  onToggleJoinChallenge,
}: CommunityPageProps) {
  const [challengeFilter, setChallengeFilter] = useState<ChallengeFilter>('All');

  const collectiveWeeklyKg = useMemo(
    () =>
      COMMUNITY_CHALLENGES.reduce((sum, c) => {
        const joinedBonus = joinedChallengeIds.includes(c.id) ? 1 : 0;
        return sum + (c.participantsCount + joinedBonus) * c.estimatedWeeklyCo2SavedKgPerHome;
      }, 0),
    [joinedChallengeIds]
  );

  const personalWeeklyKg = useMemo(
    () =>
      COMMUNITY_CHALLENGES.reduce(
        (sum, c) => sum + (joinedChallengeIds.includes(c.id) ? c.estimatedWeeklyCo2SavedKgPerHome : 0),
        0
      ),
    [joinedChallengeIds]
  );

  const maxWeeklyKg = useMemo(
    () => COMMUNITY_CHALLENGES.reduce((sum, c) => sum + c.estimatedWeeklyCo2SavedKgPerHome, 0),
    []
  );
  const personalProgressPct =
    maxWeeklyKg > 0 ? Math.min(100, Math.round((personalWeeklyKg / maxWeeklyKg) * 100)) : 0;

  const visibleChallenges = useMemo(
    () =>
      challengeFilter === 'All'
        ? COMMUNITY_CHALLENGES
        : COMMUNITY_CHALLENGES.filter((c) => c.category === challengeFilter),
    [challengeFilter]
  );

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee + Collective Impact */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Estimated Collective Weekly Savings</p>
          <p className="mt-1 font-mono text-3xl font-bold text-[#0F766E] tabular-nums">
            {(collectiveWeeklyKg / 1000).toFixed(2)} t CO2e
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Modeled from active challenge participants × weekly habit factors
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">Your Active Weekly Challenges</p>
            <span className="font-mono text-xs font-semibold text-[#0F766E] tabular-nums">
              {personalWeeklyKg.toFixed(1)} kg/wk
            </span>
          </div>
          <p className="mt-1 font-mono text-3xl font-bold text-[#102A43] tabular-nums">
            {joinedChallengeIds.length} / {COMMUNITY_CHALLENGES.length}
          </p>
          <progress
            value={personalProgressPct}
            max={100}
            aria-label="Weekly challenge CO2e contribution"
            className="mt-2.5 block h-2 w-full appearance-none overflow-hidden rounded-full bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[#20C997] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[#20C997]"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#102A43]">
            <Shield className="h-4 w-4 text-[#0F766E]" aria-hidden="true" />
            <span>Community Privacy Safeguard</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            AIRWISE AI never publishes precise coordinates, home addresses, or user names. Challenge participation stays stored locally on your device.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="h-52 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 lg:col-span-5 lg:h-auto">
          <SafeImage
            src="/src/assets/images/community_clean_air_1794844257865.jpg"
            alt="Neighborhood residents planting trees and cycling together in a sunlit park"
            fallbackTitle="Neighborhood Clean Air Action"
          />
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <p className="text-xs font-semibold text-[#0F766E]">Educational Clean Air Campaign</p>
          <h2 className="mt-1 font-display text-lg font-bold text-[#102A43]">
            Neighborhood Clean-Air Drives Without Compromising Privacy
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Coordinated local habits—carpooling school runs, zero open leaf burning, and cutting peak electricity demand—reduce shared neighborhood particulate pollution while protecting sensitive residents.
          </p>
        </div>
      </section>

      {/* Weekly Challenges */}
      <section aria-label="Weekly Community Challenges">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-[#102A43]">
            Weekly Neighborhood & Household Challenges
          </h2>
          <div
            className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1"
            role="tablist"
            aria-label="Filter challenges by category"
          >
            {CHALLENGE_FILTERS.map((cat) => {
              const active = challengeFilter === cat;
              const slug = cat.toLowerCase();
              return (
                <button
                  key={cat}
                  id={`challenge-tab-${slug}`}
                  type="button"
                  role="tab"
                  tabIndex={active ? 0 : -1}
                  aria-selected={active}
                  aria-controls="community-challenges-panel"
                  onClick={() => setChallengeFilter(cat)}
                  onKeyDown={(e) =>
                    handleTabListKeyDown(e, CHALLENGE_FILTERS, challengeFilter, setChallengeFilter)
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
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
          id="community-challenges-panel"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          role="tabpanel"
          aria-labelledby={`challenge-tab-${challengeFilter.toLowerCase()}`}
        >
          {visibleChallenges.map((chal) => {
            const joined = joinedChallengeIds.includes(chal.id);
            return (
              <article
                key={chal.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-[#102A43]">{chal.category}</span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {chal.participantsCount + (joined ? 1 : 0)} homes
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-[#102A43]">
                    {chal.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600">{chal.goalDescription}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
                    {chal.actionChecklist.map((step) => (
                      <li key={`${chal.id}-${step}`}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="font-mono text-xs font-semibold text-[#0F766E] tabular-nums">
                    ~{chal.estimatedWeeklyCo2SavedKgPerHome} kg CO2e/wk per home
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleJoinChallenge(chal.id)}
                    aria-pressed={joined}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                      joined
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-[#102A43] text-white hover:bg-[#1a3f63]'
                    }`}
                  >
                    {joined ? 'Joined Challenge' : 'Join Challenge'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <AwarenessCardBuilder snapshot={snapshot} />
    </div>
  );
}
