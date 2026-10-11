import { describe, expect, it } from 'vitest';

import { createHeroLayout } from './heroLayout';

describe('createHeroLayout', () => {
  it('uses a double-size wordmark on a landscape desktop and keeps it on screen', () => {
    const layout = createHeroLayout(1920, 1080);

    expect(layout.isPortrait).toBe(false);
    expect(layout.markScale).toBe(2);
    expect(layout.cellPx).toBe(26);
    expect(36 * 2 * layout.cellPx).toBeLessThanOrEqual(1920 - 16);
    expect(layout.cols * layout.cellPx).toBeGreaterThanOrEqual(1920);
    expect(layout.rows * layout.cellPx).toBeGreaterThanOrEqual(1080);
  });

  it('centres the wordmark horizontally, snapped to whole cells', () => {
    const layout = createHeroLayout(1280, 800);
    const markWidthCells = 36 * layout.markScale;
    const leftGap = layout.markCol;
    const rightGap = layout.cols - layout.markCol - markWidthCells;

    expect(Number.isInteger(layout.markCol)).toBe(true);
    expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(2);
  });

  it('sits the landscape wordmark slightly below centre', () => {
    const layout = createHeroLayout(1280, 800);
    const markCentreY =
      (layout.markRow + (5 * layout.markScale) / 2) * layout.cellPx;

    expect(markCentreY).toBeGreaterThan(400);
    expect(markCentreY).toBeLessThan(400 + 20 + layout.cellPx);
  });

  it('uses single-size modules on a portrait phone, filling the width', () => {
    const layout = createHeroLayout(390, 844);

    expect(layout.isPortrait).toBe(true);
    expect(layout.markScale).toBe(1);
    expect(layout.cellPx).toBe(10);
    expect(layout.markRow * layout.cellPx).toBeLessThan(844 * 0.4);
  });

  it('never goes below the minimum cell size', () => {
    expect(createHeroLayout(200, 150).cellPx).toBeGreaterThanOrEqual(4);
    expect(createHeroLayout(150, 400).cellPx).toBe(6);
  });
});
