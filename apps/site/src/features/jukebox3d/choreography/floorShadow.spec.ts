import { describe, expect, it } from 'vitest';

import {
  floorShadowAlpha,
  floorShadowHull,
  footprintCorners,
  isSameFloorShadow,
  type ProjectToStage,
} from './floorShadow';

// Looking straight down onto the floor: world x to the right, z towards the viewer is down
// the screen, 1 px per unit around a 500, 400 centre.
const TOP_DOWN: ProjectToStage = ({ x, z }) => ({ x: 500 + x, y: 400 + z });

describe('footprintCorners', () => {
  it('returns the four corners of the cabinet base', () => {
    const corners = footprintCorners();

    expect(corners).toHaveLength(4);
    expect(new Set(corners.map(({ y }) => y))).toEqual(new Set([-241.6]));
    expect(corners.map(({ x }) => x).sort()).toEqual([-122, -122, 122, 122]);
  });
});

describe('floorShadowHull', () => {
  it('hulls the footprint and its copy pushed away from the light', () => {
    const square = [
      { x: -50, y: 0, z: -50 },
      { x: 50, y: 0, z: -50 },
      { x: 50, y: 0, z: 50 },
      { x: -50, y: 0, z: 50 },
    ];
    // Offset: 16 % of the 100 unit span sideways, 70 % of that in depth.
    const hull = floorShadowHull(square, TOP_DOWN);

    expect(hull).toHaveLength(6);
    expect(hull).toEqual(
      expect.arrayContaining([
        { x: 450, y: 350 },
        { x: 566, y: 361.2 },
        { x: 566, y: 461.2 },
        { x: 450, y: 450 },
      ]),
    );
  });

  it('rounds the projected points to tenths of a px', () => {
    const hull = floorShadowHull(
      [
        { x: 0.123, y: 0, z: 0 },
        { x: 10.456, y: 0, z: 0 },
        { x: 0, y: 0, z: 10.789 },
      ],
      TOP_DOWN,
    );

    for (const { x, y } of hull) {
      expect(Math.round(x * 10) / 10).toBe(x);
      expect(Math.round(y * 10) / 10).toBe(y);
    }
  });
});

describe('floorShadowAlpha', () => {
  it('follows the rise without the overshoot', () => {
    expect(floorShadowAlpha(0)).toBeCloseTo(0);
    expect(floorShadowAlpha(0.8)).toBe(1);
    expect(floorShadowAlpha(1)).toBe(1);
  });
});

describe('isSameFloorShadow', () => {
  const shadow = { points: [{ x: 1, y: 2 }], alpha: 1 };

  it('compares by value', () => {
    expect(
      isSameFloorShadow(shadow, { points: [{ x: 1, y: 2 }], alpha: 1 }),
    ).toBe(true);
    expect(isSameFloorShadow(shadow, { ...shadow, alpha: 0.5 })).toBe(false);
    expect(
      isSameFloorShadow(shadow, { points: [{ x: 1, y: 3 }], alpha: 1 }),
    ).toBe(false);
    expect(isSameFloorShadow(shadow, null)).toBe(false);
    expect(isSameFloorShadow(null, null)).toBe(true);
  });
});
