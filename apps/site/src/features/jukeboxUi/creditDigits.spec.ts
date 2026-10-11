import { describe, expect, it } from 'vitest';

import { creditDigits } from './creditDigits';

const CELLS_PER_DIGIT = 20;

const litCount = (cells: boolean[]) => cells.filter(Boolean).length;

describe('creditDigits', () => {
  it('lays out one 4 x 5 grid per digit', () => {
    const digits = creditDigits(120);

    expect(digits.map(({ digit }) => digit)).toEqual(['1', '2', '0']);
    digits.forEach(({ cells }) => {
      expect(cells).toHaveLength(CELLS_PER_DIGIT);
    });
  });

  it('lights the cells of the digit bitmap, row by row', () => {
    const [one] = creditDigits(1);

    // .#.. / ##.. / .#.. / .#.. / ###.
    expect(one?.cells.slice(0, 8)).toEqual([
      false,
      true,
      false,
      false,
      true,
      true,
      false,
      false,
    ]);
    expect(litCount(one?.cells ?? [])).toBe(8);
  });

  it('shows whole, non-negative amounts', () => {
    expect(creditDigits(40.9).map(({ digit }) => digit)).toEqual(['4', '0']);
    expect(creditDigits(-5).map(({ digit }) => digit)).toEqual(['0']);
  });
});
