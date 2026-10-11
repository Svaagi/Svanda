import { describe, expect, it } from 'vitest';

import { groupCellsByColor, toPixelCells } from './pixelCells';

describe('toPixelCells', () => {
  it('scales grid cells and falls back to the text colour', () => {
    expect(
      toPixelCells([{ col: 2, row: 1, letterIndex: 3 }], 10, 0.5, []),
    ).toEqual([{ left: 20.5, top: 10.5, size: 9, color: 'currentColor' }]);
  });
});

describe('groupCellsByColor', () => {
  it('groups cells by colour in first-seen order', () => {
    const cell = (color: string) => ({ left: 0, top: 0, size: 1, color });
    const groups = groupCellsByColor([cell('b'), cell('a'), cell('b')]);

    expect(groups.map(([color, cells]) => [color, cells.length])).toEqual([
      ['b', 2],
      ['a', 1],
    ]);
  });
});
