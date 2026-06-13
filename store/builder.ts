import { create } from 'zustand';
import type { ClothingType, OutfitItemRef } from '@/types';

type Selection = Partial<Record<ClothingType, string[]>>;

interface BuilderState {
  selection: Selection;
  setSlot: (slot: ClothingType, itemId: string) => void; // replace
  addToSlot: (slot: ClothingType, itemId: string) => void; // append
  clearSlot: (slot: ClothingType) => void;
  reset: () => void;
  toRefs: () => OutfitItemRef[];
  loadRefs: (refs: OutfitItemRef[]) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  selection: {},
  setSlot: (slot, itemId) =>
    set((s) => ({ selection: { ...s.selection, [slot]: [itemId] } })),
  addToSlot: (slot, itemId) =>
    set((s) => ({
      selection: { ...s.selection, [slot]: [...(s.selection[slot] ?? []), itemId] },
    })),
  clearSlot: (slot) =>
    set((s) => {
      const next = { ...s.selection };
      delete next[slot];
      return { selection: next };
    }),
  reset: () => set({ selection: {} }),
  toRefs: () => {
    const refs: OutfitItemRef[] = [];
    for (const [slot, ids] of Object.entries(get().selection)) {
      for (const itemId of ids ?? [])
        refs.push({ slot: slot as ClothingType, itemId });
    }
    return refs;
  },
  loadRefs: (refs) => {
    const sel: Selection = {};
    for (const r of refs) sel[r.slot] = [...(sel[r.slot] ?? []), r.itemId];
    set({ selection: sel });
  },
}));
