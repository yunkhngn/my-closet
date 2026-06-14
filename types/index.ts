export type ClothingType = 'ao_khoac' | 'ao' | 'quan' | 'giay' | 'phu_kien';

export interface Item {
  id: string;
  type: ClothingType;
  name: string;
  imageUrl: string;
  imagePublicId: string;
  colors: string[];
  styleTags: string[];
  formality: number; // 1–5
  size?: string;
  occasions?: string[];
  createdAt: number;
}

export interface OutfitItemRef {
  slot: ClothingType;
  itemId: string;
}

export type OutfitSource = 'manual' | 'algo' | 'ai';

export interface Outfit {
  id: string;
  items: OutfitItemRef[];
  rating?: number; // reserved for v2
  occasion?: string;
  source: OutfitSource;
  createdAt: number;
}

// Display order for the builder (spec §4.4).
export const CLOTHING_TYPES: ClothingType[] = [
  'ao_khoac',
  'ao',
  'quan',
  'giay',
  'phu_kien',
];

export interface SlotMeta {
  required: boolean; // exactly 1 per outfit when true
  multiple: boolean; // 0–n allowed when true
  label: string;
}

export const SLOT_CONFIG: Record<ClothingType, SlotMeta> = {
  ao_khoac: { required: false, multiple: false, label: 'Áo Khoác' },
  ao: { required: true, multiple: false, label: 'Áo' },
  quan: { required: true, multiple: false, label: 'Quần' },
  giay: { required: true, multiple: false, label: 'Giày' },
  phu_kien: { required: false, multiple: true, label: 'Phụ Kiện' },
};

export function isClothingType(value: string): value is ClothingType {
  return (CLOTHING_TYPES as string[]).includes(value);
}
