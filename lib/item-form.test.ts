import { describe, it, expect } from 'vitest';
import { parseTagList, validateDraft, type ItemDraft } from '@/lib/item-form';

describe('parseTagList', () => {
  it('splits on commas and trims', () => {
    expect(parseTagList('white, denim blue ,  black')).toEqual([
      'white',
      'denim blue',
      'black',
    ]);
  });
  it('drops empties and lowercases', () => {
    expect(parseTagList('White, , ,RED')).toEqual(['white', 'red']);
  });
  it('returns [] for blank input', () => {
    expect(parseTagList('   ')).toEqual([]);
  });
});

describe('validateDraft', () => {
  const base: ItemDraft = {
    type: 'ao',
    name: 'White tee',
    colors: ['white'],
    styleTags: ['casual'],
    formality: 2,
  };

  it('accepts a complete draft', () => {
    expect(validateDraft(base)).toEqual([]);
  });
  it('requires a name', () => {
    expect(validateDraft({ ...base, name: '  ' })).toContain('name');
  });
  it('requires at least one color', () => {
    expect(validateDraft({ ...base, colors: [] })).toContain('colors');
  });
  it('rejects formality outside 1–5', () => {
    expect(validateDraft({ ...base, formality: 0 })).toContain('formality');
    expect(validateDraft({ ...base, formality: 6 })).toContain('formality');
  });
});
