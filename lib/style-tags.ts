export const STYLE_TAG_VI: Record<string, string> = {
  'minimalist': 'Tối giản',
  'classic': 'Cổ điển',
  'streetwear': 'Đường phố',
  'sporty': 'Thể thao',
  'casual': 'Thường ngày',
  'smart casual': 'Smart Casual',
  'vintage': 'Vintage / Retro / Indie',
  'preppy': 'Preppy',
  'dapper': 'Dapper',
  'boho': 'Bohemian / Hippie',
};

export const STYLE_SUGGESTIONS = Object.keys(STYLE_TAG_VI);

/** Vietnamese display label for an English style key. Falls back to the key itself. */
export function tagLabel(key: string): string {
  return STYLE_TAG_VI[key] ?? key;
}
