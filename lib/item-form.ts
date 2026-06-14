import type { ClothingType } from '@/types';

export interface ItemDraft {
  type: ClothingType;
  name: string;
  colors: string[];
  styleTags: string[];
  formality: number;
  size?: string;
  occasions?: string[];
}

export function parseTagList(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

/** Returns a list of invalid field names; empty array = valid. */
export function validateDraft(draft: ItemDraft): string[] {
  const errors: string[] = [];
  if (draft.name.trim().length === 0) errors.push('tên');
  if (draft.colors.length === 0) errors.push('màu sắc');
  if (
    !Number.isInteger(draft.formality) ||
    draft.formality < 1 ||
    draft.formality > 5
  ) {
    errors.push('mức độ trang trọng');
  }
  return errors;
}
