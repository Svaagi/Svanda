import { WORDMARK_CELL_MAX_PX, WORDMARK_CELL_MIN_PX } from 'constants/pixel';
import { describe, expect, it } from 'vitest';

import { BITMAP } from './bitmaps';
import { bitmapWidth } from './gridLayout';
import { wordmarkCellPx } from './wordmarkCell';

describe('wordmarkCellPx', () => {
  it('fits the wordmark into the width minus the margin', () => {
    expect(wordmarkCellPx(800)).toBe(
      Math.floor((800 - 40) / bitmapWidth(BITMAP)),
    );
  });

  it('is bounded on tiny and huge screens', () => {
    expect(wordmarkCellPx(320)).toBe(WORDMARK_CELL_MIN_PX);
    expect(wordmarkCellPx(3840)).toBe(WORDMARK_CELL_MAX_PX);
  });
});
