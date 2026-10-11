import {
  INTRO_CELL_GAP_PX,
  INTRO_DENSITY_MIN,
  INTRO_FLASH_S,
} from 'constants/intro';
import { describe, expect, it, vi } from 'vitest';

import { createIntroLayout } from './introLayout';
import type { IntroPalette } from './introPalette';
import {
  blockSizeAt,
  densityAt,
  drawIntroPixels,
  noiseBlockRect,
  noiseColorIndex,
} from './introPixels';

const PALETTE: IntroPalette = {
  background: 'bg',
  flash: 'flash',
  letters: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'],
  noise: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7'],
};

type Fill = { color: string; alpha: number };

// Records every fill with the colour it was drawn in.
function createRecordingContext() {
  const fills: Fill[] = [];
  const context = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(() => {
      fills.push({ color: context.fillStyle, alpha: context.globalAlpha });
    }),
  };
  return { context: context as unknown as CanvasRenderingContext2D, fills };
}

const isLogoFill = ({ color }: Fill) =>
  color.startsWith('l') || color === 'flash';

describe('blockSizeAt', () => {
  it('resolves from 3 to 2 to single cells', () => {
    expect(blockSizeAt(0)).toBe(3);
    expect(blockSizeAt(0.99)).toBe(3);
    expect(blockSizeAt(1)).toBe(2);
    expect(blockSizeAt(1.69)).toBe(2);
    expect(blockSizeAt(1.7)).toBe(1);
  });
});

describe('densityAt', () => {
  it('stays full, then thins out to a floor', () => {
    expect(densityAt(1.29)).toBe(1);
    expect(densityAt(2)).toBeCloseTo(0.5);
    expect(densityAt(5)).toBe(INTRO_DENSITY_MIN);
  });
});

describe('noiseColorIndex', () => {
  it('gives the whole block one colour', () => {
    expect(noiseColorIndex(3, 3, 0.2, 7)).toBe(noiseColorIndex(5, 5, 0.2, 7));
  });

  it('re-rolls about seven times a second', () => {
    const colors = new Set(
      Array.from({ length: 70 }, (_, frame) =>
        noiseColorIndex(0, 0, frame / 70, 7),
      ),
    );

    expect(colors.size).toBeGreaterThan(1);
    expect(colors.size).toBeLessThanOrEqual(8);
  });

  it('stays within the palette and leaves about half the blocks dark', () => {
    const indices = Array.from({ length: 400 }, (_, col) =>
      noiseColorIndex(col, 0, 2, 7),
    );
    const lit = indices.filter((index) => index !== null);

    lit.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(7);
    });
    expect(lit.length / indices.length).toBeGreaterThan(0.35);
    expect(lit.length / indices.length).toBeLessThan(0.6);
  });
});

describe('noiseBlockRect', () => {
  it('insets a single cell on all sides', () => {
    expect(noiseBlockRect(2, 3, 1, 10)).toEqual({
      x: 20 + INTRO_CELL_GAP_PX,
      y: 30 + INTRO_CELL_GAP_PX,
      width: 10 - 2 * INTRO_CELL_GAP_PX,
      height: 10 - 2 * INTRO_CELL_GAP_PX,
    });
  });

  it('leaves no gap inside a block', () => {
    expect(noiseBlockRect(4, 4, 3, 10)).toEqual({
      x: 40,
      y: 40,
      width: 10,
      height: 10,
    });
    expect(noiseBlockRect(3, 5, 3, 10)).toEqual({
      x: 30 + INTRO_CELL_GAP_PX,
      y: 50,
      width: 10 - INTRO_CELL_GAP_PX,
      height: 10 - INTRO_CELL_GAP_PX,
    });
  });
});

describe('drawIntroPixels', () => {
  const layout = createIntroLayout(400, 300);

  it('draws only noise before any cell locks', () => {
    const { context, fills } = createRecordingContext();

    drawIntroPixels(context, layout, PALETTE, 0.5, false);

    expect(fills.length).toBeGreaterThan(0);
    expect(fills.every(({ color }) => color.startsWith('n'))).toBe(true);
  });

  it('shows every logo cell in a letter colour once all have locked', () => {
    const { context, fills } = createRecordingContext();
    const lastLock = Math.max(...layout.logoCells.map(({ lockS }) => lockS));

    drawIntroPixels(context, layout, PALETTE, lastLock + INTRO_FLASH_S, false);

    expect(fills.filter(isLogoFill)).toHaveLength(layout.logoCells.length);
    expect(fills.some(({ color }) => color === 'flash')).toBe(false);
  });

  it('flashes a logo cell right after it locks', () => {
    const { context, fills } = createRecordingContext();
    const [cell] = layout.logoCells;

    drawIntroPixels(context, layout, PALETTE, (cell?.lockS ?? 0) + 0.01, false);

    expect(fills.some(({ color }) => color === 'flash')).toBe(true);
  });

  it('leaves the logo out of the remnant frame', () => {
    const { context, fills } = createRecordingContext();

    drawIntroPixels(context, layout, PALETTE, 3.2, true);

    expect(fills.filter(isLogoFill)).toHaveLength(0);
  });
});
