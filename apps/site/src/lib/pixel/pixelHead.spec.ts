import { describe, expect, it } from 'vitest';

import { measureText } from './gridLayout';
import { pixelHead } from './pixelHead';

const VENUES_TAG = 'Pobočky & akce';
const FULL_WIDTH_COLS = 64;
const NARROW_WIDTH_COLS = 51;

describe('pixelHead', () => {
  it('keeps full-width letters on one line when the heading fits', () => {
    const layout = pixelHead(VENUES_TAG, 2, FULL_WIDTH_COLS, ['a']);

    expect(measureText('POBOCKY & AKCE')).toBe(FULL_WIDTH_COLS);
    expect(layout.width).toBe(FULL_WIDTH_COLS * 2);
    expect(layout.height).toBe(5 * 2);
  });

  it('falls back to narrow letters before wrapping', () => {
    const layout = pixelHead(VENUES_TAG, 2, FULL_WIDTH_COLS - 1, ['a']);

    expect(layout.width).toBe(NARROW_WIDTH_COLS * 2);
    expect(layout.height).toBe(5 * 2);
  });

  it('wraps narrow lines by word and centres them', () => {
    const layout = pixelHead(VENUES_TAG, 1, 30, ['a']);
    const secondLine = layout.cells.filter(({ top }) => top > 7);

    expect(layout.width).toBe(measureText('POBOCKY', true));
    expect(layout.height).toBe(2 * 7 - 2);
    expect(Math.min(...secondLine.map(({ left }) => left))).toBe(3 + 1);
  });

  it('lets a single word wider than the limit overflow', () => {
    const layout = pixelHead('KARAOKE', 1, 10, ['a']);

    expect(layout.width).toBe(measureText('KARAOKE', true));
    expect(layout.height).toBe(5);
  });

  it('renders nothing for blank text', () => {
    expect(pixelHead('  ', 4, 10, ['a'])).toEqual({
      cells: [],
      width: 0,
      height: 0,
    });
  });
});
