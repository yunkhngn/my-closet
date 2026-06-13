import { describe, it, expect } from 'vitest';
import {
  styleCoherence,
  formalityCoherence,
  scoreCombo,
  WEIGHTS,
} from '@/lib/engine/score';
import type { Item } from '@/types';

const item = (over: Partial<Item>): Item => ({
  id: Math.random().toString(36).slice(2),
  type: 'ao',
  name: 'x',
  imageUrl: '',
  imagePublicId: '',
  colors: ['black'],
  styleTags: [],
  formality: 3,
  createdAt: 0,
  ...over,
});

describe('styleCoherence', () => {
  it('is 1 when all items share identical tags', () => {
    const items = [
      item({ styleTags: ['casual'] }),
      item({ styleTags: ['casual'] }),
    ];
    expect(styleCoherence(items)).toBe(1);
  });

  it('is 0 when items share no tags', () => {
    const items = [
      item({ styleTags: ['casual'] }),
      item({ styleTags: ['formal'] }),
    ];
    expect(styleCoherence(items)).toBe(0);
  });

  it('is partial for partial overlap (Jaccard)', () => {
    // {a,b} vs {b,c} -> intersection 1, union 3 -> 1/3
    const items = [
      item({ styleTags: ['a', 'b'] }),
      item({ styleTags: ['b', 'c'] }),
    ];
    expect(styleCoherence(items)).toBeCloseTo(1 / 3, 5);
  });

  it('is 1 for a single item (no pairs)', () => {
    expect(styleCoherence([item({})])).toBe(1);
  });
});

describe('formalityCoherence', () => {
  it('is 1 when all formalities are equal', () => {
    const items = [item({ formality: 3 }), item({ formality: 3 })];
    expect(formalityCoherence(items)).toBe(1);
  });

  it('is 0 at maximum spread (1 vs 5)', () => {
    const items = [item({ formality: 1 }), item({ formality: 5 })];
    expect(formalityCoherence(items)).toBe(0);
  });

  it('is 0.5 at a spread of 2', () => {
    const items = [item({ formality: 2 }), item({ formality: 4 })];
    expect(formalityCoherence(items)).toBe(0.5);
  });
});

describe('scoreCombo', () => {
  it('weights sum to 1', () => {
    expect(WEIGHTS.color + WEIGHTS.style + WEIGHTS.formality).toBeCloseTo(1, 5);
  });

  it('returns a max score for a perfectly coherent combo', () => {
    const items = [
      item({ colors: ['black'], styleTags: ['casual'], formality: 3 }),
      item({ colors: ['white'], styleTags: ['casual'], formality: 3 }),
    ];
    expect(scoreCombo(items)).toBeCloseTo(1, 5);
  });

  it('penalizes a clashing, incoherent combo below a coherent one', () => {
    const good = [
      item({ colors: ['black'], styleTags: ['casual'], formality: 3 }),
      item({ colors: ['white'], styleTags: ['casual'], formality: 3 }),
    ];
    const bad = [
      item({ colors: ['red'], styleTags: ['formal'], formality: 1 }),
      item({ colors: ['blue'], styleTags: ['sporty'], formality: 5 }),
    ];
    expect(scoreCombo(good)).toBeGreaterThan(scoreCombo(bad));
  });
});
