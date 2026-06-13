import { describe, it, expect } from 'vitest';
import { toWardrobeTags } from '@/lib/ai/client';
import type { Item } from '@/types';

const item: Item = {
  id: 't1', type: 'ao', name: 'Tee',
  imageUrl: 'https://cloud/x.webp', imagePublicId: 'x',
  colors: ['white'], styleTags: ['casual'], formality: 2,
  occasions: ['work'], size: 'M', createdAt: 123,
};

describe('toWardrobeTags', () => {
  it('strips image fields and never leaks the image url', () => {
    const [tag] = toWardrobeTags([item]);
    expect(tag).not.toHaveProperty('imageUrl');
    expect(tag).not.toHaveProperty('imagePublicId');
    expect(JSON.stringify(tag)).not.toContain('cloud');
  });

  it('keeps id, type, name, colors, styleTags, formality, occasions', () => {
    const [tag] = toWardrobeTags([item]);
    expect(tag).toEqual({
      id: 't1', type: 'ao', name: 'Tee',
      colors: ['white'], styleTags: ['casual'], formality: 2,
      occasions: ['work'],
    });
  });
});
