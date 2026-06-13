export type ColorClass =
  | 'neutral'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'other';

// Substring keywords → class. Order matters: neutrals checked first.
const KEYWORDS: Array<[string[], ColorClass]> = [
  [['black', 'white', 'gray', 'grey', 'beige', 'denim', 'navy', 'cream', 'tan', 'khaki', 'silver'], 'neutral'],
  [['red', 'crimson', 'maroon', 'burgundy', 'scarlet'], 'red'],
  [['orange', 'rust', 'terracotta', 'coral'], 'orange'],
  [['yellow', 'mustard', 'gold'], 'yellow'],
  [['green', 'olive', 'mint', 'emerald'], 'green'],
  [['blue', 'teal', 'cyan', 'cobalt', 'sky'], 'blue'],
  [['purple', 'violet', 'lavender', 'plum', 'magenta', 'pink'], 'purple'],
];

export function normalizeColor(raw: string): ColorClass {
  const c = raw.trim().toLowerCase();
  for (const [keywords, cls] of KEYWORDS) {
    if (keywords.some((k) => c.includes(k))) return cls;
  }
  return 'other';
}
