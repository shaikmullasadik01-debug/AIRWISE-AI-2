import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import type { EnvironmentalSnapshot } from '../../types/airwise.ts';
import { handleTabListKeyDown } from '../../lib/a11y.ts';
import { downloadTextFile } from '../../lib/download.ts';

type CardTheme = 'smog' | 'transit' | 'noburn';

interface AwarenessCardBuilderProps {
  snapshot: EnvironmentalSnapshot;
}

const CARD_THEMES: ReadonlyArray<{ id: CardTheme; label: string }> = [
  { id: 'smog', label: 'Winter Smog' },
  { id: 'transit', label: 'Clean Commute' },
  { id: 'noburn', label: 'Zero Burning' },
];
const CARD_THEME_IDS: readonly CardTheme[] = CARD_THEMES.map((t) => t.id);

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function AwarenessCardBuilder({ snapshot }: AwarenessCardBuilderProps) {
  const [cardTheme, setCardTheme] = useState<CardTheme>('smog');
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const awarenessTemplates: Record<CardTheme, { headline: string; body: string }> = {
    smog: {
      headline: 'Protect Family Lungs During High-AQI Hours',
      body: `Current regional AQI in ${snapshot.location.name} is ${snapshot.cpcbAqi ?? 'elevated'} (${snapshot.cpcbCategory}). Shift vigorous workouts indoors, vent kitchen cooking fumes, and avoid burning dry leaves or incense.`,
    },
    transit: {
      headline: 'One Car-Light Week Saves Real Neighborhood Emissions',
      body: 'Shifting 36 km of solo driving to metro or bus avoids ~4.5 kg CO2e every week—and reduces roadside NO2 outside schools and residential streets.',
    },
    noburn: {
      headline: 'Zero Open Burning = Cleaner Mornings for Everyone',
      body: 'Composting garden leaves instead of burning eliminates dense local PM2.5 smoke while preventing ~0.70 kg CO2e per kg of diverted organic waste.',
    },
  };

  const activeCard = awarenessTemplates[cardTheme];

  async function handleCopyCardText() {
    const text = `${activeCard.headline}\n\n${activeCard.body}\n\nShared via AIRWISE AI (Privacy-Safe Community Card — no personal address shared).`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleDownloadSvgCard() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
      <rect width="800" height="420" rx="24" fill="#102A43"/>
      <rect x="36" y="36" width="728" height="348" rx="16" fill="#173859" stroke="#38BDF8" stroke-opacity="0.35"/>
      <text x="64" y="88" fill="#20C997" font-family="sans-serif" font-size="16" font-weight="700">AIRWISE AI · COMMUNITY AWARENESS CARD</text>
      <text x="64" y="146" fill="#FFFFFF" font-family="sans-serif" font-size="28" font-weight="700">${escapeXml(activeCard.headline)}</text>
      <foreignObject x="64" y="176" width="672" height="140">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color:#E2E8F0;font-family:sans-serif;font-size:18px;line-height:1.5;">${escapeXml(activeCard.body)}</div>
      </foreignObject>
      <text x="64" y="346" fill="#CBD5E1" font-family="sans-serif" font-size="14">City-level summary only · No personal location or identity shared</text>
    </svg>`;
    downloadTextFile(svg, `airwise-awareness-${cardTheme}.svg`, 'image/svg+xml');
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#102A43]">
            Shareable Environmental Awareness Card
          </h2>
          <p className="text-xs text-slate-500">
            Generate a clean city-level summary card for housing society or school groups (zero personal data).
          </p>
        </div>
        <div
          className="flex gap-1.5 rounded-lg bg-slate-100 p-1"
          role="tablist"
          tabIndex={-1}
          aria-label="Awareness card theme"
          onKeyDown={(e) => handleTabListKeyDown(e, CARD_THEME_IDS, cardTheme, setCardTheme)}
        >
          {CARD_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={cardTheme === t.id}
              onClick={() => setCardTheme(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                cardTheme === t.id ? 'bg-white text-[#102A43] shadow-xs' : 'text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-xl bg-[#102A43] p-6 text-white"
        role="tabpanel"
        aria-label={activeCard.headline}
      >
        <p className="text-xs font-semibold text-[#20C997]">AIRWISE AI · COMMUNITY ACTION</p>
        <h3 className="mt-2 font-display text-xl font-bold">{activeCard.headline}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">{activeCard.body}</p>
        <p className="mt-4 text-[11px] text-slate-300">
          Privacy-safe city summary ({snapshot.location.name}) · No street address or user identity included
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleCopyCardText()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-[#102A43] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#0F766E]" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{copied ? 'Copied Text' : 'Copy Message'}</span>
        </button>
        <button
          type="button"
          onClick={handleDownloadSvgCard}
          className="inline-flex items-center gap-2 rounded-lg bg-[#102A43] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Download Shareable SVG Card</span>
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? 'Awareness card text copied to clipboard.' : ''}
        </span>
      </div>
    </section>
  );
}
