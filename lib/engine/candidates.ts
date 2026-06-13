import type { Item, OutfitItemRef, ClothingType } from '@/types';

function byType(items: Item[], type: ClothingType): Item[] {
  return items.filter((i) => i.type === type);
}

/**
 * Enumerate valid slot combinations.
 * Required (1 each): ao, quan, giay. Optional (0 or 1): ao_khoac, phu_kien.
 * Returns [] if any required slot is empty.
 * Note: accessory capped at 0/1 for the suggester (see plan §design).
 */
export function generateCandidates(items: Item[]): OutfitItemRef[][] {
  const tops = byType(items, 'ao');
  const bottoms = byType(items, 'quan');
  const shoes = byType(items, 'giay');
  if (!tops.length || !bottoms.length || !shoes.length) return [];

  // null = "slot absent" option for optionals.
  const outers: (Item | null)[] = [null, ...byType(items, 'ao_khoac')];
  const accessories: (Item | null)[] = [null, ...byType(items, 'phu_kien')];

  const combos: OutfitItemRef[][] = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        for (const outer of outers) {
          for (const acc of accessories) {
            const refs: OutfitItemRef[] = [
              { slot: 'ao', itemId: top.id },
              { slot: 'quan', itemId: bottom.id },
              { slot: 'giay', itemId: shoe.id },
            ];
            if (outer) refs.push({ slot: 'ao_khoac', itemId: outer.id });
            if (acc) refs.push({ slot: 'phu_kien', itemId: acc.id });
            combos.push(refs);
          }
        }
      }
    }
  }
  return combos;
}
