import type { ClothingType, OutfitItemRef } from '@/types';

/** One item as sent to the model — tags only, NEVER an image URL. */
export interface WardrobeTag {
  id: string;
  type: ClothingType;
  name: string;
  colors: string[];
  styleTags: string[];
  formality: number;
  occasions?: string[];
}

export interface SuggestRequest {
  wardrobe: WardrobeTag[];
  context?: string; // e.g. "style something for a rainy interview"
}

export interface AiOutfit {
  items: OutfitItemRef[];
  reason: string;
}

export interface SuggestResponse {
  outfits: AiOutfit[];
}
