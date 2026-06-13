import { describe, it, expect } from 'vitest';
import { normalizeColor, type ColorClass } from '@/lib/engine/colors';

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
