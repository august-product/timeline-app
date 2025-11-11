"use client";

import { TimelineChart } from '@/components/timeline/TimelineChart';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { PropertyTimelineView, StageTimelineEntry } from '@/lib/types';
import clsx from 'clsx';

interface PropertyDetailProps {
  timeline: PropertyTimelineView;
  onStageAction?: (stage: StageTimelineEntry) => void;
}

const statusTone: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  'On track': 'success',
  'Minor delays': 'warning',
  'High risk': 'danger',
};

export const PropertyDetail = ({ timeline, onStageAction }: PropertyDetailProps) => (
  <Card
    title={`${timeline.property.name} • ${timeline.property.region}`}
    subtitle={`Go-Live forecast ${timeline.forecastGoLive} (${timeline.totalDelayDays}d shift)`}
    className="space-y-6"
    actions={<Badge label={timeline.statusSummary} tone={statusTone[timeline.statusSummary] ?? 'default'} />}
  >
    <div className="grid gap-4 md:grid-cols-3">
      <InfoStat label="Collection" value={timeline.property.collectionName} />
      <InfoStat label="Project Lead" value={timeline.property.pm} />
      <InfoStat label="Rule Set" value={timeline.ruleSet.label} />
    </div>

    <TimelineChart stages={timeline.stages} />

    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-900">
        <span>Stage</span>
        <span>Status</span>
      </div>
      <div className="space-y-2">
        {timeline.stages.map((stage) => (
          <button
            key={stage.key}
            onClick={() => onStageAction?.(stage)}
            className={clsx(
              'flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-sm transition hover:border-blue-200 hover:bg-blue-50/60',
            )}
          >
            <div>
              <p className="font-medium text-slate-900">{stage.label}</p>
              <p className="text-xs text-[var(--august-muted)]">
                Planned {stage.plannedStart} → {stage.plannedEnd}
              </p>
            </div>
            <Badge label={stage.status.replace('-', ' ')} tone={deriveStageTone(stage.status)} />
          </button>
        ))}
      </div>
    </div>
  </Card>
);

const InfoStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-[#d9d0c7] bg-[var(--august-card)] px-4 py-3">
    <p className="text-xs uppercase tracking-wide text-[var(--august-muted)]">{label}</p>
    <p className="text-base font-semibold text-[var(--august-ink)]">{value}</p>
  </div>
);

const deriveStageTone = (
  status: StageTimelineEntry['status'],
): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (status) {
    case 'complete':
      return 'success';
    case 'delayed':
    case 'overdue':
      return 'danger';
    case 'in-progress':
      return 'info';
    default:
      return 'default';
  }
};
