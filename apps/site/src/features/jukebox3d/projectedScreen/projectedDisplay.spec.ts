import { PROJECTED_CUSTOM_VP_RANGE } from 'constants/jukebox3d';
import type { ScreenQuad } from 'features/stage';
import { describe, expect, it } from 'vitest';

import {
  isFrontFacing,
  isProjectedInteractive,
  projectedMode,
  projectedPlacement,
  projectedVisibility,
} from './projectedDisplay';

// The display box at half size, shifted: an affine placement.
const QUAD: ScreenQuad = {
  topLeft: { x: 100, y: 50 },
  topRight: { x: 370, y: 50 },
  bottomRight: { x: 370, y: 530 },
  bottomLeft: { x: 100, y: 530 },
};

// Seen from behind, the corners swap sides.
const BACK_QUAD: ScreenQuad = {
  topLeft: QUAD.topRight,
  topRight: QUAD.topLeft,
  bottomRight: QUAD.bottomLeft,
  bottomLeft: QUAD.bottomRight,
};

describe('projectedMode', () => {
  it('sings on the karaoke page and listens from halfway to the jukebox page', () => {
    expect(projectedMode(0.8)).toBe('sing');
    expect(projectedMode(1.49)).toBe('sing');
    expect(projectedMode(1.5)).toBe('listen');
    expect(projectedMode(2.2)).toBe('listen');
  });
});

// Three corners on one line: nothing to warp the box onto.
const COLLAPSED_QUAD: ScreenQuad = {
  ...QUAD,
  bottomLeft: { x: 370, y: 290 },
};

describe('isFrontFacing', () => {
  it('tells the display front from its back', () => {
    expect(isFrontFacing(QUAD)).toBe(true);
    expect(isFrontFacing(BACK_QUAD)).toBe(false);
  });

  it('rejects a collapsed or twisted quad', () => {
    expect(isFrontFacing(COLLAPSED_QUAD)).toBe(false);
    expect(
      isFrontFacing({
        ...QUAD,
        bottomRight: QUAD.bottomLeft,
        bottomLeft: QUAD.bottomRight,
      }),
    ).toBe(false);
  });
});

describe('projectedVisibility', () => {
  it('is shown from vp 1 to 2 and fades over 0.2 on either side', () => {
    expect(projectedVisibility(0.8, QUAD)).toBe(0);
    expect(projectedVisibility(0.9, QUAD)).toBeCloseTo(0.5);
    expect(projectedVisibility(1, QUAD)).toBeCloseTo(1);
    expect(projectedVisibility(1.5, QUAD)).toBe(1);
    expect(projectedVisibility(2, QUAD)).toBeCloseTo(1);
    expect(projectedVisibility(2.1, QUAD)).toBeCloseTo(0.5);
    expect(projectedVisibility(2.2, QUAD)).toBe(0);
    expect(projectedVisibility(0, QUAD)).toBe(0);
    expect(projectedVisibility(3, QUAD)).toBe(0);
  });

  it('is shown only on the custom page with the custom range', () => {
    expect(projectedVisibility(1.5, QUAD, PROJECTED_CUSTOM_VP_RANGE)).toBe(0);
    expect(projectedVisibility(2.8, QUAD, PROJECTED_CUSTOM_VP_RANGE)).toBe(0);
    expect(
      projectedVisibility(2.9, QUAD, PROJECTED_CUSTOM_VP_RANGE),
    ).toBeCloseTo(0.5);
    expect(projectedVisibility(3, QUAD, PROJECTED_CUSTOM_VP_RANGE)).toBe(1);
    expect(projectedVisibility(3.2, QUAD, PROJECTED_CUSTOM_VP_RANGE)).toBe(0);
  });

  it('is hidden without a display or while the display faces away', () => {
    expect(projectedVisibility(1.5, null)).toBe(0);
    expect(projectedVisibility(1.5, BACK_QUAD)).toBe(0);
  });

  it('is hidden, and so never interactive, on a degenerate quad', () => {
    const visibility = projectedVisibility(1.5, COLLAPSED_QUAD);

    expect(visibility).toBe(0);
    expect(isProjectedInteractive(visibility)).toBe(false);
  });
});

describe('isProjectedInteractive', () => {
  it('takes input only above 0.9 visibility', () => {
    expect(isProjectedInteractive(0)).toBe(false);
    expect(isProjectedInteractive(0.9)).toBe(false);
    expect(isProjectedInteractive(0.91)).toBe(true);
    expect(isProjectedInteractive(1)).toBe(true);
  });
});

describe('projectedPlacement', () => {
  it('warps the 540x960 box onto the quad', () => {
    expect(projectedPlacement(1.5, QUAD)).toEqual({
      opacity: 1,
      transform: 'matrix3d(0.5,0,0,0,0,0.5,0,0,0,0,1,0,100,50,0,1)',
    });
  });

  it('fades with the visibility', () => {
    expect(projectedPlacement(0.9, QUAD).opacity).toBeCloseTo(0.5);
  });

  it('places nothing while hidden or on a degenerate quad', () => {
    const hidden = { opacity: 0, transform: null };

    expect(projectedPlacement(0, QUAD)).toEqual(hidden);
    expect(projectedPlacement(1.5, null)).toEqual(hidden);
    expect(projectedPlacement(1.5, COLLAPSED_QUAD)).toEqual(hidden);
    expect(projectedPlacement(1.5, QUAD, PROJECTED_CUSTOM_VP_RANGE)).toEqual(
      hidden,
    );
  });
});
