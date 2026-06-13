import type { WardrobeTag } from '@/lib/ai/types';

export function buildPrompt(wardrobe: WardrobeTag[], context?: string): string {
  const lines = [
    'You are a personal stylist. Build outfits ONLY from the wardrobe below.',
    '',
    'Slot rules:',
    '- Required exactly once each: "ao" (top), "quan" (bottom), "giay" (shoes).',
    '- Optional: "ao_khoac" (outerwear, 0 or 1), "phu_kien" (accessory, 0 or more).',
    '- Every itemId MUST be an id present in the wardrobe.',
    '',
    'Wardrobe (JSON):',
    JSON.stringify(wardrobe),
    '',
  ];

  if (context && context.trim()) {
    lines.push(`Context: ${context.trim()}`, '');
  }

  lines.push(
    'Return 3 to 5 outfits as PURE JSON (no markdown, no prose, no code fences) of EXACTLY this shape:',
    '{"outfits":[{"items":[{"slot":"ao","itemId":"<id>"}],"reason":"<short reason>"}]}',
  );

  return lines.join('\n');
}
