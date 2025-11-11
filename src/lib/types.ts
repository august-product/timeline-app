export type StageKey =
  | 'sales_to_close_group'
  | 'legal_onboarding'
  | 'find_properties'
  | 'renovation'
  | 'design_install'
  | 'onboarding_home'
  | 'go_live';

export type StageStatus = 'planned' | 'in-progress' | 'delayed' | 'overdue' | 'complete';

export type UserRole = 'Leadership' | 'Operations' | 'Legal' | 'Finance' | 'PM' | 'Home Experience' | 'Marketing';

export interface StageDefinition {
  key: StageKey;
  label: string;
  owner: UserRole;
  field: string;
  color: string;
  description: string;
}

export interface StageActual {
  stage: StageKey;
  actualStart?: string;
  actualEnd?: string;
  notes?: string;
}

export interface RuleSet {
  id: string;
  collectionType: string;
  region: string;
  label: string;
  durationsWeeks: Record<StageKey, number>;
  updatedAt: string;
}

export interface CollectionDocument {
  id: string;
  title: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

export interface CollectionRecord {
  id: string;
  name: string;
  code: string;
  regionFocus: string;
  description: string;
  propertyIds: string[];
  documents: CollectionDocument[];
}

export interface PropertyRecord {
  id: string;
  name: string;
  code: string;
  collectionId: string;
  collectionName: string;
  collectionType: string;
  productType: string;
  region: string;
  pm: string;
  stageActuals: StageActual[];
  groupClosingDate: string;
  priority: 'low' | 'medium' | 'high';
  riskNotes?: string;
  customDurations?: Partial<Record<StageKey, number>>;
}

export interface StageTimelineEntry {
  key: StageKey;
  label: string;
  owner: UserRole;
  plannedStart: string;
  plannedEnd: string;
  forecastStart: string;
  forecastEnd: string;
  actualStart?: string;
  actualEnd?: string;
  durationWeeks: number;
  status: StageStatus;
  delayDays: number;
  notes?: string;
}

export interface PropertyTimelineView {
  property: PropertyRecord;
  ruleSet: RuleSet;
  stages: StageTimelineEntry[];
  plannedGoLive: string;
  forecastGoLive: string;
  totalDelayDays: number;
  statusSummary: string;
}
