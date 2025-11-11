import type {
  PropertyRecord,
  PropertyTimelineView,
  RuleSet,
  StageActual,
  StageDefinition,
  StageKey,
  StageStatus,
  StageTimelineEntry,
} from './types';

const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const stageCatalog: StageDefinition[] = [
  {
    key: 'sales_to_close_group',
    label: 'Group Closing',
    owner: 'Finance',
    field: 'weeks_for_sales_to_close_group',
    color: 'bg-slate-500',
    description: 'Finalize group acquisition close and funding readiness.',
  },
  {
    key: 'legal_onboarding',
    label: 'Legal Onboarding',
    owner: 'Legal',
    field: 'weeks_for_legal_onboarding',
    color: 'bg-purple-500',
    description: 'Complete contract reviews, compliance, and legal briefs.',
  },
  {
    key: 'find_properties',
    label: 'Acquisition',
    owner: 'Operations',
    field: 'weeks_to_find_properties',
    color: 'bg-amber-500',
    description: 'Source and diligence target properties for the collection.',
  },
  {
    key: 'renovation',
    label: 'Renovation',
    owner: 'Operations',
    field: 'reno_weeks',
    color: 'bg-blue-500',
    description: 'Execute construction and renovation scope.',
  },
  {
    key: 'design_install',
    label: 'Design & Install',
    owner: 'Home Experience',
    field: 'design_install_weeks',
    color: 'bg-rose-500',
    description: 'Furnish and design the property experience.',
  },
  {
    key: 'onboarding_home',
    label: 'Onboarding',
    owner: 'PM',
    field: 'onboarding_home_weeks',
    color: 'bg-emerald-500',
    description: 'Train local teams, load listings, sync marketing.',
  },
  {
    key: 'go_live',
    label: 'Go Live',
    owner: 'Marketing',
    field: 'go_live_date',
    color: 'bg-indigo-500',
    description: 'Launch to market with campaigns and distribution.',
  },
];

export const getStageDefinition = (stage: StageKey): StageDefinition => {
  const definition = stageCatalog.find((entry) => entry.key === stage);
  if (!definition) {
    throw new Error(`Unknown stage ${stage}`);
  }
  return definition;
};

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * MS_IN_DAY);

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const resolveStatus = ({
  actualStart,
  actualEnd,
  plannedEnd,
  forecastStart,
}: {
  actualStart?: Date;
  actualEnd?: Date;
  plannedEnd: Date;
  forecastStart: Date;
}): StageStatus => {
  const now = new Date();
  if (actualEnd) {
    return actualEnd > plannedEnd ? 'delayed' : 'complete';
  }
  if (actualStart) {
    if (forecastStart > plannedEnd) {
      return 'delayed';
    }
    return now > plannedEnd ? 'overdue' : 'in-progress';
  }
  if (now > plannedEnd) {
    return 'overdue';
  }
  if (forecastStart > plannedEnd) {
    return 'delayed';
  }
  return 'planned';
};

const findActual = (stageActuals: StageActual[], stage: StageKey) =>
  stageActuals.find((entry) => entry.stage === stage);

export const buildTimeline = (property: PropertyRecord, ruleSet: RuleSet): PropertyTimelineView => {
  const stageActuals = property.stageActuals ?? [];
  const plannedStages: StageTimelineEntry[] = [];

  let plannedCursor = new Date(property.groupClosingDate);
  let forecastCursor = new Date(property.groupClosingDate);

  for (const definition of stageCatalog) {
    const durationWeeks =
      property.customDurations?.[definition.key] ?? ruleSet.durationsWeeks[definition.key];
    const durationDays = Math.max(1, durationWeeks * 7);
    const plannedStart = new Date(plannedCursor);
    const plannedEnd = addDays(plannedStart, durationDays);

    const actual = findActual(stageActuals, definition.key);
    const actualStart = actual?.actualStart ? new Date(actual.actualStart) : undefined;
    const actualEnd = actual?.actualEnd ? new Date(actual.actualEnd) : undefined;

    const forecastStart = actualStart ? actualStart : new Date(Math.max(forecastCursor.getTime(), plannedStart.getTime()));
    const forecastEnd = actualEnd ? actualEnd : addDays(forecastStart, durationDays);

    const status = resolveStatus({ actualStart, actualEnd, plannedEnd, forecastStart });
    const delayDays = Math.max(0, Math.round((forecastStart.getTime() - plannedStart.getTime()) / MS_IN_DAY));

    plannedStages.push({
      key: definition.key,
      label: definition.label,
      owner: definition.owner,
      plannedStart: toISODate(plannedStart),
      plannedEnd: toISODate(plannedEnd),
      forecastStart: toISODate(forecastStart),
      forecastEnd: toISODate(forecastEnd),
      actualStart: actualStart ? toISODate(actualStart) : undefined,
      actualEnd: actualEnd ? toISODate(actualEnd) : undefined,
      durationWeeks,
      status,
      delayDays,
      notes: actual?.notes,
    });

    plannedCursor = plannedEnd;
    forecastCursor = forecastEnd;
  }

  const plannedGoLive = plannedStages[plannedStages.length - 1]?.plannedEnd ?? property.groupClosingDate;
  const forecastGoLive = plannedStages[plannedStages.length - 1]?.forecastEnd ?? plannedGoLive;
  const totalDelayDays = plannedStages.reduce((acc, stage) => acc + stage.delayDays, 0);
  const delayedStages = plannedStages.filter(
    (stage) => stage.status === 'delayed' || stage.status === 'overdue',
  ).length;

  const statusSummary =
    delayedStages === 0
      ? 'On track'
      : delayedStages <= 2
        ? 'Minor delays'
        : 'High risk';

  return {
    property,
    ruleSet,
    stages: plannedStages,
    plannedGoLive,
    forecastGoLive,
    totalDelayDays,
    statusSummary,
  };
};

export const buildTimelineCollection = (properties: PropertyRecord[], rules: RuleSet[]): PropertyTimelineView[] =>
  properties.map((property) => {
    const ruleSet =
      rules.find(
        (rule) => rule.collectionType === property.collectionType && rule.region === property.region,
      ) ?? rules[0];
    return buildTimeline(property, ruleSet);
  });
