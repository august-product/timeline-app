"use client";

import { Card } from '@/components/ui/card';

interface FilterBarProps {
  regions: string[];
  collections: string[];
  products: string[];
  properties: string[];
  filters: {
    region: string;
    collection: string;
    property: string;
    product: string;
    search: string;
  };
  onChange: (filters: FilterBarProps['filters']) => void;
}

export const FilterBar = ({
  regions,
  collections,
  products,
  properties,
  filters,
  onChange,
}: FilterBarProps) => {
  const update = (key: keyof FilterBarProps['filters'], value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <Card className="flex flex-wrap gap-4">
      <select
        className="flex-1 rounded-xl border border-[#d8d0c8] bg-[var(--august-card)] px-3 py-2 text-sm text-[var(--august-ink)]"
        value={filters.region}
        onChange={(event) => update('region', event.target.value)}
      >
        <option value="">Regions</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <select
        className="flex-1 rounded-xl border border-[#d8d0c8] bg-[var(--august-card)] px-3 py-2 text-sm text-[var(--august-ink)]"
        value={filters.collection}
        onChange={(event) => update('collection', event.target.value)}
      >
        <option value="">Collections</option>
        {collections.map((collection) => (
          <option key={collection} value={collection}>
            {collection}
          </option>
        ))}
      </select>
      <select
        className="flex-1 rounded-xl border border-[#d8d0c8] bg-[var(--august-card)] px-3 py-2 text-sm text-[var(--august-ink)] disabled:text-[var(--august-muted)]"
        value={filters.property}
        onChange={(event) => update('property', event.target.value)}
        disabled={!filters.collection}
      >
        <option value="">{filters.collection ? 'All properties' : 'Select collection first'}</option>
        {properties.map((property) => (
          <option key={property} value={property}>
            {property}
          </option>
        ))}
      </select>
      <select
        className="flex-1 rounded-xl border border-[#d8d0c8] bg-[var(--august-card)] px-3 py-2 text-sm text-[var(--august-ink)]"
        value={filters.product}
        onChange={(event) => update('product', event.target.value)}
      >
        <option value="">Products</option>
        {products.map((product) => (
          <option key={product} value={product}>
            {product}
          </option>
        ))}
      </select>
      <input
        className="flex-1 rounded-xl border border-[#d8d0c8] bg-[var(--august-card)] px-3 py-2 text-sm text-[var(--august-ink)] placeholder:text-[var(--august-muted)]"
        placeholder="Search property or PM"
        value={filters.search}
        onChange={(event) => update('search', event.target.value)}
      />
    </Card>
  );
};
