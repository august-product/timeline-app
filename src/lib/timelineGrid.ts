import type { PropertyTimelineView } from './types';

const MS_IN_WEEK = 1000 * 60 * 60 * 24 * 7;

export interface WeekScale {
  start: Date;
  end: Date;
  weeks: number;
}

export const buildWeekScale = (timelines: PropertyTimelineView[]): WeekScale => {
  if (timelines.length === 0) {
    const today = new Date();
    return { start: today, end: today, weeks: 1 };
  }

  const earliest = timelines.reduce((min, timeline) => {
    const stageStart = new Date(timeline.stages[0]?.plannedStart ?? timeline.property.groupClosingDate);
    return stageStart < min ? stageStart : min;
  }, new Date(timelines[0].stages[0]?.plannedStart ?? timelines[0].property.groupClosingDate));

  const latest = timelines.reduce((max, timeline) => {
    const stageEnd = new Date(
      timeline.stages[timeline.stages.length - 1]?.forecastEnd ?? timeline.property.groupClosingDate,
    );
    return stageEnd > max ? stageEnd : max;
  }, new Date(timelines[0].stages[timelines[0].stages.length - 1]?.forecastEnd ?? timelines[0].property.groupClosingDate));

  const totalWeeks = Math.max(1, Math.ceil((latest.getTime() - earliest.getTime()) / MS_IN_WEEK));

  return {
    start: earliest,
    end: latest,
    weeks: totalWeeks,
  };
};

export const getWeekLabel = (start: Date, offset: number) => {
  const weekDate = new Date(start);
  weekDate.setDate(start.getDate() + offset * 7);
  return formatWeekLabel(weekDate);
};

export const formatWeekLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
