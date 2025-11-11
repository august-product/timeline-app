import type { CollectionRecord, PropertyRecord, RuleSet } from '@/lib/types';

const collections = ['SC01', 'SC02', 'SC03'];
const regions = ['Rome', 'London', 'Paris', 'Cannes', 'Barcelona'] as const;

const baseDurations = {
  Rome: {
    sales_to_close_group: 4,
    legal_onboarding: 3,
    find_properties: 9,
    renovation: 26,
    design_install: 3,
    onboarding_home: 5,
    go_live: 1,
  },
  London: {
    sales_to_close_group: 3,
    legal_onboarding: 3,
    find_properties: 8,
    renovation: 24,
    design_install: 3,
    onboarding_home: 4,
    go_live: 1,
  },
  Paris: {
    sales_to_close_group: 4,
    legal_onboarding: 2,
    find_properties: 8,
    renovation: 28,
    design_install: 4,
    onboarding_home: 5,
    go_live: 1,
  },
  Cannes: {
    sales_to_close_group: 5,
    legal_onboarding: 3,
    find_properties: 10,
    renovation: 30,
    design_install: 3,
    onboarding_home: 6,
    go_live: 1,
  },
  Barcelona: {
    sales_to_close_group: 4,
    legal_onboarding: 3,
    find_properties: 9,
    renovation: 25,
    design_install: 4,
    onboarding_home: 5,
    go_live: 1,
  },
} as const;

const pmDirectory: Record<(typeof regions)[number], string[]> = {
  Rome: ['Lucia Bianchi', 'Marco Ricci', 'Giulia Costa'],
  London: ['Oliver Grant', 'Priya Patel', 'Noah Ellis'],
  Paris: ['Camille Bernard', 'Adrien Laurent', 'Sophie Renault'],
  Cannes: ['Elise Laurent', 'Hugo Marin', 'Maelle Dubois'],
  Barcelona: ['Rosa Vidal', 'Mateo Ortega', 'Carla Gomez'],
};

const startDates: Record<(typeof regions)[number], string> = {
  Rome: '2025-01-06',
  London: '2025-01-13',
  Paris: '2024-12-16',
  Cannes: '2025-02-03',
  Barcelona: '2025-01-20',
};

const riskNotes: Record<(typeof regions)[number], string> = {
  Rome: 'Awaiting cultural-heritage approval for facade work.',
  London: 'Party wall sign-off pending from neighbors.',
  Paris: 'Luxury vendor short list still in review.',
  Cannes: 'Seasonal labor constraints may impact renovation.',
  Barcelona: 'Solar permitting may add two weeks of delay.',
};

export const mockRuleSets: RuleSet[] = collections.flatMap((collection) =>
  regions.map((region) => ({
    id: `${collection.toLowerCase()}-${region.toLowerCase()}`,
    label: `${collection} | ${region}`,
    collectionType: collection,
    region,
    updatedAt: '2025-03-01',
    durationsWeeks: baseDurations[region],
  })),
);

const buildStageActuals = (region: (typeof regions)[number]) => {
  const base = startDates[region];
  const [year, month, day] = base.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  const addDays = (d: number) => {
    const next = new Date(start);
    next.setUTCDate(start.getUTCDate() + d);
    return next.toISOString().slice(0, 10);
  };
  return [
    {
      stage: 'sales_to_close_group',
      actualStart: addDays(0),
      actualEnd: addDays(25),
    },
    {
      stage: 'legal_onboarding',
      actualStart: addDays(27),
      actualEnd: addDays(50),
    },
    {
      stage: 'find_properties',
      actualStart: addDays(52),
      actualEnd: addDays(100),
    },
    {
      stage: 'renovation',
      actualStart: addDays(102),
    },
  ];
};

export const mockProperties: PropertyRecord[] = collections.flatMap((collection, index) =>
  regions.map((region) => {
    const pmCandidates = pmDirectory[region];
    const pm = pmCandidates[index % pmCandidates.length];
    const priority = (['high', 'medium', 'low'] as const)[(index + regions.indexOf(region)) % 3];
    return {
      id: `${collection.toLowerCase()}-${region.toLowerCase()}`,
      name: `${collection} · ${region} Collection`,
      code: `${collection}-${region.slice(0, 3).toUpperCase()}`,
      collectionId: collection.toLowerCase(),
      collectionName: collection,
      collectionType: collection,
      productType: index % 2 === 0 ? 'Prime' : 'Signature',
      region,
      pm,
      priority,
      groupClosingDate: startDates[region],
      riskNotes: riskNotes[region],
      stageActuals: buildStageActuals(region),
    } satisfies PropertyRecord;
  }),
);

export const mockCollections: CollectionRecord[] = [
  {
    id: 'sc01',
    name: 'SC01',
    code: 'SC01',
    regionFocus: 'Rome, London, Paris, Cannes, Barcelona',
    description: 'Luxury Prime collection focused on European gateway cities.',
    propertyIds: ['sc01-rome', 'sc01-london', 'sc01-paris', 'sc01-cannes', 'sc01-barcelona'],
    documents: [
      {
        id: 'doc-sc01-1',
        title: 'Investment Memo',
        type: 'PDF',
        uploadedBy: 'Julia Navarro',
        uploadedAt: '2025-02-02',
      },
      {
        id: 'doc-sc01-2',
        title: 'Design Guidelines',
        type: 'Figma',
        uploadedBy: 'Leo Faraday',
        uploadedAt: '2025-02-18',
        url: 'https://example.com/design',
      },
    ],
  },
  {
    id: 'sc02',
    name: 'SC02',
    code: 'SC02',
    regionFocus: 'Mediterranean + Atlantic coasts',
    description: 'Signature villas optimized for extended leisure stays.',
    propertyIds: ['sc02-rome', 'sc02-london', 'sc02-paris', 'sc02-cannes', 'sc02-barcelona'],
    documents: [
      {
        id: 'doc-sc02-1',
        title: 'Brand Toolkit',
        type: 'ZIP',
        uploadedBy: 'Nina Kaur',
        uploadedAt: '2025-01-26',
      },
    ],
  },
  {
    id: 'sc03',
    name: 'SC03',
    code: 'SC03',
    regionFocus: 'Capital cities rollout',
    description: 'High-touch properties in dense urban corridors.',
    propertyIds: ['sc03-rome', 'sc03-london', 'sc03-paris', 'sc03-cannes', 'sc03-barcelona'],
    documents: [
      {
        id: 'doc-sc03-1',
        title: 'Ops Checklist',
        type: 'Sheet',
        uploadedBy: 'Mara Sully',
        uploadedAt: '2025-02-11',
      },
    ],
  },
];
