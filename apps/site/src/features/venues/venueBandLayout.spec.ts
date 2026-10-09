import { measureText } from 'lib/pixel';
import { describe, expect, it } from 'vitest';

import { isOnBand, layoutVenueBand, packBandLines } from './venueBandLayout';

const CELL = 14;
const LANDSCAPE = { width: 1120, height: 630 };
const PORTRAIT = { width: 420, height: 525 };

describe('isOnBand', () => {
  it('runs a diagonal band down from the upper left in landscape', () => {
    const size = { width: 1000, height: 562 };

    expect(isOnBand(0, 220, size)).toBe(true);
    expect(isOnBand(100, 332, size)).toBe(true);
    expect(isOnBand(0, 400, size)).toBe(false);
    expect(isOnBand(500, 220, size)).toBe(false);
  });

  it('enters lower left and is thicker in portrait', () => {
    const size = { width: 400, height: 500 };

    expect(isOnBand(0, 272, size)).toBe(true);
    expect(isOnBand(0, 350, size)).toBe(true);
    expect(isOnBand(0, 100, size)).toBe(false);
  });
});

describe('packBandLines', () => {
  it('packs words greedily into lines that fit', () => {
    expect(packBandLines('AB CD EF', 9)).toEqual(['AB', 'CD', 'EF']);
    expect(packBandLines('AB CD EF', 21)).toEqual(['AB CD', 'EF']);
  });

  it('breaks a word wider than the line by letters', () => {
    const lines = packBandLines('Pivnice', 20);

    expect(lines.join('')).toBe('Pivnice');
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach((line) =>
      expect(measureText(line.toUpperCase())).toBeLessThanOrEqual(20),
    );
  });

  it('is empty for no words', () => {
    expect(packBandLines('  ', 20)).toEqual([]);
  });
});

describe('layoutVenueBand', () => {
  it('puts the first word over the rest, lower left, with the label above', () => {
    const layout = layoutVenueBand(LANDSCAPE, CELL, 'Arcade Bar');

    expect(layout).toMatchObject({ cols: 80, rows: 45, textCol: 3 });
    expect(layout.lines).toEqual([
      { text: 'Arcade', row: 22, isPrimary: true },
      { text: 'Bar', row: 28, isPrimary: false },
    ]);
    expect(layout.label).toEqual({ x: 42, y: 126, isVisible: true });
  });

  it('sits low and one column in on a portrait frame', () => {
    const layout = layoutVenueBand(PORTRAIT, CELL, 'Lemon');

    expect(layout.textCol).toBe(1);
    expect(layout.lines).toEqual([{ text: 'Lemon', row: 26, isPrimary: true }]);
    expect(layout.label).toEqual({ x: 14, y: 294, isVisible: true });
  });

  it('wraps a long name within the frame and keeps it above the bottom chevron', () => {
    const layout = layoutVenueBand(PORTRAIT, CELL, 'Kavárna Pod Lampou');
    const maxCols = Math.floor(PORTRAIT.width / CELL) - layout.textCol - 1;
    const lastRow = Math.floor(PORTRAIT.height / CELL) - 5;

    expect(layout.lines.length).toBeGreaterThan(2);
    layout.lines.forEach(({ text }) =>
      expect(measureText(text.toUpperCase())).toBeLessThanOrEqual(maxCols),
    );
    const lastLine = layout.lines[layout.lines.length - 1];
    expect((lastLine?.row ?? 0) + 4).toBeLessThanOrEqual(lastRow);
  });

  it('hides the label when the frame has no room for it above the name', () => {
    const layout = layoutVenueBand({ width: 280, height: 158 }, CELL, 'Bar');

    expect(layout.lines[0]?.row).toBe(2);
    expect(layout.label.isVisible).toBe(false);
  });
});
