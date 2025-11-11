"use client";

import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { PropertyTimelineView } from '@/lib/types';
import clsx from 'clsx';

interface PropertyTableProps {
  timelines: PropertyTimelineView[];
  selectedId: string;
  onSelect: (timeline: PropertyTimelineView) => void;
}

export const PropertyTable = ({ timelines, selectedId, onSelect }: PropertyTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-widest text-black">
        <tr>
          <th className="px-4 py-3">Property</th>
          <th className="px-4 py-3">Region</th>
          <th className="px-4 py-3">Stage</th>
          <th className="px-4 py-3">Delay</th>
          <th className="px-4 py-3">Go-Live</th>
          <th className="px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {timelines.map((timeline) => {
          const completedStages = timeline.stages.filter((stage) => stage.status === 'complete').length;
          const progress = Math.round((completedStages / timeline.stages.length) * 100);
          const nextStage = timeline.stages.find((stage) => stage.status !== 'complete');
          return (
            <tr
              key={timeline.property.id}
              className={clsx(
                'cursor-pointer transition hover:bg-blue-50/60',
                timeline.property.id === selectedId && 'bg-blue-50/80',
              )}
              onClick={() => onSelect(timeline)}
            >
              <td className="px-4 py-4">
                <div className="font-semibold text-slate-900">{timeline.property.name}</div>
                <p className="text-xs text-slate-500">{timeline.property.collectionName}</p>
              </td>
              <td className="px-4 py-4">
                <p className="text-slate-700">{timeline.property.region}</p>
                <p className="text-xs text-slate-500">{timeline.property.productType}</p>
              </td>
              <td className="px-4 py-4">
                <p className="text-slate-700">{nextStage?.label ?? 'Completed'}</p>
                <p className="text-xs text-slate-500">
                  Owner: {nextStage?.owner ?? 'Marketing'}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-900">{timeline.totalDelayDays} d</p>
                <ProgressBar
                  percent={Math.min(progress, 100)}
                  tone={
                    timeline.totalDelayDays > 28
                      ? 'danger'
                      : timeline.totalDelayDays > 7
                        ? 'warning'
                        : 'success'
                  }
                />
              </td>
              <td className="px-4 py-4">
                <p className="text-slate-900 font-semibold">{timeline.forecastGoLive}</p>
                <p className="text-xs text-slate-500">Planned {timeline.plannedGoLive}</p>
              </td>
              <td className="px-4 py-4">
                <Badge label={timeline.statusSummary} tone={derivePortfolioTone(timeline)} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const derivePortfolioTone = (timeline: PropertyTimelineView) => {
  if (timeline.statusSummary === 'On track') return 'success' as const;
  if (timeline.statusSummary === 'Minor delays') return 'warning' as const;
  return 'danger' as const;
};
