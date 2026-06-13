import { describe, it, expect } from 'vitest';
import { generateCandidates } from '@/lib/engine/candidates';
import type { Item, ClothingType } from '@/types';

const mk = (id: string, type: ClothingType): Item => ({
  id,
  type,
  name: id,
  imageUrl: '',
  imagePublicId: '',
  colors: ['black'],
  styleTags: [],
  formality: 3,
  createdAt: 0,
});

describe('generateCandidates', () => {
  it('returns [] when a required slot is empty', () => {
    const items = [mk('t1', 'ao'), mk('b1', 'quan')]; // no shoes
    expect(generateCandidates(items)).toEqual([]);
  });

  it('builds the minimal required-only combo', () => {
    const items = [mk('t1', 'ao'), mk('b1', 'quan'), mk('s1', 'giay')];
    const combos = generateCandidates(items);
    expect(combos).toHaveLength(1);
    expect(combos[0].map((r) => r.itemId).sort()).toEqual(['b1', 's1', 't1']);
    // each ref carries its slot
    const slots = combos[0].map((r) => r.slot).sort();
    expect(slots).toEqual(['ao', 'giay', 'quan']);
  });

  it('multiplies across required slots', () => {
    const items = [
      mk('t1', 'ao'), mk('t2', 'ao'),
      mk('b1', 'quan'), mk('b2', 'quan'),
      mk('s1', 'giay'),
    ];
    expect(generateCandidates(items)).toHaveLength(4); // 2*2*1
  });

  it('expands outerwear as absent-or-each (0 or 1)', () => {
    const items = [
      mk('t1', 'ao'), mk('b1', 'quan'), mk('s1', 'giay'),
      mk('o1', 'ao_khoac'), mk('o2', 'ao_khoac'),
    ];
    // 1 required combo * (no-outer + o1 + o2) = 3
    expect(generateCandidates(items)).toHaveLength(3);
  });

  it('expands accessory as absent-or-each (0 or 1)', () => {
    const items = [
      mk('t1', 'ao'), mk('b1', 'quan'), mk('s1', 'giay'),
      mk('a1', 'phu_kien'), mk('a2', 'phu_kien'),
    ];
    expect(generateCandidates(items)).toHaveLength(3);
  });

  it('combines optional slots multiplicatively', () => {
    const items = [
      mk('t1', 'ao'), mk('b1', 'quan'), mk('s1', 'giay'),
      mk('o1', 'ao_khoac'),
      mk('a1', 'phu_kien'),
    ];
    // required 1 * (no-outer|o1)=2 * (no-acc|a1)=2 = 4
    expect(generateCandidates(items)).toHaveLength(4);
  });
});
