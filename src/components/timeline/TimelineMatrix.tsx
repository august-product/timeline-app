"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { PropertyTimelineView, StageTimelineEntry } from '@/lib/types';
import { buildWeekScale, formatWeekLabel } from '@/lib/timelineGrid';
import { Badge } from '@/components/ui/badge';

interface TimelineMatrixProps {
  timelines: PropertyTimelineView[];
  onEditProperty: (propertyId: string) => void;
  onStageChange: (
    propertyId: string,
    stageKey: StageTimelineEntry['key'],
    actualStart: string,
    actualEnd: string,
  ) => void;
}

const WEEK_PIXEL_WIDTH = 72;
const STAGE_ROW_HEIGHT = 52;

type YearSegment = {
  year: number;
  startIndex: number;
  weekCount: number;
};

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

export const TimelineMatrix = ({ timelines, onEditProperty, onStageChange }: TimelineMatrixProps) => {
  const weekScale = buildWeekScale(timelines);
  const scrollRef = useRef<HTMLDivElement>(null);
  const yearSegments = buildYearSegments(weekScale);
  const yearBoundaries = buildYearBoundaries(yearSegments);
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
          <WeekHeader weekScale={weekScale} yearSegments={yearSegments} yearBoundaries={yearBoundaries} />
          {timelines.map((timeline) => (
            <TimelineRow
              key={timeline.property.id}
              timeline={timeline}
              weekScale={weekScale}
              onEdit={() => onEditProperty(timeline.property.id)}
              yearBoundaries={yearBoundaries}
              onStageChange={(stageKey, actualStart, actualEnd) =>
                onStageChange(timeline.property.id, stageKey, actualStart, actualEnd)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const WeekHeader = ({
  weekScale,
  yearSegments,
  yearBoundaries,
}: {
  weekScale: ReturnType<typeof buildWeekScale>;
  yearSegments: YearSegment[];
  yearBoundaries: number[];
}) => {
  const totalWidth = weekScale.weeks * WEEK_PIXEL_WIDTH;
  return (
    <div className="border-b border-[#dcd4cb] bg-[var(--august-card)] px-6 py-3 text-[var(--august-muted)]">
      <div className="relative space-y-2" style={{ width: `${totalWidth}px` }}>
        <div className="flex text-[11px] font-semibold uppercase tracking-[0.3em]">
          {yearSegments.map((segment) => (
            <div
              key={segment.year}
              className="flex items-center justify-center"
              style={{ width: `${segment.weekCount * WEEK_PIXEL_WIDTH}px` }}
            >
              {segment.year}
            </div>
          ))}
        </div>
        <div className="flex text-xs font-semibold text-[var(--august-ink)]">
          {Array.from({ length: weekScale.weeks }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 border-l border-[#d6cec4] py-1"
            >
              <span className="text-sm text-[var(--august-ink)]">{formatWeekLabel(getWeekDate(weekScale.start, index))}</span>
              <span className="text-[11px] font-medium text-[var(--august-muted)]">{`W${index + 1}`}</span>
            </div>
          ))}
        </div>
        {yearBoundaries.map((offset) => (
          <div
            key={offset}
            className="pointer-events-none absolute inset-y-0 w-px bg-[#9a9187]"
            style={{ left: `${offset * WEEK_PIXEL_WIDTH}px` }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
};

const TimelineRow = ({
  timeline,
  weekScale,
  onEdit,
  yearBoundaries,
  onStageChange,
}: {
  timeline: PropertyTimelineView;
  weekScale: ReturnType<typeof buildWeekScale>;
  onEdit: () => void;
  yearBoundaries: number[];
  onStageChange: (stageKey: StageTimelineEntry['key'], actualStart: string, actualEnd: string) => void;
}) => {
  const rowCount = Math.max(1, timeline.stages.length);
  const timelineWidth = `${weekScale.weeks * WEEK_PIXEL_WIDTH}px`;
  return (
    <div className="grid grid-cols-[280px_1fr] border-b border-[#dcd4cb] bg-white">
      <div className="sticky left-0 z-10 bg-white px-6 py-4 shadow-[4px_0_12px_rgba(31,43,36,0.08)]">
        <PropertyCard timeline={timeline} onEdit={onEdit} />
      </div>
      <div className="relative bg-white px-6 py-4">
        <TimelineGrid
          weekScale={weekScale}
          rowCount={rowCount}
          yearBoundaries={yearBoundaries}
          totalWidth={weekScale.weeks * WEEK_PIXEL_WIDTH}
        />
        <div
          className="relative"
          style={{
            width: timelineWidth,
            minWidth: '100%',
            minHeight: `${rowCount * STAGE_ROW_HEIGHT}px`,
          }}
        >
          {timeline.stages.map((stage, index) => (
            <StageBlock
              key={stage.key}
              stage={stage}
              weekScale={weekScale}
              onSelect={onEdit}
              rowIndex={index}
              onDrag={(stageKey, actualStart, actualEnd) =>
                onStageChange(stageKey, actualStart, actualEnd)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const PropertyCard = ({
  timeline,
  onEdit,
}: {
  timeline: PropertyTimelineView;
  onEdit: () => void;
}) => (
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
);

const TimelineGrid = ({
  weekScale,
  rowCount,
  yearBoundaries,
  totalWidth,
}: {
  weekScale: ReturnType<typeof buildWeekScale>;
  rowCount: number;
  yearBoundaries: number[];
  totalWidth: number;
}) => {
  const totalHeight = Math.max(1, rowCount) * STAGE_ROW_HEIGHT;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ width: `${totalWidth}px`, minWidth: '100%', minHeight: `${totalHeight}px` }}
    >
      <div className="flex h-full">
        {Array.from({ length: weekScale.weeks }).map((_, index) => (
          <div key={index} className="h-full border-l border-[#d6cec4]" style={{ width: WEEK_PIXEL_WIDTH }} />
        ))}
      </div>
      {yearBoundaries.map((offset) => (
        <div
          key={offset}
          className="absolute inset-y-0 w-px bg-[#9a9187]"
          style={{ left: `${offset * WEEK_PIXEL_WIDTH}px` }}
        />
      ))}
      <TodayMarker weekScale={weekScale} />
    </div>
  );
};

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

const addDays = (date: Date, days: number) => {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + days);
  return clone;
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const StageBlock = ({
  stage,
  weekScale,
  onSelect,
  rowIndex,
  onDrag,
}: {
  stage: StageTimelineEntry;
  weekScale: ReturnType<typeof buildWeekScale>;
  onSelect: () => void;
  rowIndex: number;
  onDrag: (stageKey: StageTimelineEntry['key'], actualStart: string, actualEnd: string) => void;
}) => {
  const start = new Date(stage.forecastStart);
  const end = new Date(stage.forecastEnd);
  const offsetWeeks = (start.getTime() - weekScale.start.getTime()) / (1000 * 60 * 60 * 24 * 7);
  const durationWeeks = Math.max(0.2, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const baseLeft = offsetWeeks * WEEK_PIXEL_WIDTH;
  const width = Math.max(28, durationWeeks * WEEK_PIXEL_WIDTH);
  const tones = statusTone[stage.status];
  const top = rowIndex * STAGE_ROW_HEIGHT + 6;

  const [dragOffset, setDragOffset] = useState(0);
  const pointerRef = useRef<{ pointerId: number | null; startX: number }>({
    pointerId: null,
    startX: 0,
  });
  const draggedRef = useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    pointerRef.current = { pointerId: event.pointerId, startX: event.clientX };
    draggedRef.current = false;
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerRef.current.pointerId !== event.pointerId) return;
    const delta = event.clientX - pointerRef.current.startX;
    if (Math.abs(delta) > 3) {
      draggedRef.current = true;
    }
    setDragOffset(delta);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerRef.current.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const delta = event.clientX - pointerRef.current.startX;
    pointerRef.current = { pointerId: null, startX: 0 };
    const moved = Math.abs(delta) > 3;
    if (!moved) {
      setDragOffset(0);
      return;
    }
    const deltaDays = Math.round((delta / WEEK_PIXEL_WIDTH) * 7);
    if (deltaDays !== 0) {
      const durationDays = Math.max(1, Math.round(stage.durationWeeks * 7));
      const nextStart = addDays(start, deltaDays);
      const nextEnd = addDays(nextStart, durationDays);
      onDrag(stage.key, toISODate(nextStart), toISODate(nextEnd));
    }
    setDragOffset(0);
  };

  const handleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onSelect();
  };

  return (
    <button
      type="button"
      className={clsx(
        'absolute flex h-10 cursor-grab items-center justify-between rounded-full border px-4 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 active:cursor-grabbing',
        tones.base,
        tones.text,
        tones.border,
      )}
      style={{ left: baseLeft + dragOffset, width, top }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClick={handleClick}
    >
      <span>{stage.label}</span>
      <span className="text-[11px] font-medium">{stage.durationWeeks}w</span>
    </button>
  );
};

const getWeekDate = (start: Date, offset: number) => {
  const anchor = new Date(start);
  anchor.setUTCDate(anchor.getUTCDate() + offset * 7);
  return anchor;
};

const buildYearSegments = (weekScale: ReturnType<typeof buildWeekScale>): YearSegment[] => {
  const segments: YearSegment[] = [];
  for (let index = 0; index < weekScale.weeks; index += 1) {
    const year = getWeekDate(weekScale.start, index).getUTCFullYear();
    const current = segments[segments.length - 1];
    if (current && current.year === year) {
      current.weekCount += 1;
    } else {
      segments.push({ year, startIndex: index, weekCount: 1 });
    }
  }
  return segments;
};

const buildYearBoundaries = (segments: YearSegment[]) =>
  segments.slice(1).map((segment) => segment.startIndex);
