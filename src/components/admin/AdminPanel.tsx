"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { stageCatalog } from '@/lib/timeline';
import type {
  CollectionRecord,
  PropertyRecord,
  RuleSet,
  StageKey,
} from '@/lib/types';

interface CollectionPayload {
  name: string;
  code: string;
  regionFocus: string;
  description: string;
}

interface DocumentPayload {
  title: string;
  type: string;
  url?: string;
}

interface PropertyPayload {
  name: string;
  region: string;
  productType: string;
  pm: string;
  priority: 'low' | 'medium' | 'high';
  groupClosingDate: string;
}

interface DurationPayload {
  propertyId: string;
  durations: Record<StageKey, number>;
  applyToRuleSet: boolean;
  collectionType: string;
  region: string;
}

interface AdminPanelProps {
  collections: CollectionRecord[];
  properties: PropertyRecord[];
  ruleSets: RuleSet[];
  onCreateCollection: (payload: CollectionPayload) => void;
  onUpdateCollection: (collectionId: string, updates: Partial<CollectionRecord>) => void;
  onAddDocument: (collectionId: string, payload: DocumentPayload) => void;
  onDeleteDocument: (collectionId: string, documentId: string) => void;
  onAddProperty: (collectionId: string, payload: PropertyPayload) => void;
  onUpdatePropertyDurations: (payload: DurationPayload) => void;
}

const defaultDuration = 4;

export const AdminPanel = ({
  collections,
  properties,
  ruleSets,
  onCreateCollection,
  onUpdateCollection,
  onAddDocument,
  onDeleteDocument,
  onAddProperty,
  onUpdatePropertyDurations,
}: AdminPanelProps) => {
  const [activeCollectionId, setActiveCollectionId] = useState(collections[0]?.id ?? '');
  const [newCollectionForm, setNewCollectionForm] = useState({
    name: '',
    code: '',
    regionFocus: '',
    description: '',
  });
  const [docForm, setDocForm] = useState({ title: '', type: '', url: '' });
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    region: '',
    productType: 'Prime',
    pm: '',
    priority: 'medium' as const,
    groupClosingDate: new Date().toISOString().slice(0, 10),
  });
  const [activePropertyId, setActivePropertyId] = useState('');
  const [durationForm, setDurationForm] = useState<Record<StageKey, number>>(
    buildDurationMap(undefined, ruleSets),
  );
  const [applyToRuleSet, setApplyToRuleSet] = useState(false);

  useEffect(() => {
    if (!activeCollectionId && collections[0]) {
      setActiveCollectionId(collections[0].id);
    }
  }, [collections, activeCollectionId]);

  const activeCollection =
    collections.find((collection) => collection.id === activeCollectionId) ?? collections[0];

  const collectionProperties = useMemo(
    () => properties.filter((property) => property.collectionId === activeCollection?.id),
    [properties, activeCollection?.id],
  );

  const activeProperty =
    collectionProperties.find((property) => property.id === activePropertyId) ??
    collectionProperties[0];

  useEffect(() => {
    if (collectionProperties.length === 0) {
      setActivePropertyId('');
      setDurationForm(buildDurationMap(undefined, ruleSets));
      return;
    }
    const fallbackId = collectionProperties[0].id;
    const nextId = collectionProperties.find((property) => property.id === activePropertyId)?.id;
    const finalId = nextId ?? fallbackId;
    setActivePropertyId(finalId);
  }, [collectionProperties, activePropertyId, ruleSets]);

  useEffect(() => {
    setDurationForm(buildDurationMap(activeProperty, ruleSets));
    setApplyToRuleSet(false);
  }, [activeProperty, ruleSets]);

  const collectionSectionRef = useRef<HTMLDivElement>(null);
  const propertySectionRef = useRef<HTMLDivElement>(null);

  const [collectionForm, setCollectionForm] = useState({
    name: activeCollection?.name ?? '',
    regionFocus: activeCollection?.regionFocus ?? '',
    description: activeCollection?.description ?? '',
  });

  useEffect(() => {
    if (activeCollection) {
      setCollectionForm({
        name: activeCollection.name,
        regionFocus: activeCollection.regionFocus,
        description: activeCollection.description,
      });
    }
  }, [activeCollection]);

  const handleCollectionSave = () => {
    if (!activeCollection) return;
    onUpdateCollection(activeCollection.id, collectionForm);
  };

  const handleCollectionCreate = () => {
    if (!newCollectionForm.name || !newCollectionForm.code) return;
    onCreateCollection(newCollectionForm);
    setNewCollectionForm({ name: '', code: '', regionFocus: '', description: '' });
  };

  const handleAddDoc = () => {
    if (!activeCollection || !docForm.title || !docForm.type) return;
    onAddDocument(activeCollection.id, docForm);
    setDocForm({ title: '', type: '', url: '' });
  };

  const handleAddProperty = () => {
    if (!activeCollection) return;
    if (!propertyForm.name || !propertyForm.region || !propertyForm.pm) return;
    onAddProperty(activeCollection.id, propertyForm);
    setPropertyForm((prev) => ({
      ...prev,
      name: '',
      pm: '',
    }));
  };

  const handleDurationSave = () => {
    if (!activeProperty) return;
    onUpdatePropertyDurations({
      propertyId: activeProperty.id,
      durations: durationForm,
      applyToRuleSet,
      collectionType: activeProperty.collectionType,
      region: activeProperty.region,
    });
    setApplyToRuleSet(false);
  };

  if (!collections.length) {
    return (
      <Card className="h-full">
        <p className="text-sm text-slate-500">No collections yet. Create one to get started.</p>
      </Card>
    );
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap gap-3">
          <button
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            onClick={() => scrollToSection(collectionSectionRef)}
          >
            + Create Collection
          </button>
          <button
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            onClick={() => scrollToSection(propertySectionRef)}
          >
            + Add Property
          </button>
        </div>
      </Card>

      <Card title="Collections" subtitle="Create or refine launch collections">
        <div ref={collectionSectionRef} className="space-y-3">
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={activeCollection?.id ?? ''}
            onChange={(event) => setActiveCollectionId(event.target.value)}
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name} ({collection.propertyIds.length} properties)
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Collection name"
            value={collectionForm.name}
            onChange={(event) => setCollectionForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Region focus"
            value={collectionForm.regionFocus}
            onChange={(event) =>
              setCollectionForm((prev) => ({ ...prev, regionFocus: event.target.value }))
            }
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Description"
            rows={3}
            value={collectionForm.description}
            onChange={(event) =>
              setCollectionForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <button
            className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={handleCollectionSave}
          >
            Save collection
          </button>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Create new collection
            </p>
            <div className="mt-2 space-y-2">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Name (e.g. SC04)"
                value={newCollectionForm.name}
                onChange={(event) =>
                  setNewCollectionForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Code"
                value={newCollectionForm.code}
                onChange={(event) =>
                  setNewCollectionForm((prev) => ({ ...prev, code: event.target.value }))
                }
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Region focus"
                value={newCollectionForm.regionFocus}
                onChange={(event) =>
                  setNewCollectionForm((prev) => ({ ...prev, regionFocus: event.target.value }))
                }
              />
              <textarea
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Description"
                rows={2}
                value={newCollectionForm.description}
                onChange={(event) =>
                  setNewCollectionForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
              <button
                className="w-full rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
                onClick={handleCollectionCreate}
              >
                Add collection
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Collection documents"
        subtitle="Store legal, design, and ops artifacts per collection"
      >
        {activeCollection ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {activeCollection.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {doc.title} <span className="text-xs text-slate-500">({doc.type})</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded {doc.uploadedAt} by {doc.uploadedBy}
                    </p>
                  </div>
                  <button
                    className="text-xs font-semibold uppercase tracking-wide text-rose-600"
                    onClick={() => onDeleteDocument(activeCollection.id, doc.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {activeCollection.documents.length === 0 && (
                <li className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500">
                  No documents yet. Upload the lease, closing memo, or launch brief.
                </li>
              )}
            </ul>
            <div className="rounded-2xl bg-slate-50/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Upload new
              </p>
              <div className="mt-2 space-y-2">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Document title"
                  value={docForm.title}
                  onChange={(event) => setDocForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Type (PDF, Sheet, etc)"
                  value={docForm.type}
                  onChange={(event) => setDocForm((prev) => ({ ...prev, type: event.target.value }))}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Link (optional)"
                  value={docForm.url}
                  onChange={(event) => setDocForm((prev) => ({ ...prev, url: event.target.value }))}
                />
                <button
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  onClick={handleAddDoc}
                >
                  Add document
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a collection to view documents.</p>
        )}
      </Card>

      <Card
        title="Properties & stage defaults"
        subtitle="Keep 4-5 properties aligned per collection with regional context"
      >
        {activeCollection ? (
          <div ref={propertySectionRef} className="space-y-3">
            <div className="rounded-2xl bg-slate-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Add property to {activeCollection.name}
              </p>
              <div className="mt-2 space-y-2">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Property name"
                  value={propertyForm.name}
                  onChange={(event) =>
                    setPropertyForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Region (required)
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      placeholder="e.g. Rome"
                      value={propertyForm.region}
                      onChange={(event) =>
                        setPropertyForm((prev) => ({ ...prev, region: event.target.value }))
                      }
                    />
                  </label>
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="PM"
                    value={propertyForm.pm}
                    onChange={(event) =>
                      setPropertyForm((prev) => ({ ...prev, pm: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={propertyForm.productType}
                    onChange={(event) =>
                      setPropertyForm((prev) => ({ ...prev, productType: event.target.value }))
                    }
                  >
                    <option value="Prime">Prime</option>
                    <option value="Signature">Signature</option>
                  </select>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={propertyForm.priority}
                    onChange={(event) =>
                      setPropertyForm((prev) => ({
                        ...prev,
                        priority: event.target.value as 'low' | 'medium' | 'high',
                      }))
                    }
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Group closing date
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={propertyForm.groupClosingDate}
                    onChange={(event) =>
                      setPropertyForm((prev) => ({
                        ...prev,
                        groupClosingDate: event.target.value,
                      }))
                    }
                  />
                </label>
                <button
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  onClick={handleAddProperty}
                >
                  Add property
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={activeProperty?.id ?? ''}
                    onChange={(event) => setActivePropertyId(event.target.value)}
                  disabled={!collectionProperties.length}
                >
                  {collectionProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} · {property.region}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">
                  {collectionProperties.length} / 5 properties
                </span>
              </div>
              {activeProperty ? (
                <div className="mt-3 space-y-2">
                  {stageCatalog.map((stage) => (
                    <label
                      key={stage.key}
                      className="flex items-center justify-between text-sm font-medium text-slate-700"
                    >
                      <span>{stage.label}</span>
                      <input
                        type="number"
                        min={1}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                        value={durationForm[stage.key]}
                        onChange={(event) =>
                          setDurationForm((prev) => ({
                            ...prev,
                            [stage.key]: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={applyToRuleSet}
                      onChange={(event) => setApplyToRuleSet(event.target.checked)}
                    />
                    Also update collection rule defaults for this region
                  </label>
                  <button
                    className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                    onClick={handleDurationSave}
                  >
                    Save stage defaults
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Add a property to configure stage durations.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a collection to manage properties.</p>
        )}
      </Card>
    </div>
  );
};

const buildDurationMap = (
  property: PropertyRecord | undefined,
  ruleSets: RuleSet[],
): Record<StageKey, number> => {
  const base = stageCatalog.reduce(
    (acc, stage) => ({ ...acc, [stage.key]: defaultDuration }),
    {} as Record<StageKey, number>,
  );
  if (!property) return base;
  const rule =
    ruleSets.find(
      (entry) => entry.collectionType === property.collectionType && entry.region === property.region,
    ) ?? ruleSets[0];
  return stageCatalog.reduce(
    (acc, stage) => ({
      ...acc,
      [stage.key]:
        property.customDurations?.[stage.key] ??
        rule?.durationsWeeks[stage.key] ??
        defaultDuration,
    }),
    {} as Record<StageKey, number>,
  );
};
