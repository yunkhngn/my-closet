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

const COMPLEMENTS: Partial<Record<ColorClass, ColorClass>> = {
  red: 'green',
  green: 'red',
  blue: 'orange',
  orange: 'blue',
  yellow: 'purple',
  purple: 'yellow',
};

function pairScore(a: ColorClass, b: ColorClass): number {
  if (a === 'neutral' || b === 'neutral') return 1;
  if (a === b) return 0.8; // analogous / same family
  if (COMPLEMENTS[a] === b) return 0.9; // complementary
  return 0.4; // clash
}

/**
 * @param itemColors one array of color strings per item in the combo.
 * Returns 0..1; 1 when 0–1 items carry a non-neutral color.
 */
export function colorHarmony(itemColors: string[][]): number {
  // One representative class per item: first non-neutral, else neutral.
  const classes: ColorClass[] = itemColors.map((colors) => {
    const normalized = colors.map(normalizeColor);
    return normalized.find((c) => c !== 'neutral') ?? 'neutral';
  });

  const colored = classes.filter((c) => c !== 'neutral');
  if (colored.length <= 1) return 1;

  let sum = 0;
  let count = 0;
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      sum += pairScore(classes[i], classes[j]);
      count++;
    }
  }
  return count === 0 ? 1 : sum / count;
}
