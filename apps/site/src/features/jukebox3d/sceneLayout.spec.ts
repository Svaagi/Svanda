import { CAMERA_MIN_DISTANCE } from 'constants/jukebox3d';
import { describe, expect, it } from 'vitest';

import { cameraDistance, isPortraitSize, worldUnitsPerPx } from './sceneLayout';

const HALF_FOV_TAN = Math.tan((14 * Math.PI) / 180);

describe('cameraDistance', () => {
  it('stays at the minimum distance on a wide stage', () => {
    expect(cameraDistance({ width: 1620, height: 900 })).toBe(
      CAMERA_MIN_DISTANCE,
    );
  });

  it('backs off on a narrower landscape stage so 1400 units fit across', () => {
    const size = { width: 1024, height: 768 };
    const distance = cameraDistance(size);
    const visibleWidth = 2 * distance * HALF_FOV_TAN * (1024 / 768);

    expect(distance).toBeGreaterThan(CAMERA_MIN_DISTANCE);
    expect(visibleWidth).toBeCloseTo(1400);
  });

  it('fits 600 units across a portrait stage', () => {
    const distance = cameraDistance({ width: 390, height: 844 });

    expect(2 * distance * HALF_FOV_TAN * (390 / 844)).toBeCloseTo(600);
  });

  it('falls back to the minimum distance before the stage is measured', () => {
    expect(cameraDistance({ width: 0, height: 0 })).toBe(CAMERA_MIN_DISTANCE);
  });
});

describe('worldUnitsPerPx', () => {
  it('spans the visible height over the stage height', () => {
    expect(worldUnitsPerPx({ width: 1620, height: 900 })).toBeCloseTo(
      (2 * CAMERA_MIN_DISTANCE * HALF_FOV_TAN) / 900,
    );
  });

  it('is zero for an unmeasured stage', () => {
    expect(worldUnitsPerPx({ width: 0, height: 0 })).toBe(0);
  });
});

describe('isPortraitSize', () => {
  it('is portrait only when taller than wide', () => {
    expect(isPortraitSize({ width: 390, height: 844 })).toBe(true);
    expect(isPortraitSize({ width: 1440, height: 900 })).toBe(false);
    expect(isPortraitSize({ width: 800, height: 800 })).toBe(false);
  });
});
