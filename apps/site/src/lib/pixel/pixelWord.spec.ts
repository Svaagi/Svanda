import { describe, expect, it } from 'vitest';

import { pixelWord } from './pixelWord';

describe('pixelWord', () => {
  it('sizes the word in cells and insets each square by one pixel', () => {
    const layout = pixelWord('svanda', 10, ['a']);

    expect(layout.width).toBe(31 * 10);
    expect(layout.height).toBe(5 * 10);
    expect(layout.cells[0]).toEqual({ left: 11, top: 1, size: 8, color: 'a' });
  });

  it('cycles colours per letter', () => {
    const layout = pixelWord('II', 4, ['a', 'b']);
    const colorAt = (left: number) =>
      layout.cells.find((cell) => cell.left === left)?.color;

    expect(colorAt(1)).toBe('a');
    expect(colorAt(4 * 4 + 1)).toBe('b');
  });

  it('draws diacritics with their base letter', () => {
    expect(pixelWord('Č', 4, ['a'])).toEqual(pixelWord('C', 4, ['a']));
  });

  it('has no width when empty', () => {
    expect(pixelWord('', 4, ['a'])).toEqual({
      cells: [],
      width: 0,
      height: 20,
    });
  });
});
