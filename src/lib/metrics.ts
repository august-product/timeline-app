import type { PropertyTimelineView } from './types';

export const derivePortfolioMetrics = (timelines: PropertyTimelineView[]) => {
  if (timelines.length === 0) {
    return {
      totalProperties: 0,
      avgDelayDays: 0,
      atRisk: 0,
      upcomingStarts: 0,
    };
  }

  const totalDelayDays = timelines.reduce((acc, timeline) => acc + timeline.totalDelayDays, 0);
  const atRisk = timelines.filter((timeline) => timeline.statusSummary !== 'On track').length;
  const upcomingStarts = timelines.filter((timeline) => {
    const nextStage = timeline.stages.find((stage) => stage.status === 'planned');
    if (!nextStage) return false;
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return new Date(nextStage.forecastStart) <= inSevenDays;
  }).length;

  return {
    totalProperties: timelines.length,
    avgDelayDays: Math.round(totalDelayDays / timelines.length),
    atRisk,
    upcomingStarts,
  };
};
