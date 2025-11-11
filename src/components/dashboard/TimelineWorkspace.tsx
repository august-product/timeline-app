"use client";

import { useMemo, useState } from 'react';
import { FilterBar } from './FilterBar';
import { PortfolioSummary } from './PortfolioSummary';
import { mockProperties, mockRuleSets } from '@/data/mockData';
import { buildTimelineCollection, stageCatalog } from '@/lib/timeline';
import type {
  PropertyRecord,
  PropertyTimelineView,
  RuleSet,
  StageActual,
} from '@/lib/types';
import { TimelineMatrix } from '@/components/timeline/TimelineMatrix';
import { StageEditorDrawer, type StageEditorUpdate } from './StageEditorDrawer';

interface FilterState {
  region: string;
  collection: string;
  property: string;
  product: string;
  search: string;
  startDate: string;
  endDate: string;
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
    startDate: '',
    endDate: '',
  }));
  const [editingTarget, setEditingTarget] = useState<{ id: string; nonce: number } | null>(null);

  const timelines = useMemo(
    () => buildTimelineCollection(properties, ruleSets),
    [properties, ruleSets],
  );

  const filteredTimelines = useMemo(() => {
    const searchTerm = filters.search.toLowerCase();
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;
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

      const propertyStart = new Date(timeline.property.groupClosingDate);
      const matchesStart = !startDate || propertyStart >= startDate;
      const matchesEnd = !endDate || propertyStart <= endDate;

      return (
        matchesRegion &&
        matchesCollection &&
        matchesProduct &&
        matchesProperty &&
        matchesSearch &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [filters, timelines]);

  const regionOptions = useMemo(
    () => [...new Set(properties.map((property) => property.region))],
    [properties],
  );
  const collectionOptions = useMemo(
    () => [...new Set(properties.map((property) => property.collectionName))],
    [properties],
  );
  const propertyOptions = useMemo(() => {
    if (!filters.collection) return [];
    return properties
      .filter((property) => property.collectionName === filters.collection)
      .map((property) => property.name);
  }, [filters.collection, properties]);
  const productOptions = useMemo(
    () => [...new Set(properties.map((property) => property.productType))],
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
        <TimelineMatrix timelines={filteredTimelines} onEditProperty={openEditor} />
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
