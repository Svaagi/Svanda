import {
  INTRO_LOCK_SPREAD_S,
  INTRO_LOCK_START_S,
  INTRO_NOISE_LOCK_DELAY_S,
} from 'constants/intro';
import { WORDMARK_CELL_MAX_PX } from 'constants/pixel';
import { BITMAP } from 'lib/pixel';
import { countFilledPixels } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { createIntroLayout, LOGO_COLS } from './introLayout';

describe('createIntroLayout', () => {
  it('covers the viewport with whole cells', () => {
    const layout = createIntroLayout(1440, 900);

    expect(layout.cellPx).toBe(WORDMARK_CELL_MAX_PX);
    expect(layout.cells).toHaveLength(
      Math.ceil(1440 / layout.cellPx) * Math.ceil(900 / layout.cellPx),
    );
  });

  it('centres one cell per wordmark module, in bitmap order', () => {
    const layout = createIntroLayout(1440, 900);
    const [first] = layout.logoCells;

    expect(layout.logoCells).toHaveLength(countFilledPixels(BITMAP));
    expect(first?.logo).toEqual({ col: 1, row: 0, letterIndex: 0 });
    expect(first?.col).toBe(Math.floor((60 - LOGO_COLS) / 2) + 1);
    expect(first?.row).toBe(Math.floor((38 - BITMAP.length) / 2));
  });

  it('is deterministic for a viewport', () => {
    expect(createIntroLayout(375, 667)).toEqual(createIntroLayout(375, 667));
  });

  it('locks noise cells later than logo cells', () => {
    const { cells } = createIntroLayout(800, 600);

    cells.forEach(({ logo, lockS }) => {
      const start = INTRO_LOCK_START_S + (logo ? 0 : INTRO_NOISE_LOCK_DELAY_S);
      expect(lockS).toBeGreaterThanOrEqual(start);
      expect(lockS).toBeLessThan(start + INTRO_LOCK_SPREAD_S);
    });
  });
});
