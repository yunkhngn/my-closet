import { create } from 'zustand';
import type { Outfit } from '@/types';

interface OutfitsState {
  outfits: Outfit[];
  loading: boolean;
  setOutfits: (outfits: Outfit[]) => void;
}

export const useOutfitsStore = create<OutfitsState>((set) => ({
  outfits: [],
  loading: true,
  setOutfits: (outfits) => set({ outfits, loading: false }),
}));
