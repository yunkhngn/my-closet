import type { Item } from '@/types';
import { colorHarmony } from '@/lib/engine/colors';

export const WEIGHTS = {
  color: 0.4,
  style: 0.35,
  formality: 0.25,
} as const;

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 0;
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Mean pairwise Jaccard overlap of styleTags. 1 for a single item. */
export function styleCoherence(items: Item[]): number {
  if (items.length < 2) return 1;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      sum += jaccard(items[i].styleTags, items[j].styleTags);
      count++;
    }
  }
  return count === 0 ? 1 : sum / count;
}

/** 1 - normalized spread of formality (1–5 ⇒ spread 0–4). */
export function formalityCoherence(items: Item[]): number {
  if (items.length < 2) return 1;
  const vals = items.map((i) => i.formality);
  const spread = Math.max(...vals) - Math.min(...vals);
  return 1 - spread / 4;
}

/** Weighted 0..1 score for a combo of items. */
export function scoreCombo(items: Item[]): number {
  const color = colorHarmony(items.map((i) => i.colors));
  const style = styleCoherence(items);
  const formality = formalityCoherence(items);
  return (
    WEIGHTS.color * color +
    WEIGHTS.style * style +
    WEIGHTS.formality * formality
  );
}
