import { RotateCcw } from 'lucide-react';
import type { CarbonCalculatorInput } from '../../lib/impact.ts';
import { parseGridRegion } from '../../lib/location.ts';

interface CarbonControlsPanelProps {
  input: CarbonCalculatorInput;
  onChangeField: <K extends keyof CarbonCalculatorInput>(
    key: K,
    value: CarbonCalculatorInput[K]
  ) => void;
  onResetInput: () => void;
}

interface RangeSliderFieldProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  accentClass: string;
  onChange: (value: number) => void;
}

function clampNumericInput(raw: string, min: number, max: number, round = false): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return min;
  const bounded = Math.max(min, Math.min(max, parsed));
  return round ? Math.round(bounded) : bounded;
}

function RangeSliderField({
  id,
  label,
  value,
  unit,
  min,
  max,
  step,
  accentClass,
  onChange,
}: RangeSliderFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex justify-between font-medium text-[#102A43]">
        <span>{label}</span>
        <span className="font-mono text-slate-600 tabular-nums">
          {value} {unit}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1.5 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${accentClass}`}
      />
    </div>
  );
}

interface NumberInputFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  round?: boolean;
  onChange: (value: number) => void;
}

function NumberInputField({
  id,
  label,
  value,
  min,
  max,
  round = false,
  onChange,
}: NumberInputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clampNumericInput(e.target.value, min, max, round))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-[#102A43] focus:border-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
      />
    </div>
  );
}

export function CarbonControlsPanel({
  input,
  onChangeField,
  onResetInput,
}: CarbonControlsPanelProps) {
  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5"
      aria-label="Habit Inputs"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="font-display text-base font-bold text-[#102A43]">Weekly Habit Inputs</h2>
        <button
          type="button"
          onClick={onResetInput}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      <div className="mt-4 space-y-4 text-sm">
        <RangeSliderField
          id="calc-transit"
          label="Car km replaced by public transit / week"
          value={input.carKmReplacedByTransitPerWeek}
          unit="km"
          min={0}
          max={250}
          step={2}
          accentClass="accent-[#102A43]"
          onChange={(v) => onChangeField('carKmReplacedByTransitPerWeek', v)}
        />

        <RangeSliderField
          id="calc-carpool"
          label="Solo driving shifted to carpool / week"
          value={input.carKmCarpoolPerWeek}
          unit="km"
          min={0}
          max={200}
          step={2}
          accentClass="accent-[#102A43]"
          onChange={(v) => onChangeField('carKmCarpoolPerWeek', v)}
        />

        <RangeSliderField
          id="calc-active"
          label="Car km replaced by walking/cycling / week"
          value={input.carKmReplacedByWalkCyclePerWeek}
          unit="km"
          min={0}
          max={100}
          step={1}
          accentClass="accent-[#0F766E]"
          onChange={(v) => onChangeField('carKmReplacedByWalkCyclePerWeek', v)}
        />

        <RangeSliderField
          id="calc-kwh"
          label="Electricity consumption reduced / week"
          value={input.electricitySavedKwhPerWeek}
          unit="kWh"
          min={0}
          max={100}
          step={1}
          accentClass="accent-[#0369A1]"
          onChange={(v) => onChangeField('electricitySavedKwhPerWeek', v)}
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberInputField
            id="calc-led"
            label="LED bulbs upgraded"
            value={input.ledBulbsReplacedCount}
            min={0}
            max={200}
            onChange={(v) => onChangeField('ledBulbsReplacedCount', v)}
          />

          <NumberInputField
            id="calc-waste"
            label="Waste reduced (kg/wk)"
            value={input.wasteReducedKgPerWeek}
            min={0}
            max={500}
            onChange={(v) => onChangeField('wasteReducedKgPerWeek', v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
          <div>
            <label htmlFor="calc-region" className="block text-xs font-semibold text-slate-600">
              Grid Emission Factor
            </label>
            <select
              id="calc-region"
              value={input.gridRegion}
              onChange={(e) => onChangeField('gridRegion', parseGridRegion(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-[#102A43] focus:border-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            >
              <option value="INDIA">India CEA (0.716 kg/kWh)</option>
              <option value="GLOBAL">IEA Global (0.475 kg/kWh)</option>
            </select>
          </div>

          <NumberInputField
            id="calc-household"
            label="Household Members"
            value={input.householdSize}
            min={1}
            max={20}
            round
            onChange={(v) => onChangeField('householdSize', v)}
          />
        </div>
      </div>
    </section>
  );
}
