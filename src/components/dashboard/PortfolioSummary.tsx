"use client";

import { Card } from '@/components/ui/card';
import { derivePortfolioMetrics } from '@/lib/metrics';
import type { PropertyTimelineView } from '@/lib/types';

interface PortfolioSummaryProps {
  timelines: PropertyTimelineView[];
}

export const PortfolioSummary = ({ timelines }: PortfolioSummaryProps) => {
  const metrics = derivePortfolioMetrics(timelines);
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <SummaryCard label="Tracked Properties" value={metrics.totalProperties} />
      <SummaryCard label="Avg Delay" value={`${metrics.avgDelayDays} d`} tone="warning" />
      <SummaryCard label="At Risk" value={metrics.atRisk} tone={metrics.atRisk > 0 ? 'danger' : 'success'} />
      <SummaryCard label="Starting within 7d" value={metrics.upcomingStarts} tone="info" />
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) => (
  <Card>
    <p className="text-xs uppercase tracking-wider text-slate-900">{label}</p>
    <p
      className="mt-2 text-2xl font-semibold"
      data-tone={tone}
    >
      {value}
    </p>
  </Card>
);
