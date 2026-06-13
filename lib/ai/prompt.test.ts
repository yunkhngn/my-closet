import { describe, it, expect } from 'vitest';
import { buildPrompt } from '@/lib/ai/prompt';
import type { WardrobeTag } from '@/lib/ai/types';

const wardrobe: WardrobeTag[] = [
  { id: 't1', type: 'ao', name: 'White tee', colors: ['white'], styleTags: ['casual'], formality: 2 },
  { id: 'b1', type: 'quan', name: 'Black jeans', colors: ['black'], styleTags: ['casual'], formality: 2 },
];

describe('buildPrompt', () => {
  it('embeds the wardrobe as JSON', () => {
    const p = buildPrompt(wardrobe);
    expect(p).toContain('"id":"t1"');
    expect(p).toContain('White tee');
  });

  it('demands pure JSON with the required shape', () => {
    const p = buildPrompt(wardrobe);
    expect(p).toMatch(/json/i);
    expect(p).toContain('itemId');
    expect(p).toContain('reason');
  });

  it('states the required/optional slot rules', () => {
    const p = buildPrompt(wardrobe);
    expect(p).toContain('ao');
    expect(p).toContain('quan');
    expect(p).toContain('giay');
  });

  it('includes user context when provided', () => {
    const p = buildPrompt(wardrobe, 'rainy interview');
    expect(p).toContain('rainy interview');
  });

  it('omits the context line when absent', () => {
    const p = buildPrompt(wardrobe);
    expect(p).not.toMatch(/Context:/);
  });
});
