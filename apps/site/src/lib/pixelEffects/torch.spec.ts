import { hash3 } from 'lib/random';
import { describe, expect, it } from 'vitest';

import { isTorchCellLit, torchLevel } from './torch';

describe('torchLevel', () => {
  it('is full at the pointer and off at the radius', () => {
    expect(torchLevel(0)).toBe(1);
    expect(torchLevel(240)).toBe(0);
    expect(torchLevel(500)).toBe(0);
  });

  it('only takes four steps and falls off with distance', () => {
    const levels = Array.from({ length: 240 }, (_, distance) =>
      torchLevel(distance),
    );

    expect(new Set(levels)).toEqual(new Set([0.25, 0.5, 0.75, 1]));
    levels.slice(1).forEach((level, i) => {
      expect(level).toBeLessThanOrEqual(levels[i] ?? 1);
    });
  });
});

describe('isTorchCellLit', () => {
  it('lights every cell near the centre', () => {
    for (let col = 0; col < 20; col++) {
      expect(isTorchCellLit(col, 3, 1)).toBe(true);
      expect(isTorchCellLit(col, 3, 0.75)).toBe(true);
    }
  });

  it('dithers the rim by the cell hash', () => {
    const cols = Array.from({ length: 200 }, (_, col) => col);
    const lit = cols.filter((col) => isTorchCellLit(col, 5, 0.25));

    expect(lit.length).toBeGreaterThan(80);
    expect(lit.length).toBeLessThan(160);
    lit.forEach((col) => expect(hash3(col, 5, 21)).toBeLessThanOrEqual(0.6));
  });

  it('never lights an unlit level', () => {
    expect(isTorchCellLit(0, 0, 0)).toBe(false);
  });
});
