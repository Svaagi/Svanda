import { GLYPH_ROWS } from 'constants/pixel';
import { countFilledPixels } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { BITMAP, CHEVRON_DOWN, CHEVRON_UP, MOON, SUN } from './bitmaps';
import { type Bitmap, DIA, GLYPH, NARROW_G } from './glyphs';
import { bitmapWidth } from './gridLayout';

const FIVE_WIDE = ['V', 'N', 'M', 'W', 'Y'];
const THREE_WIDE = ['I', '1'];
const ONE_WIDE = ['.'];

function expectedWidth(char: string) {
  if (FIVE_WIDE.includes(char)) return 5;
  if (THREE_WIDE.includes(char)) return 3;
  if (ONE_WIDE.includes(char)) return 1;
  return 4;
}

function expectRectangular(bitmap: Bitmap, rows: number) {
  expect(bitmap).toHaveLength(rows);
  bitmap.forEach((row) => {
    expect(row).toMatch(/^[#.]+$/);
    expect(row).toHaveLength(bitmapWidth(bitmap));
  });
}

const sortedChars = (chars: string) => [...chars].sort();

describe('glyph tables', () => {
  it('draws every full-width glyph 5 rows tall at its design width', () => {
    Object.entries(GLYPH).forEach(([char, glyph]) => {
      expectRectangular(glyph, GLYPH_ROWS);
      expect(bitmapWidth(glyph)).toBe(expectedWidth(char));
    });
  });

  it('covers A to Z, digits, the full stop and the ampersand', () => {
    expect(Object.keys(GLYPH).sort()).toEqual(
      sortedChars('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.&'),
    );
  });

  it('draws every narrow glyph 3 wide for A to Z and the ampersand', () => {
    expect(Object.keys(NARROW_G).sort()).toEqual(
      sortedChars('ABCDEFGHIJKLMNOPQRSTUVWXYZ&'),
    );
    Object.values(NARROW_G).forEach((glyph) => {
      expectRectangular(glyph, GLYPH_ROWS);
      expect(bitmapWidth(glyph)).toBe(3);
    });
  });

  it('maps every diacritic to a base letter with both glyph widths', () => {
    Object.values(DIA).forEach((base) => {
      expect(GLYPH[base]).toBeDefined();
      expect(NARROW_G[base]).toBeDefined();
    });
  });

  it('keeps the wordmark 36 x 5 and the icons 5 x 5', () => {
    expectRectangular(BITMAP, GLYPH_ROWS);
    expect(bitmapWidth(BITMAP)).toBe(36);
    [SUN, MOON].forEach((icon) => {
      expectRectangular(icon, GLYPH_ROWS);
      expect(bitmapWidth(icon)).toBe(5);
    });
  });

  it('draws the chevrons as five squares, 5 x 3', () => {
    [CHEVRON_UP, CHEVRON_DOWN].forEach((chevron) => {
      expectRectangular(chevron, 3);
      expect(countFilledPixels(chevron)).toBe(5);
    });
    expect(CHEVRON_DOWN).toEqual([...CHEVRON_UP].reverse());
  });
});
