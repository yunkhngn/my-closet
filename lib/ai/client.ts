import type { Item } from '@/types';
import type { WardrobeTag, AiOutfit, SuggestResponse } from '@/lib/ai/types';

/** Map items to tag-only payload. NEVER includes image fields (spec §1, §6). */
export function toWardrobeTags(items: Item[]): WardrobeTag[] {
  return items.map((i) => ({
    id: i.id,
    type: i.type,
    name: i.name,
    colors: i.colors,
    styleTags: i.styleTags,
    formality: i.formality,
    ...(i.occasions ? { occasions: i.occasions } : {}),
  }));
}

export interface AiResult {
  outfits: AiOutfit[];
  error?: string;
}

export async function fetchAiSuggestions(
  items: Item[],
  context?: string,
): Promise<AiResult> {
  const res = await fetch('/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wardrobe: toWardrobeTags(items), context }),
  });
  if (!res.ok) {
    const msg = res.status === 503 ? 'AI not configured' : 'AI unavailable';
    return { outfits: [], error: msg };
  }
  const data = (await res.json()) as SuggestResponse;
  return { outfits: data.outfits ?? [] };
}
