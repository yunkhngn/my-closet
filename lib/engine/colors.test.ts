import { describe, it, expect } from 'vitest';
import { normalizeColor, type ColorClass, colorHarmony } from '@/lib/engine/colors';

const expectClass = (input: string, cls: ColorClass) =>
  expect(normalizeColor(input)).toBe(cls);

describe('normalizeColor', () => {
  it('maps obvious neutrals', () => {
    for (const c of ['black', 'white', 'gray', 'grey', 'beige', 'denim', 'denim blue', 'navy', 'cream', 'tan'])
      expectClass(c, 'neutral');
  });

  it('maps hue families', () => {
    expectClass('red', 'red');
    expectClass('crimson', 'red');
    expectClass('orange', 'orange');
    expectClass('mustard yellow', 'yellow');
    expectClass('forest green', 'green');
    expectClass('sky blue', 'blue');
    expectClass('purple', 'purple');
    expectClass('lavender', 'purple');
  });

  it('is case- and whitespace-insensitive', () => {
    expectClass('  RED  ', 'red');
  });

  it('falls back to "other" for unknown colors', () => {
    expectClass('chartreuse-ish thing', 'other');
  });
});

describe('colorHarmony', () => {
  it('returns 1 when every color is neutral', () => {
    expect(colorHarmony([['black'], ['white'], ['gray']])).toBe(1);
  });

  it('returns 1 when at most one item has a non-neutral color', () => {
    expect(colorHarmony([['red'], ['black'], ['white']])).toBe(1);
  });

  it('scores complementary pairs highest among colored pairs', () => {
    const complementary = colorHarmony([['red'], ['green']]);
    const analogous = colorHarmony([['red'], ['crimson']]);
    const clash = colorHarmony([['red'], ['blue']]);
    expect(complementary).toBeGreaterThan(analogous);
    expect(analogous).toBeGreaterThan(clash);
  });

  it('treats a neutral + color pair as fully harmonious', () => {
    expect(colorHarmony([['black'], ['red']])).toBe(1);
  });

  it('averages across multiple colored items', () => {
    // red+orange (0.8) and red+green via two items... use 3 colored items.
    const v = colorHarmony([['red'], ['orange'], ['green']]);
    expect(v).toBeGreaterThan(0.4);
    expect(v).toBeLessThan(1);
  });

  it('returns 1 for an empty combo', () => {
    expect(colorHarmony([])).toBe(1);
  });
});
