import { describe, expect, it } from 'vitest';

import { measureModelSlot, productHeadingCellPx } from './productLayout';

describe('productHeadingCellPx', () => {
  it('spans half the width in landscape, at the smaller heading scale', () => {
    // floor(640 / 34) = 18 px cells, scaled by 0.6.
    expect(productHeadingCellPx({ width: 1280, isPortrait: false })).toBe(11);
  });

  it('spans most of the width in portrait, inside the side margins', () => {
    // min(390 - 48, 390 * 0.85) = 331.5, floor(331.5 / 34) = 9.
    expect(productHeadingCellPx({ width: 390, isPortrait: true })).toBe(9);
  });

  it('never drops below the minimum cell size', () => {
    expect(productHeadingCellPx({ width: 0, isPortrait: true })).toBe(6);
    expect(productHeadingCellPx({ width: 0, isPortrait: false })).toBe(4);
  });
});

describe('measureModelSlot', () => {
  it('returns the band between heading and body, from the stage top', () => {
    expect(
      measureModelSlot(
        { top: 150, bottom: 200 },
        { top: 700, bottom: 780 },
        20,
      ),
    ).toEqual({ top: 180, bottom: 680 });
  });
});
