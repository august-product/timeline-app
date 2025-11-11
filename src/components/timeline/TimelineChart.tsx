"use client";

import { StageBar } from './StageBar';
import type { StageTimelineEntry } from '@/lib/types';

interface TimelineChartProps {
  stages: StageTimelineEntry[];
}

export const TimelineChart = ({ stages }: TimelineChartProps) => {
  if (stages.length === 0) return null;
  const timelineStart = new Date(stages[0].plannedStart);
  const timelineEnd = new Date(stages[stages.length - 1].forecastEnd);
  const totalDays = Math.max(
    1,
    (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="space-y-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-inner">
      {stages.map((stage) => (
        <StageBar
          key={stage.key}
          stage={stage}
          totalDays={totalDays}
          timelineStart={timelineStart}
        />
      ))}
    </div>
  );
};
