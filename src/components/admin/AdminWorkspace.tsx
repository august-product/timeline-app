"use client";

import { useState } from 'react';
import { AdminPanel } from './AdminPanel';
import { mockCollections, mockProperties, mockRuleSets } from '@/data/mockData';
import type { CollectionRecord, PropertyRecord, RuleSet, StageKey } from '@/lib/types';

export const AdminWorkspace = () => {
  const [collections, setCollections] = useState<CollectionRecord[]>(mockCollections);
  const [properties, setProperties] = useState<PropertyRecord[]>(mockProperties);
  const [ruleSets, setRuleSets] = useState<RuleSet[]>(mockRuleSets);

  const handleCreateCollection = (payload: {
    name: string;
    code: string;
    regionFocus: string;
    description: string;
  }) => {
    const id = slugify(payload.code || payload.name);
    const nextCollection: CollectionRecord = {
      id,
      name: payload.name,
      code: payload.code || payload.name,
      regionFocus: payload.regionFocus,
      description: payload.description,
      propertyIds: [],
      documents: [],
    };
    setCollections((prev) => [...prev, nextCollection]);
  };

  const handleUpdateCollection = (collectionId: string, updates: Partial<CollectionRecord>) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId ? { ...collection, ...updates } : collection,
      ),
    );
  };

  const handleAddDocument = (
    collectionId: string,
    payload: { title: string; type: string; url?: string },
  ) => {
    const doc = {
      id: generateId('doc'),
      title: payload.title,
      type: payload.type,
      url: payload.url,
      uploadedBy: 'Admin User',
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? { ...collection, documents: [...collection.documents, doc] }
          : collection,
      ),
    );
  };

  const handleDeleteDocument = (collectionId: string, documentId: string) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              documents: collection.documents.filter((doc) => doc.id !== documentId),
            }
          : collection,
      ),
    );
  };

  const handleAddProperty = (
    collectionId: string,
    payload: {
      name: string;
      region: string;
      productType: string;
      pm: string;
      priority: 'low' | 'medium' | 'high';
      groupClosingDate: string;
    },
  ) => {
    const collection = collections.find((entry) => entry.id === collectionId);
    const id = slugify(`${collectionId}-${payload.name}-${Date.now()}`);
    const newProperty: PropertyRecord = {
      id,
      name: payload.name,
      code: payload.name.slice(0, 3).toUpperCase(),
      collectionId,
      collectionName: collection?.name ?? collectionId.toUpperCase(),
      collectionType: collection?.code ?? collectionId.toUpperCase(),
      productType: payload.productType,
      region: payload.region,
      pm: payload.pm,
      stageActuals: [],
      groupClosingDate: payload.groupClosingDate,
      priority: payload.priority,
      riskNotes: '',
    };
    setProperties((prev) => [...prev, newProperty]);
    setCollections((prev) =>
      prev.map((entry) =>
        entry.id === collectionId
          ? { ...entry, propertyIds: [...entry.propertyIds, newProperty.id] }
          : entry,
      ),
    );
  };

  const handleUpdatePropertyDurations = (payload: {
    propertyId: string;
    durations: Record<StageKey, number>;
    applyToRuleSet: boolean;
    collectionType: string;
    region: string;
  }) => {
    setProperties((prev) =>
      prev.map((property) =>
        property.id === payload.propertyId
          ? { ...property, customDurations: payload.durations }
          : property,
      ),
    );
    if (payload.applyToRuleSet) {
      setRuleSets((prev) =>
        prev.map((rule) =>
          rule.collectionType === payload.collectionType && rule.region === payload.region
            ? { ...rule, durationsWeeks: payload.durations as Record<StageKey, number> }
            : rule,
        ),
      );
    }
  };

  return (
    <AdminPanel
      collections={collections}
      properties={properties}
      ruleSets={ruleSets}
      onCreateCollection={handleCreateCollection}
      onUpdateCollection={handleUpdateCollection}
      onAddDocument={handleAddDocument}
      onDeleteDocument={handleDeleteDocument}
      onAddProperty={handleAddProperty}
      onUpdatePropertyDurations={handleUpdatePropertyDurations}
    />
  );
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `item-${Date.now()}`;

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
