import { isClothingType, SLOT_CONFIG, CLOTHING_TYPES, type OutfitItemRef } from '@/types';
import type { AiOutfit } from '@/lib/ai/types';

const REQUIRED_SLOTS = CLOTHING_TYPES.filter((t) => SLOT_CONFIG[t].required);

function stripFences(raw: string): string {
  return raw
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();
}

function tryParse(raw: string): unknown {
  try {
    return JSON.parse(stripFences(raw));
  } catch {
    // Last resort: grab the first {...} block.
    const match = stripFences(raw).match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

/** Validate + sanitize. Never throws. Drops anything malformed or unbuildable. */
export function parseSuggestResponse(raw: string, validIds: Set<string>): AiOutfit[] {
  const data = tryParse(raw) as { outfits?: unknown } | null;
  if (!data || !Array.isArray(data.outfits)) return [];

  const result: AiOutfit[] = [];
  for (const outfit of data.outfits) {
    if (!outfit || typeof outfit !== 'object') continue;
    const rawItems = (outfit as { items?: unknown }).items;
    if (!Array.isArray(rawItems)) continue;

    const refs: OutfitItemRef[] = [];
    for (const r of rawItems) {
      if (!r || typeof r !== 'object') continue;
      const slot = (r as { slot?: unknown }).slot;
      const itemId = (r as { itemId?: unknown }).itemId;
      if (typeof slot !== 'string' || typeof itemId !== 'string') continue;
      if (!isClothingType(slot)) continue; // drop invalid slot, keep going
      if (!validIds.has(itemId)) {
        refs.length = 0; // unknown id ⇒ reject the whole outfit
        break;
      }
      refs.push({ slot, itemId });
    }

    const hasAllRequired = REQUIRED_SLOTS.every((s) =>
      refs.some((r) => r.slot === s),
    );
    if (!hasAllRequired) continue;

    const reason = typeof (outfit as { reason?: unknown }).reason === 'string'
      ? (outfit as { reason: string }).reason
      : '';
    result.push({ items: refs, reason });
  }
  return result;
}
