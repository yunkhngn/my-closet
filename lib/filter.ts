import type { Item } from '@/types';

export interface Filter {
  occasion?: string;
  styleTag?: string;
  maxFormality?: number;
}

export interface FilterOptions {
  occasions: string[];
  styleTags: string[];
}

export function deriveFilterOptions(items: Item[]): FilterOptions {
  const occasions = new Set<string>();
  const styleTags = new Set<string>();
  for (const item of items) {
    item.occasions?.forEach((o) => occasions.add(o));
    item.styleTags.forEach((s) => styleTags.add(s));
  }
  return {
    occasions: [...occasions].sort(),
    styleTags: [...styleTags].sort(),
  };
}

export function applyFilter(items: Item[], filter: Filter): Item[] {
  return items.filter((item) => {
    if (filter.occasion && !item.occasions?.includes(filter.occasion)) return false;
    if (filter.styleTag && !item.styleTags.includes(filter.styleTag)) return false;
    if (filter.maxFormality != null && item.formality > filter.maxFormality) return false;
    return true;
  });
}
