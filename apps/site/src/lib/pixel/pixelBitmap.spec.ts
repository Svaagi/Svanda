import { describe, expect, it } from 'vitest';

import { BITMAP, SUN } from './bitmaps';
import { pixelBitmap } from './pixelBitmap';

describe('pixelBitmap', () => {
  it('sizes the wordmark from its 36 x 5 modules', () => {
    const layout = pixelBitmap(BITMAP, 5, 0.5, ['a']);

    expect(layout.width).toBe(180);
    expect(layout.height).toBe(25);
    expect(layout.cells[0]).toEqual({
      left: 5 + 0.5,
      top: 0.5,
      size: 4,
      color: 'a',
    });
  });

  it('colours each wordmark letter in turn', () => {
    const layout = pixelBitmap(BITMAP, 1, 0, ['1', '2', '3', '4', '5', '6']);
    const colorAt = (left: number) =>
      layout.cells.find((cell) => cell.left === left)?.color;

    expect(colorAt(0)).toBe('1');
    expect(colorAt(6)).toBe('2');
    expect(colorAt(32)).toBe('6');
  });

  it('draws full cells without an inset', () => {
    expect(pixelBitmap(SUN, 3, 0, ['a']).cells[1]).toEqual({
      left: 6,
      top: 0,
      size: 3,
      color: 'a',
    });
  });
});
