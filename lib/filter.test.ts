import { describe, it, expect } from 'vitest';
import { deriveFilterOptions, applyFilter, type Filter } from '@/lib/filter';
import type { Item, ClothingType } from '@/types';

const mk = (id: string, type: ClothingType, over: Partial<Item> = {}): Item => ({
  id,
  type,
  name: id,
  imageUrl: '',
  imagePublicId: '',
  colors: ['black'],
  styleTags: [],
  formality: 3,
  createdAt: 0,
  ...over,
});

describe('deriveFilterOptions', () => {
  it('collects unique sorted occasions and styleTags', () => {
    const items = [
      mk('a', 'ao', { occasions: ['work', 'date'], styleTags: ['smart'] }),
      mk('b', 'quan', { occasions: ['work'], styleTags: ['casual', 'smart'] }),
    ];
    const opts = deriveFilterOptions(items);
    expect(opts.occasions).toEqual(['date', 'work']);
    expect(opts.styleTags).toEqual(['casual', 'smart']);
  });
});

describe('applyFilter', () => {
  const items = [
    mk('a', 'ao', { occasions: ['work'], styleTags: ['smart'], formality: 4 }),
    mk('b', 'ao', { occasions: ['gym'], styleTags: ['sporty'], formality: 1 }),
    mk('c', 'ao', { occasions: ['work'], styleTags: ['casual'], formality: 3 }),
  ];

  it('returns all items for an empty filter', () => {
    const f: Filter = {};
    expect(applyFilter(items, f)).toHaveLength(3);
  });

  it('filters by occasion', () => {
    const f: Filter = { occasion: 'work' };
    expect(applyFilter(items, f).map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('filters by styleTag', () => {
    const f: Filter = { styleTag: 'sporty' };
    expect(applyFilter(items, f).map((i) => i.id)).toEqual(['b']);
  });

  it('filters by max formality', () => {
    const f: Filter = { maxFormality: 3 };
    expect(applyFilter(items, f).map((i) => i.id)).toEqual(['b', 'c']);
  });

  it('combines predicates with AND', () => {
    const f: Filter = { occasion: 'work', maxFormality: 3 };
    expect(applyFilter(items, f).map((i) => i.id)).toEqual(['c']);
  });
});
