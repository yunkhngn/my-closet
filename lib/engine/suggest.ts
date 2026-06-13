import type { Item, OutfitItemRef } from '@/types';
import { generateCandidates } from '@/lib/engine/candidates';
import { scoreCombo } from '@/lib/engine/score';

export interface ScoredOutfit {
  items: OutfitItemRef[];
  score: number;
}

export interface SuggestOptions {
  topN?: number;
}

/**
 * Pure suggestion engine. Pass the full wardrobe for "style everything", or a
 * pre-filtered subset for "style for a situation" — same engine, no branch.
 */
export function suggest(
  items: Item[],
  { topN = 10 }: SuggestOptions = {},
): ScoredOutfit[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const candidates = generateCandidates(items);

  const scored: ScoredOutfit[] = candidates.map((refs) => {
    const comboItems = refs.map((r) => byId.get(r.itemId)!);
    return { items: refs, score: scoreCombo(comboItems) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}
