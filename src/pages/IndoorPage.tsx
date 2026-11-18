import { useState } from 'react';
import { AlertTriangle, CheckSquare, ShieldCheck, Square, Wind } from 'lucide-react';
import type { EnvironmentalSnapshot, IndoorRoomTask } from '../types/airwise.ts';
import { handleTabListKeyDown } from '../lib/a11y.ts';
import { SafeImage } from '../components/SafeImage.tsx';

interface IndoorPageProps {
  snapshot: EnvironmentalSnapshot;
  tasks: IndoorRoomTask[];
  onToggleTask: (id: string) => void;
}

const ROOM_FILTER_TABS: ReadonlyArray<'All' | IndoorRoomTask['room']> = [
  'All',
  'Bedroom',
  'Living room',
  'Kitchen',
  "Children's room",
  'Workspace',
];

export function IndoorPage({ snapshot, tasks, onToggleTask }: IndoorPageProps) {
  const [selectedRoom, setSelectedRoom] = useState<'All' | IndoorRoomTask['room']>('All');

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const outdoorAqi = snapshot.cpcbAqi ?? 120;
  const safeToVentilate = outdoorAqi <= 100;

  const visibleTasks =
    selectedRoom === 'All' ? tasks : tasks.filter((t) => t.room === selectedRoom);

  return (
    <div className="space-y-6">
      {/* Ventilation & Purifier Summary */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E]">
            <Wind className="h-4 w-4" aria-hidden="true" />
            <span>Ventilation Decision Engine · {snapshot.location.name}</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-[#102A43]">
            {safeToVentilate
              ? 'Cross-ventilation is currently suitable'
              : 'Keep exterior windows sealed against outdoor particulates'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {safeToVentilate
              ? `Outdoor CPCB AQI is ${outdoorAqi} (${snapshot.cpcbCategory}). Opening opposite windows for 15–20 minutes helps dilute indoor CO2 and cooking fumes without bringing in heavy smog.`
              : `Outdoor CPCB AQI is ${outdoorAqi} (${snapshot.cpcbCategory}). Leaving windows open draws fine PM2.5 indoors. Rely on mechanical HEPA filtration, range hood exhaust while cooking, and damp microfiber cleaning.`}
          </p>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <p className="font-semibold">Scientific Note on Indoor Plants</p>
                <p className="mt-0.5">
                  Indoor houseplants support wellbeing, but controlled chamber studies show plants alone cannot remove dangerous PM2.5 particulates or winter smog at realistic home air-exchange rates. Use true HEPA filtration and source control instead.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#102A43]">
              Home Protection Progress
            </h2>
            <ShieldCheck className="h-5 w-5 text-[#0F766E]" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono text-4xl font-bold text-[#102A43] tabular-nums">
            {progressPct}%
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {completedCount} of {tasks.length} indoor air actions completed
          </p>
          <progress
            value={progressPct}
            max={100}
            aria-label="Indoor air protection progress"
            className="mt-3 block h-2.5 w-full appearance-none overflow-hidden rounded-full bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[#20C997] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[#20C997]"
          />

          <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500">Target Indoor Humidity</dt>
              <dd className="font-mono font-semibold text-[#102A43]">40% – 55% RH</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Pre-Filter Vacuuming</dt>
              <dd className="font-mono font-semibold text-[#102A43]">Every 14 Days</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Indoor Combustion Rule</dt>
              <dd className="font-semibold text-[#102A43]">Zero Incense / Candles</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* HD Indoor Visual & Room Filter Tabs */}
      <div className="grid grid-cols-1 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-12">
        <div className="h-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:col-span-4">
          <SafeImage
            src="/src/assets/images/family_clean_home_1794843520942.jpg"
            alt="Sunlit indoor living room with HEPA air purifier near window"
            fallbackTitle="Indoor Air Filtration Zone"
          />
        </div>
        <div className="sm:col-span-8">
          <h2 className="font-display text-sm font-bold text-[#102A43]">
            Room-by-Room Clean Air Execution
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Select a room below to review tailored filtration, ventilation, damp cleaning, and humidity guidance along with practical limitations.
          </p>
          <div
            className="mt-3 flex flex-wrap items-center gap-1.5"
            role="tablist"
            aria-label="Filter checklist by room"
          >
            {ROOM_FILTER_TABS.map((room) => {
              const active = selectedRoom === room;
              const slug = room.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <button
                  key={room}
                  id={`indoor-tab-${slug}`}
                  type="button"
                  role="tab"
                  tabIndex={active ? 0 : -1}
                  aria-selected={active}
                  aria-controls="indoor-tasks-panel"
                  onClick={() => setSelectedRoom(room)}
                  onKeyDown={(e) =>
                    handleTabListKeyDown(e, ROOM_FILTER_TABS, selectedRoom, setSelectedRoom)
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                    active ? 'bg-[#102A43] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {room}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Room-by-Room Checklist */}
      <div
        id="indoor-tasks-panel"
        className="space-y-3"
        role="tabpanel"
        aria-labelledby={`indoor-tab-${selectedRoom.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      >
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                aria-label={`Toggle ${task.title}`}
                aria-pressed={task.completed}
                className="mt-0.5 shrink-0 text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] rounded"
              >
                {task.completed ? (
                  <CheckSquare className="h-5 w-5 text-[#0F766E]" aria-hidden="true" />
                ) : (
                  <Square className="h-5 w-5 text-slate-400" aria-hidden="true" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#102A43]">{task.room}</span>
                  <span aria-hidden="true">·</span>
                  <span>{task.completed ? 'Completed' : 'Action Recommended'}</span>
                </div>
                <h3
                  className={`mt-1 font-display text-base font-bold ${
                    task.completed ? 'text-slate-500 line-through' : 'text-[#102A43]'
                  }`}
                >
                  {task.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-700">{task.guidance}</p>

                <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-500">Why It Matters: </span>
                    <span className="text-slate-700">{task.whyItMatters}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Limitation: </span>
                    <span className="text-slate-600">{task.limitation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
