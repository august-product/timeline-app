"use client";

import clsx from 'clsx';
import type { StageTimelineEntry } from '@/lib/types';

interface StageBarProps {
  stage: StageTimelineEntry;
  totalDays: number;
  timelineStart: Date;
}

const statusColors: Record<StageTimelineEntry['status'], string> = {
  planned: 'bg-slate-200 text-slate-700',
  'in-progress': 'bg-blue-200 text-blue-800',
  delayed: 'bg-amber-200 text-amber-900',
  overdue: 'bg-rose-200 text-rose-900',
  complete: 'bg-emerald-200 text-emerald-800',
};

export const StageBar = ({ stage, totalDays, timelineStart }: StageBarProps) => {
  const plannedStart = new Date(stage.plannedStart);
  const forecastStart = new Date(stage.forecastStart);
  const forecastEnd = new Date(stage.forecastEnd);
  const plannedOffset = (plannedStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
  const forecastWidth = (forecastEnd.getTime() - forecastStart.getTime()) / (1000 * 60 * 60 * 24);
  const left = Math.max(0, (plannedOffset / totalDays) * 100);
  const width = Math.max(4, (forecastWidth / totalDays) * 100);

  return (
    <div className="relative h-16 w-full">
      <div
        className={clsx(
          'absolute top-1 flex h-6 items-center justify-between rounded-full px-3 text-xs font-medium shadow-sm',
          statusColors[stage.status],
        )}
        style={{ left: `${left}%`, width: `${width}%` }}
      >
        <span>{stage.label}</span>
        <span className="text-[11px]">{stage.durationWeeks}w</span>
      </div>
      <div className="absolute bottom-0 flex w-full justify-between text-[11px] text-slate-500">
        <span>{stage.plannedStart}</span>
        <span>{stage.forecastEnd}</span>
      </div>
    </div>
  );
};
