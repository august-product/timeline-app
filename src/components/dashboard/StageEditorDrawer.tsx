"use client";

import { useEffect, useMemo, useState } from 'react';
import { stageCatalog } from '@/lib/timeline';
import type { PropertyTimelineView, StageKey } from '@/lib/types';
import clsx from 'clsx';

interface StageEditorDrawerProps {
  timeline: PropertyTimelineView | null;
  open: boolean;
  onClose: () => void;
  onSave: (propertyId: string, updates: StageEditorUpdate[]) => void;
}

export interface StageEditorUpdate {
  stage: StageKey;
  actualStart?: string;
  actualEnd?: string;
  clear: boolean;
}

type StageFormState = Record<
  StageKey,
  {
    actualStart: string;
    actualEnd: string;
  }
>;

export const StageEditorDrawer = ({ timeline, open, onClose, onSave }: StageEditorDrawerProps) => {
  const [formState, setFormState] = useState<StageFormState>(() => deriveInitialState(timeline));
  const stageList = useMemo(() => stageCatalog, []);

  useEffect(() => {
    if (!open || !timeline) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rehydrating inputs whenever the drawer opens.
    setFormState(deriveInitialState(timeline));
  }, [open, timeline]);

  const handleChange = (stageKey: StageKey, field: 'actualStart' | 'actualEnd', value: string) => {
    setFormState((prev) => {
      const nextStage = {
        ...prev[stageKey],
        [field]: value,
      };

      if (field === 'actualStart' && value) {
        const autopEnd = deriveAutoEndDate(timeline, stageKey, value);
        if (autopEnd) {
          nextStage.actualEnd = autopEnd;
        }
      }

      return {
        ...prev,
        [stageKey]: nextStage,
      };
    });
  };

  const handleCopyForecast = (stageKey: StageKey) => {
    if (!timeline) return;
    const stage = timeline.stages.find((entry) => entry.key === stageKey);
    if (!stage) return;
    setFormState((prev) => ({
      ...prev,
      [stageKey]: {
        ...prev[stageKey],
        actualStart: stage.forecastStart,
        actualEnd: stage.forecastEnd,
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!timeline) return;
    const updates: StageEditorUpdate[] = stageList.map((stage) => {
      const payload = formState[stage.key];
      const actualStart = payload.actualStart?.trim();
      const actualEnd = payload.actualEnd?.trim();

      return {
        stage: stage.key,
        actualStart: actualStart || undefined,
        actualEnd: actualEnd || undefined,
        clear: !actualStart && !actualEnd,
      };
    });

    onSave(timeline.property.id, updates);
  };

  if (!open || !timeline) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        className="flex-1 bg-slate-900/40"
        aria-label="Close stage editor"
        onClick={onClose}
      />
      <aside className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-sm font-semibold text-[#8b908d]">Edit schedule</p>
          <h2 className="text-xl font-semibold text-slate-900">{timeline.property.name}</h2>
          <p className="text-sm text-slate-700">
            Adjust actual start/end dates. Downstream stages auto-shift when a date moves.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 px-6 py-4">
            {stageList.map((stage) => (
              <div
                key={stage.key}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm shadow-slate-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                    <p className="text-xs text-slate-600">Owner · {stage.owner}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 underline underline-offset-4"
                      onClick={() => handleCopyForecast(stage.key)}
                      title="Copy forecast dates into the Actual Start/End fields."
                    >
                      Copy forecast
                    </button>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm">
                      Sets actual start & end to the current forecast
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                    Actual start
                    <input
                      type="date"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={formState[stage.key]?.actualStart ?? ''}
                      onChange={(event) => handleChange(stage.key, 'actualStart', event.target.value)}
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                    Actual end
                    <input
                      type="date"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={formState[stage.key]?.actualEnd ?? ''}
                      onChange={(event) => handleChange(stage.key, 'actualEnd', event.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--august-muted)]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={clsx(
                'rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm',
                'bg-blue-600 hover:bg-blue-500',
              )}
            >
              Save & Cascade
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

const buildEmptyState = (): StageFormState =>
  stageCatalog.reduce<StageFormState>((acc, stage) => {
    acc[stage.key] = { actualStart: '', actualEnd: '' };
    return acc;
  }, {} as StageFormState);

const deriveInitialState = (timeline: PropertyTimelineView | null): StageFormState => {
  const base = buildEmptyState();
  if (!timeline) return base;
  for (const stage of timeline.stages) {
    base[stage.key] = {
      actualStart: stage.actualStart ?? '',
      actualEnd: stage.actualEnd ?? '',
    };
  }
  return base;
};

const deriveAutoEndDate = (
  timeline: PropertyTimelineView | null,
  stageKey: StageKey,
  startValue: string,
) => {
  if (!timeline) return undefined;
  const stageDetail = timeline.stages.find((entry) => entry.key === stageKey);
  if (!stageDetail) return undefined;
  const durationDays = Math.max(1, Math.round(stageDetail.durationWeeks * 7));
  const startDate = toStartOfDay(startValue);
  if (!startDate) return undefined;
  return toISODate(addDays(startDate, durationDays));
};

const toStartOfDay = (value: string) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);
