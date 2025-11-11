"use client";

import { useCallback, useMemo, useRef } from 'react';
import clsx from 'clsx';
import type { PropertyTimelineView, StageTimelineEntry } from '@/lib/types';
import { buildWeekScale, getWeekLabel, formatWeekLabel } from '@/lib/timelineGrid';
import { Badge } from '@/components/ui/badge';

interface TimelineMatrixProps {
  timelines: PropertyTimelineView[];
  onEditProperty: (propertyId: string) => void;
}

const WEEK_PIXEL_WIDTH = 72;

const statusTone: Record<
  StageTimelineEntry['status'],
  { base: string; text: string; border: string }
> = {
  planned: { base: 'bg-[#e4ddd4]', text: 'text-[var(--august-ink)]', border: 'border-transparent' },
  'in-progress': { base: 'bg-[#d7e0d8]', text: 'text-[var(--august-ink)]', border: 'border-transparent' },
  delayed: { base: 'bg-[#f0d1bd]', text: 'text-[#6b2f13]', border: 'border-transparent' },
  overdue: { base: 'bg-[#f3bdb7]', text: 'text-[#7a1f16]', border: 'border-transparent' },
  complete: { base: 'bg-[#d4e7e0]', text: 'text-[#1f4737]', border: 'border-transparent' },
};

export const TimelineMatrix = ({ timelines, onEditProperty }: TimelineMatrixProps) => {
  const weekScale = buildWeekScale(timelines);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayPosition = useMemo(() => {
    const today = startOfDay(new Date());
    return (
      Math.max(0, today.getTime() - weekScale.start.getTime()) /
      (1000 * 60 * 60 * 24 * 7) *
      WEEK_PIXEL_WIDTH
    );
  }, [weekScale.start]);

  const scrollToToday = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const target =
      todayPosition - container.clientWidth / 2 > 0
        ? todayPosition - container.clientWidth / 2
        : 0;
    container.scrollTo({ left: target, behavior: 'smooth' });
  }, [todayPosition]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-[var(--august-ink)]">Collection Properties</p>
          <p className="text-xs text-[var(--august-muted)]">
            Weeks {formatWeekLabel(weekScale.start)} → {formatWeekLabel(weekScale.end)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollToToday}
            className="rounded-full border border-[#c8b9aa] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--august-ink)] transition hover:border-[var(--august-ink)] hover:bg-white"
          >
            Today
          </button>
          <Badge label={`${timelines.length} active`} tone="info" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white" ref={scrollRef}>
        <div className="min-w-[900px]">
          <WeekHeader weekScale={weekScale} />
          {timelines.map((timeline) => (
            <TimelineRow
              key={timeline.property.id}
              timeline={timeline}
              weekScale={weekScale}
              onEdit={() => onEditProperty(timeline.property.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const WeekHeader = ({ weekScale }: { weekScale: ReturnType<typeof buildWeekScale> }) => (
  <div className="border-b border-[#dcd4cb] bg-[var(--august-card)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--august-muted)]">
    <div className="flex" style={{ width: `${weekScale.weeks * WEEK_PIXEL_WIDTH}px` }}>
      {Array.from({ length: weekScale.weeks }).map((_, index) => (
        <div
          key={index}
          className="flex min-w-[72px] flex-1 items-center justify-center border-l border-[#d6cec4]"
        >
          {`W${index + 1}`} · {getWeekLabel(weekScale.start, index)}
        </div>
      ))}
    </div>
  </div>
);

const TimelineRow = ({
  timeline,
  weekScale,
  onEdit,
}: {
  timeline: PropertyTimelineView;
  weekScale: ReturnType<typeof buildWeekScale>;
  onEdit: () => void;
}) => (
  <div className="grid grid-cols-[280px_1fr] border-b border-[#dcd4cb]">
    <div className="bg-white px-6 py-4">
      <PropertyCard timeline={timeline} onEdit={onEdit} />
    </div>
    <div className="relative px-6 py-4">
      <TimelineGrid weekScale={weekScale} />
      <div
        className="relative h-14"
        style={{ width: `${weekScale.weeks * WEEK_PIXEL_WIDTH}px` }}
      >
        {timeline.stages.map((stage) => (
          <StageBlock key={stage.key} stage={stage} weekScale={weekScale} onSelect={onEdit} />
        ))}
      </div>
    </div>
  </div>
);

const PropertyCard = ({
  timeline,
  onEdit,
}: {
  timeline: PropertyTimelineView;
  onEdit: () => void;
}) => (
  <div className="border-b border-[#dcd4cb] px-6 py-4">
    <button
      className="flex w-full items-start justify-between gap-3 rounded-2xl border border-transparent p-2 text-left transition hover:border-[var(--august-accent)]/40 hover:bg-white/60"
      onClick={onEdit}
    >
      <div>
        <p className="text-base font-semibold text-[var(--august-ink)]">{timeline.property.name}</p>
        <p className="text-xs uppercase tracking-wide text-[var(--august-muted)]">
          {timeline.property.collectionName} • {timeline.property.region}
        </p>
        <p className="text-xs text-[var(--august-muted)]">
          Go-Live {timeline.forecastGoLive} ({timeline.totalDelayDays}d shift)
        </p>
      </div>
      <span className="rounded-full border border-[#c8b9aa] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--august-ink)]">
        Edit
      </span>
    </button>
  </div>
);

const TimelineGrid = ({ weekScale }: { weekScale: ReturnType<typeof buildWeekScale> }) => (
  <div
    className="pointer-events-none absolute inset-0 flex"
    style={{ width: `${weekScale.weeks * WEEK_PIXEL_WIDTH}px` }}
  >
    {Array.from({ length: weekScale.weeks }).map((_, index) => (
      <div key={index} className="h-full border-l border-[#d6cec4]" style={{ width: WEEK_PIXEL_WIDTH }} />
    ))}
    <TodayMarker weekScale={weekScale} />
  </div>
);

const TodayMarker = ({ weekScale }: { weekScale: ReturnType<typeof buildWeekScale> }) => {
  const today = startOfDay(new Date());
  if (today < weekScale.start || today > weekScale.end) return null;
  const offsetWeeks = (today.getTime() - weekScale.start.getTime()) / (1000 * 60 * 60 * 24 * 7);
  const left = offsetWeeks * WEEK_PIXEL_WIDTH;
  return (
    <div
      className="absolute inset-y-0 w-px bg-blue-400"
      style={{ left }}
    >
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        Today
      </span>
    </div>
  );
};

const startOfDay = (date: Date) => {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

const StageBlock = ({
  stage,
  weekScale,
  onSelect,
}: {
  stage: StageTimelineEntry;
  weekScale: ReturnType<typeof buildWeekScale>;
  onSelect: () => void;
}) => {
  const start = new Date(stage.forecastStart);
  const end = new Date(stage.forecastEnd);
  const offsetWeeks = (start.getTime() - weekScale.start.getTime()) / (1000 * 60 * 60 * 24 * 7);
  const durationWeeks = Math.max(0.2, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const left = Math.max(0, offsetWeeks * WEEK_PIXEL_WIDTH);
  const width = Math.max(28, durationWeeks * WEEK_PIXEL_WIDTH);
  const tones = statusTone[stage.status];

  return (
    <button
      type="button"
      className={clsx(
        'absolute top-2 flex h-10 items-center justify-between rounded-full border px-4 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',
        tones.base,
        tones.text,
        tones.border,
      )}
      style={{ left, width }}
      onClick={onSelect}
    >
      <span>{stage.label}</span>
      <span className="text-[11px] font-medium">{stage.durationWeeks}w</span>
    </button>
  );
};
