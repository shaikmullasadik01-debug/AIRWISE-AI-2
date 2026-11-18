import { Users } from 'lucide-react';
import type { AlertPreferences, FamilyProfile, HouseholdGroup } from '../types/airwise.ts';
import type { CarbonCalculatorInput } from '../lib/impact.ts';
import { parseGridRegion } from '../lib/location.ts';
import { toggleListItem } from '../hooks/useAirwiseState.ts';
import { PrivacyControlsPanel } from '../components/settings/PrivacyControlsPanel.tsx';

interface SettingsPageProps {
  profile: FamilyProfile;
  calcInput?: CarbonCalculatorInput;
  alertPrefs?: AlertPreferences;
  onUpdateProfile: (next: FamilyProfile) => void;
  onImportPreferences?: (data: {
    profile?: FamilyProfile;
    calcInput?: CarbonCalculatorInput;
    alertPrefs?: AlertPreferences;
  }) => void;
  onClearAllData: () => void;
}

const GROUP_OPTIONS: Array<{ id: HouseholdGroup; label: string; hint: string }> = [
  { id: 'adults', label: 'Adults', hint: 'General everyday exposure & transit guidance' },
  { id: 'children', label: 'Children', hint: 'Stricter outdoor play & classroom air thresholds' },
  {
    id: 'olderAdults',
    label: 'Older adults',
    hint: 'Prioritizes calm indoor rest during smog episodes',
  },
  {
    id: 'respiratorySensitivities',
    label: 'People with respiratory sensitivities',
    hint: 'Early precaution triggers at Moderate AQI levels',
  },
  { id: 'outdoorWorkers', label: 'Outdoor workers', hint: 'Respirator & break scheduling guidance' },
  {
    id: 'fitnessEnthusiasts',
    label: 'Fitness enthusiasts',
    hint: 'Cardio intensity & indoor workout shifts',
  },
  {
    id: 'workFromHome',
    label: 'Work-from-home individuals',
    hint: 'Workspace airflow & midday window tips',
  },
  {
    id: 'dailyCommuters',
    label: 'Daily commuters',
    hint: 'Low-traffic routing & closed-cabin transit advice',
  },
];

export function SettingsPage({
  profile,
  calcInput,
  alertPrefs,
  onUpdateProfile,
  onImportPreferences,
  onClearAllData,
}: SettingsPageProps) {
  function toggleGroup(group: HouseholdGroup) {
    onUpdateProfile({ ...profile, groups: toggleListItem(profile.groups, group) });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="h-5 w-5 text-[#0F766E]" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-bold text-[#102A43]">
              Voluntary Household Protection Profile
            </h2>
            <p className="text-xs text-slate-500">
              Select applicable groups to personalize your Daily Routine and AI Assistant guidance. No names, ages, or medical records are collected.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {GROUP_OPTIONS.map((opt) => {
            const active = profile.groups.includes(opt.id);
            const inputId = `household-group-${opt.id}`;
            const hintId = `${inputId}-hint`;
            return (
              <div
                key={opt.id}
                className={`flex items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                  active ? 'border-[#102A43] bg-[#F4F8FB]' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleGroup(opt.id)}
                  aria-describedby={hintId}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#102A43]"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={inputId}
                    className="block cursor-pointer text-sm font-semibold text-[#102A43]"
                  >
                    {opt.label}
                  </label>
                  <p id={hintId} className="text-xs text-slate-500">
                    {opt.hint}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <label htmlFor="pref-size" className="block text-xs font-semibold text-slate-600">
              Household Size
            </label>
            <input
              id="pref-size"
              type="number"
              min={1}
              max={20}
              value={profile.householdSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateProfile({
                  ...profile,
                  householdSize: Number.isFinite(val)
                    ? Math.max(1, Math.min(20, Math.round(val)))
                    : 1,
                });
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-[#102A43] focus:border-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
          </div>

          <div>
            <label htmlFor="pref-grid" className="block text-xs font-semibold text-slate-600">
              Electricity Grid Region
            </label>
            <select
              id="pref-grid"
              value={profile.gridRegion}
              onChange={(e) =>
                onUpdateProfile({
                  ...profile,
                  gridRegion: parseGridRegion(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#102A43] focus:border-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            >
              <option value="INDIA">India (CEA 0.716 kg CO2e/kWh)</option>
              <option value="GLOBAL">Global Average (0.475 kg CO2e/kWh)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label
              htmlFor="pref-hepa-purifier"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2"
            >
              <input
                id="pref-hepa-purifier"
                type="checkbox"
                checked={profile.hasPurifier}
                onChange={(e) => onUpdateProfile({ ...profile, hasPurifier: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 accent-[#102A43]"
              />
              <span className="text-xs font-semibold text-[#102A43]">Home uses HEPA purifier</span>
            </label>
          </div>
        </div>
      </section>

      <PrivacyControlsPanel
        profile={profile}
        calcInput={calcInput}
        alertPrefs={alertPrefs}
        onImportPreferences={onImportPreferences}
        onClearAllData={onClearAllData}
      />
    </div>
  );
}
