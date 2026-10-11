import { describe, expect, it, vi } from 'vitest';

import { drawVenueBand, type VenueBandFrame } from './venueBandDraw';
import { isOnBand, layoutVenueBand } from './venueBandLayout';

const CELL = 10;
const SIZE = { width: 400, height: 225 };
const palette = {
  text: 'text',
  textMuted: 'muted',
  sparkLight: 'light',
  sparkDark: 'dark',
  torch: 'torch',
  torchOnText: 'torch-on-text',
};

type Fill = { x: number; y: number; style: string; alpha: number };

// Records every filled rectangle with the colour and alpha it was drawn in.
function createRecordingContext() {
  const fills: Fill[] = [];
  const context = {
    fillStyle: '',
    globalAlpha: 1,
    clearRect: vi.fn(),
    fillRect(x: number, y: number) {
      fills.push({ x, y, style: this.fillStyle, alpha: this.globalAlpha });
    },
  };
  return { context: context as unknown as CanvasRenderingContext2D, fills };
}

const frameWith = (overrides: Partial<VenueBandFrame>): VenueBandFrame => ({
  layout: layoutVenueBand(SIZE, CELL, 'Lemon'),
  palette,
  color: 'venue',
  origin: { x: 0, y: 0 },
  torch: null,
  t: 0,
  ...overrides,
});

// The grid cell a fill (inset by one px) belongs to.
const cellOf = ({ x, y }: Fill) => ({
  col: Math.floor(x / CELL),
  row: Math.floor(y / CELL),
});

describe('drawVenueBand', () => {
  it('fills only band cells in the venue colour, then the name over them', () => {
    const { context, fills } = createRecordingContext();
    drawVenueBand(context, frameWith({}));

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 400, 225);
    const bandFills = fills.filter((fill) => fill.style === 'venue');
    expect(bandFills.length).toBeGreaterThan(0);
    bandFills.forEach((fill) => {
      const { col, row } = cellOf(fill);
      expect(isOnBand((col + 0.5) * CELL, (row + 0.5) * CELL, SIZE)).toBe(true);
      expect(fill.alpha).toBeGreaterThanOrEqual(0.3);
      expect(fill.alpha).toBeLessThanOrEqual(0.5);
    });
    const nameFills = fills.filter((fill) => fill.style === 'text');
    expect(nameFills.length).toBeGreaterThan(0);
    nameFills.forEach((fill) => expect(fill.alpha).toBe(1));
    expect(fills.indexOf(nameFills[0] as Fill)).toBeGreaterThan(
      fills.indexOf(bandFills[bandFills.length - 1] as Fill),
    );
  });

  it('draws the second line in the muted colour', () => {
    const { context, fills } = createRecordingContext();
    drawVenueBand(
      context,
      frameWith({ layout: layoutVenueBand(SIZE, CELL, 'Arcade Bar') }),
    );

    expect(fills.some((fill) => fill.style === 'muted')).toBe(true);
  });

  it('lights cells near the pointer with the torch', () => {
    const unlit = createRecordingContext();
    drawVenueBand(unlit.context, frameWith({}));
    const lit = createRecordingContext();
    const nameCell = layoutVenueBand(SIZE, CELL, 'Lemon').lines[0];
    drawVenueBand(
      lit.context,
      frameWith({ torch: { x: 30, y: ((nameCell?.row ?? 0) + 2) * CELL } }),
    );

    expect(unlit.fills.some((fill) => fill.style.startsWith('torch'))).toBe(
      false,
    );
    expect(lit.fills.some((fill) => fill.style === 'torch')).toBe(true);
    expect(lit.fills.some((fill) => fill.style === 'torch-on-text')).toBe(true);
  });

  it('twinkles over time', () => {
    const sparks = (t: number) => {
      const { context, fills } = createRecordingContext();
      drawVenueBand(context, frameWith({ t }));
      return fills
        .filter((fill) => fill.style === 'light' || fill.style === 'dark')
        .map(({ x, y }) => `${x},${y}`)
        .join();
    };

    expect(sparks(1)).not.toBe(sparks(2.3));
  });
});
