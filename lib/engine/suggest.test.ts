import { describe, it, expect } from 'vitest';
import { suggest } from '@/lib/engine/suggest';
import type { Item, ClothingType } from '@/types';

const mk = (
  id: string,
  type: ClothingType,
  over: Partial<Item> = {},
): Item => ({
  id,
  type,
  name: id,
  imageUrl: '',
  imagePublicId: '',
  colors: ['black'],
  styleTags: ['casual'],
  formality: 3,
  createdAt: 0,
  ...over,
});

describe('suggest', () => {
  it('returns [] when no valid outfit can be built', () => {
    expect(suggest([mk('t1', 'ao')])).toEqual([]);
  });

  it('returns scored outfits sorted by score descending', () => {
    const items: Item[] = [
      mk('t-match', 'ao', { colors: ['white'], styleTags: ['casual'], formality: 3 }),
      mk('b-match', 'quan', { colors: ['black'], styleTags: ['casual'], formality: 3 }),
      mk('s-clash', 'giay', { colors: ['red'], styleTags: ['formal'], formality: 5 }),
      mk('s-match', 'giay', { colors: ['gray'], styleTags: ['casual'], formality: 3 }),
    ];
    const out = suggest(items);
    expect(out.length).toBe(2); // 1 top * 1 bottom * 2 shoes
    expect(out[0].score).toBeGreaterThanOrEqual(out[1].score);
    // the coherent shoe wins the top slot
    const winnerShoe = out[0].items.find((r) => r.slot === 'giay');
    expect(winnerShoe?.itemId).toBe('s-match');
  });

  it('respects topN', () => {
    const items: Item[] = [
      mk('t1', 'ao'), mk('t2', 'ao'), mk('t3', 'ao'),
      mk('b1', 'quan'),
      mk('s1', 'giay'),
    ];
    expect(suggest(items, { topN: 2 })).toHaveLength(2);
  });

  it('operates only on the items passed in (filter = pre-filtered subset)', () => {
    const all: Item[] = [
      mk('t1', 'ao', { occasions: ['work'] }),
      mk('t2', 'ao', { occasions: ['gym'] }),
      mk('b1', 'quan', { occasions: ['work'] }),
      mk('s1', 'giay', { occasions: ['work'] }),
    ];
    const workOnly = all.filter((i) => i.occasions?.includes('work'));
    const out = suggest(workOnly);
    const usedTops = new Set(
      out.flatMap((o) => o.items.filter((r) => r.slot === 'ao').map((r) => r.itemId)),
    );
    expect(usedTops.has('t2')).toBe(false); // gym top never enters the engine
  });
});
