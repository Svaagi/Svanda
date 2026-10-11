import { BITMAP } from 'lib/pixel';
import { describe, expect, it, vi } from 'vitest';

import { drawHeroFrame, type HeroFrameInput, markAlphaAt } from './heroFrame';
import { createHeroLayout } from './heroLayout';
import type { HeroPalette } from './heroPalette';

const NAV_HEIGHT_PX = 64;
const MARK_MODULE_COUNT = BITMAP.join('').replaceAll('.', '').length;

const PALETTE: HeroPalette = {
  cellShades: Array.from({ length: 16 }, (_, i) => `cell-${i}`),
  markShades: Array.from({ length: 8 }, (_, gradient) =>
    Array.from({ length: 8 }, (__, lit) => `mark-${gradient}-${lit}`),
  ),
  light: 'light',
  torchAlpha: 0.22,
  shadowAlpha: 0.2,
};

const IDLE: HeroFrameInput = {
  vp: 0,
  pointer: { x: 0, y: 0, isActive: false },
  floorShadow: null,
};

// Records each filled rect with the colour and alpha it was drawn in.
type RecordedFill = { style: string; alpha: number; x: number; y: number };

function createRecordingContext() {
  const fills: RecordedFill[] = [];
  const context = {
    fillStyle: '',
    globalAlpha: 1,
    clearRect: vi.fn(),
    fillRect(x: number, y: number) {
      fills.push({ style: this.fillStyle, alpha: this.globalAlpha, x, y });
    },
  };
  return { context: context as unknown as CanvasRenderingContext2D, fills };
}

const draw = (input: HeroFrameInput, width = 1280, height = 800) => {
  const { context, fills } = createRecordingContext();
  const layout = createHeroLayout(width, height, NAV_HEIGHT_PX);
  drawHeroFrame({ context, layout, palette: PALETTE }, input, 3.5);
  return { context, fills, layout };
};

const fillsIn = (fills: RecordedFill[], style: string) =>
  fills.filter((fill) => fill.style === style);

describe('markAlphaAt', () => {
  it('fades the ghost wordmark out over the first page turn', () => {
    expect(markAlphaAt(0)).toBe(0.95);
    expect(markAlphaAt(0.3125)).toBeCloseTo(0.475);
    expect(markAlphaAt(1 / 1.6)).toBe(0);
    expect(markAlphaAt(3)).toBe(0);
  });
});

describe('drawHeroFrame', () => {
  it('draws twinkle cells and the whole ghost wordmark on the hero', () => {
    const { fills } = draw(IDLE);
    const markFills = fills.filter(({ style }) => style.startsWith('mark'));

    // Every wordmark module, each 2 x 2 grid cells in landscape.
    expect(markFills).toHaveLength(MARK_MODULE_COUNT * 4);
    expect(fills.some(({ style }) => style.startsWith('cell'))).toBe(true);
  });

  it('skips twinkle cells behind the header', () => {
    const { fills, layout } = draw(IDLE);
    const twinkles = fills.filter(({ style }) => style.startsWith('cell'));

    twinkles.forEach(({ y }) => {
      expect(y - 1 + layout.cellPx).toBeGreaterThanOrEqual(NAV_HEIGHT_PX);
    });
  });

  it('drops the wordmark once the page has turned', () => {
    const { fills } = draw({ ...IDLE, vp: 1 });

    expect(fills.some(({ style }) => style.startsWith('mark'))).toBe(false);
  });

  it('lights a stepped torch around the active pointer', () => {
    const { fills } = draw({
      ...IDLE,
      pointer: { x: 0, y: 0, isActive: true },
    });
    const torch = fillsIn(fills, 'light');
    const alphas = new Set(torch.map(({ alpha }) => alpha / 0.22));

    expect(torch.length).toBeGreaterThan(0);
    alphas.forEach((level) => {
      expect([0.25, 0.5, 0.75, 1]).toContainEqual(expect.closeTo(level));
    });
    torch.forEach(({ x, y }) => {
      expect(Math.hypot(x - 640, y - 400)).toBeLessThan(240 + 40);
    });
  });

  it('fills the floor shadow hull cell by cell and nothing without one', () => {
    expect(fillsIn(draw(IDLE).fills, 'light')).toHaveLength(0);

    const { fills, layout } = draw({
      ...IDLE,
      floorShadow: {
        alpha: 1,
        points: [
          { x: 400, y: 600 },
          { x: 800, y: 600 },
          { x: 800, y: 700 },
          { x: 400, y: 700 },
        ],
      },
    });
    const shadow = fillsIn(fills, 'light');
    const area = 400 * 100;
    const cellArea = layout.cellPx ** 2;

    expect(shadow.length).toBeGreaterThan((area / cellArea) * 0.7);
    expect(shadow.length).toBeLessThan((area / cellArea) * 1.5);
    shadow.forEach(({ alpha }) => expect(alpha).toBeCloseTo(0.2));
  });

  it('resets the alpha for whatever draws next', () => {
    const { context } = draw({
      ...IDLE,
      pointer: { x: 0, y: 0, isActive: true },
    });

    expect(context.globalAlpha).toBe(1);
  });
});
