import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Download, Lock, Trash2, Upload } from 'lucide-react';
import type { AlertPreferences, FamilyProfile } from '../../types/airwise.ts';
import type { CarbonCalculatorInput } from '../../lib/impact.ts';
import { downloadTextFile } from '../../lib/download.ts';
import { hasUnsafeObjectKeys, PersistedStateSchema } from '../../lib/validation.ts';

interface PrivacyControlsPanelProps {
  profile: FamilyProfile;
  calcInput?: CarbonCalculatorInput;
  alertPrefs?: AlertPreferences;
  onImportPreferences?: (data: {
    profile?: FamilyProfile;
    calcInput?: CarbonCalculatorInput;
    alertPrefs?: AlertPreferences;
  }) => void;
  onClearAllData: () => void;
}

export function PrivacyControlsPanel({
  profile,
  calcInput,
  alertPrefs,
  onImportPreferences,
  onClearAllData,
}: PrivacyControlsPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  function showStatus(text: string, isError = false) {
    setStatusMessage({ text, isError });
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatusMessage(null), 3500);
  }

  function handleExportPreferences() {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'AIRWISE AI stores only non-sensitive household preferences locally.',
      profile,
      ...(calcInput ? { calcInput } : {}),
      ...(alertPrefs ? { alertPrefs } : {}),
    };
    downloadTextFile(
      JSON.stringify(payload, null, 2),
      'airwise-preferences.json',
      'application/json'
    );
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 32 * 1024) {
      showStatus('Preferences file is too large (max 32 KB).', true);
      return;
    }
    try {
      const raw = await file.text();
      const json: unknown = JSON.parse(raw);
      if (hasUnsafeObjectKeys(json)) {
        showStatus('Rejected file containing unsafe object keys.', true);
        return;
      }
      const parsed = PersistedStateSchema.safeParse(json);
      if (
        !parsed.success ||
        (!parsed.data.profile && !parsed.data.calcInput && !parsed.data.alertPrefs)
      ) {
        showStatus('Invalid AIRWISE preferences JSON format.', true);
        return;
      }
      onImportPreferences?.({
        profile: parsed.data.profile,
        calcInput: parsed.data.calcInput,
        alertPrefs: parsed.data.alertPrefs,
      });
      showStatus('Preferences safely validated and restored.');
    } catch {
      showStatus('Could not parse preferences JSON file.', true);
    }
  }

  function handleConfirmClear() {
    onClearAllData();
    setConfirmClear(false);
    showStatus('Local preferences reset to defaults.');
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Lock className="h-5 w-5 text-[#0369A1]" aria-hidden="true" />
        <h2 className="font-display text-base font-bold text-[#102A43]">
          Privacy, Data Ownership & Security Controls
        </h2>
      </div>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-relaxed text-slate-600">
        <li>
          <strong>No unnecessary personal data:</strong> AIRWISE AI never requires accounts, phone numbers, exact street addresses, or medical records.
        </li>
        <li>
          <strong>Permission-based location:</strong> Browser geolocation is only requested when you explicitly click &ldquo;Use My Location&rdquo;.
        </li>
        <li>
          <strong>Server-side AI & API handling:</strong> All Gemini AI and environmental feed requests execute on the backend server; API keys are never exposed to the browser.
        </li>
        <li>
          <strong>Local-only preferences:</strong> Your household group selections, indoor checklist progress, and calculator inputs stay in your browser&apos;s local storage.
        </li>
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleExportPreferences}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-[#102A43] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Export Local Preferences (JSON)</span>
        </button>

        {onImportPreferences && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={(e) => void handleImportFile(e)}
              className="sr-only"
              aria-label="Import AIRWISE preferences JSON file"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-[#102A43] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Import Preferences (JSON)</span>
            </button>
          </>
        )}

        {!confirmClear ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-900 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span>Clear Local Data</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmClear}
              className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              Confirm Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              Cancel
            </button>
          </div>
        )}

        {statusMessage && (
          <span
            className={`text-xs font-semibold ${
              statusMessage.isError ? 'text-red-700' : 'text-emerald-800'
            }`}
            role={statusMessage.isError ? 'alert' : 'status'}
          >
            {statusMessage.text}
          </span>
        )}
      </div>
    </section>
  );
}
