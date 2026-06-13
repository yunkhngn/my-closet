import { describe, it, expect, beforeEach } from 'vitest';
import { useItemsStore } from '@/store/items';
import type { Item } from '@/types';

const mk = (id: string, type: Item['type']): Item => ({
  id,
  type,
  name: id,
  imageUrl: '',
  imagePublicId: '',
  colors: ['white'],
  styleTags: ['casual'],
  formality: 2,
  createdAt: 0,
});

describe('items store', () => {
  beforeEach(() => useItemsStore.setState({ items: [], loading: true }));

  it('setItems replaces the list and clears loading', () => {
    useItemsStore.getState().setItems([mk('a', 'ao'), mk('b', 'quan')]);
    const s = useItemsStore.getState();
    expect(s.items).toHaveLength(2);
    expect(s.loading).toBe(false);
  });

  it('byType groups items by clothing type', () => {
    useItemsStore.getState().setItems([mk('a', 'ao'), mk('b', 'ao'), mk('c', 'giay')]);
    const grouped = useItemsStore.getState().byType();
    expect(grouped.ao.map((i) => i.id)).toEqual(['a', 'b']);
    expect(grouped.giay.map((i) => i.id)).toEqual(['c']);
    expect(grouped.quan).toEqual([]);
  });
});
