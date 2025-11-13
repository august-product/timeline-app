"use client";

import { useCallback, useMemo, useState } from 'react';
import { FilterBar } from './FilterBar';
import { PortfolioSummary } from './PortfolioSummary';
import { mockProperties, mockRuleSets } from '@/data/mockData';
import { buildTimelineCollection, stageCatalog } from '@/lib/timeline';
import type {
  PropertyRecord,
  PropertyTimelineView,
  RuleSet,
  StageActual,
  StageKey,
} from '@/lib/types';
import { TimelineMatrix } from '@/components/timeline/TimelineMatrix';
import { StageEditorDrawer, type StageEditorUpdate } from './StageEditorDrawer';

const sortValues = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  );

const ADDITIONAL_REGIONS = ['South of France'];
const ADDITIONAL_COLLECTIONS = [
  'CC01',
  'GPAT01',
  'GPAT02',
  'PATC01',
  'PATC02',
  'PATC03',
  'PATC04',
  'PATC05',
  'PC01',
  'PC02',
  'PC03',
  'PR01',
  'SC04',
  'SC05',
  'SC06',
  'SC07',
  'SC08',
];
const ADDITIONAL_PRODUCTS = ['City Collection', 'Grand Pied á Terre', 'Pied à Terre'];

interface FilterState {
  region: string;
  collection: string;
  property: string;
  product: string;
  search: string;
}

export const TimelineWorkspace = () => {
  const [properties, setProperties] = useState<PropertyRecord[]>(mockProperties);
  const [ruleSets] = useState<RuleSet[]>(mockRuleSets);
  const [filters, setFilters] = useState<FilterState>(() => ({
    region: '',
    collection: '',
    property: '',
    product: '',
    search: '',
  }));
  const [editingTarget, setEditingTarget] = useState<{ id: string; nonce: number } | null>(null);

  const timelines = useMemo(
    () => buildTimelineCollection(properties, ruleSets),
    [properties, ruleSets],
  );

  const filteredTimelines = useMemo(() => {
    const searchTerm = filters.search.toLowerCase();
    return timelines.filter((timeline) => {
      const matchesRegion = !filters.region || timeline.property.region === filters.region;
      const matchesCollection =
        !filters.collection || timeline.property.collectionName === filters.collection;
      const matchesProduct = !filters.product || timeline.property.productType === filters.product;
      const matchesProperty =
        !filters.property || timeline.property.name === filters.property;
      const matchesSearch =
        !searchTerm ||
        timeline.property.name.toLowerCase().includes(searchTerm) ||
        timeline.property.pm.toLowerCase().includes(searchTerm);

      return (
        matchesRegion &&
        matchesCollection &&
        matchesProduct &&
        matchesProperty &&
        matchesSearch
      );
    });
  }, [filters, timelines]);

  const regionOptions = useMemo(
    () => sortValues([...properties.map((property) => property.region), ...ADDITIONAL_REGIONS]),
    [properties],
  );

  const collectionOptions = useMemo(
    () =>
      sortValues([
        ...properties.map((property) => property.collectionName),
        ...ADDITIONAL_COLLECTIONS,
      ]),
    [properties],
  );
  const propertyOptions = useMemo(() => {
    if (!filters.collection) return [];
    return sortValues(
      properties
        .filter((property) => property.collectionName === filters.collection)
        .map((property) => property.name),
    );
  }, [filters.collection, properties]);
  const productOptions = useMemo(
    () =>
      sortValues([...properties.map((property) => property.productType), ...ADDITIONAL_PRODUCTS]),
    [properties],
  );

  const editingTimeline: PropertyTimelineView | null =
    (editingTarget &&
      timelines.find((timeline) => timeline.property.id === editingTarget.id)) ??
    null;

  const handleStageSave = (propertyId: string, updates: StageEditorUpdate[]) => {
    setProperties((prev) =>
      prev.map((property) => {
        if (property.id !== propertyId) return property;
        const updateMap = new Map(updates.map((entry) => [entry.stage, entry]));

        const mergedActuals: StageActual[] = [];
        for (const stage of stageCatalog) {
          const update = updateMap.get(stage.key);
          const existing = property.stageActuals.find(
            (actual) => actual.stage === stage.key,
          );

          if (update) {
            if (!update.clear) {
              mergedActuals.push({
                stage: stage.key,
                actualStart: update.actualStart,
                actualEnd: update.actualEnd,
              });
            }
            continue;
          }

          if (existing) {
            mergedActuals.push(existing);
          }
        }

        return {
          ...property,
          stageActuals: mergedActuals,
        };
      }),
    );
    setEditingTarget(null);
  };

  const openEditor = (propertyId: string) => {
    setEditingTarget({ id: propertyId, nonce: Date.now() });
  };

  const handleStagePositionChange = useCallback(
    (propertyId: string, stageKey: StageKey, actualStart: string, actualEnd: string) => {
      setProperties((prev) =>
        prev.map((property) => {
          if (property.id !== propertyId) return property;
          const nextActuals = property.stageActuals ? [...property.stageActuals] : [];
          const payload = { stage: stageKey, actualStart, actualEnd };
          const existingIndex = nextActuals.findIndex((entry) => entry.stage === stageKey);
          if (existingIndex >= 0) {
            nextActuals[existingIndex] = payload;
          } else {
            nextActuals.push(payload);
          }
          return {
            ...property,
            stageActuals: nextActuals,
          };
        }),
      );
    },
    [],
  );


  return (
    <div className="space-y-6">
      <FilterBar
        regions={regionOptions}
        collections={collectionOptions}
        products={productOptions}
        properties={propertyOptions}
        filters={filters}
        onChange={setFilters}
      />

      <PortfolioSummary timelines={filteredTimelines} />

      {filteredTimelines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center text-slate-500">
          No properties match the current filters. Choose another collection to populate the board.
        </div>
      ) : (
        <TimelineMatrix
          timelines={filteredTimelines}
          onEditProperty={openEditor}
          onStageChange={handleStagePositionChange}
        />
      )}

      {editingTimeline && (
        <StageEditorDrawer
          key={`${editingTimeline.property.id}-${editingTarget?.nonce ?? 0}`}
          timeline={editingTimeline}
          open={Boolean(editingTarget)}
          onClose={() => setEditingTarget(null)}
          onSave={handleStageSave}
        />
      )}
    </div>
  );
};
