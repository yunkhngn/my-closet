import { create } from 'zustand';
import type { Item, ClothingType } from '@/types';
import { CLOTHING_TYPES } from '@/types';

interface ItemsState {
  items: Item[];
  loading: boolean;
  setItems: (items: Item[]) => void;
  byType: () => Record<ClothingType, Item[]>;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  loading: true,
  setItems: (items) => set({ items, loading: false }),
  byType: () => {
    const groups = Object.fromEntries(
      CLOTHING_TYPES.map((t) => [t, [] as Item[]]),
    ) as Record<ClothingType, Item[]>;
    for (const item of get().items) groups[item.type].push(item);
    return groups;
  },
}));
