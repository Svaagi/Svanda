import { CURSOR_LIGHTS } from 'constants/jukebox3d';
import { describe, expect, it } from 'vitest';

import {
  cursorLightPosition,
  cursorParallax,
  cursorStrength,
  isPointerSettled,
  physicalPointIntensity,
  smoothPointer,
} from './cursorRig';

const POINTER = { x: 1, y: -1, isActive: true };

describe('smoothPointer', () => {
  it('closes 12 % of the gap per 60 fps frame', () => {
    const next = smoothPointer({ x: 0, y: 0 }, POINTER, 1 / 60);

    expect(next.x).toBeCloseTo(0.12);
    expect(next.y).toBeCloseTo(-0.12);
  });

  it('covers the same ground at 30 fps as in two 60 fps frames', () => {
    const twoFrames = smoothPointer(
      smoothPointer({ x: 0, y: 0 }, POINTER, 1 / 60),
      POINTER,
      1 / 60,
    );

    expect(smoothPointer({ x: 0, y: 0 }, POINTER, 1 / 30).x).toBeCloseTo(
      twoFrames.x,
    );
  });
});

describe('isPointerSettled', () => {
  it('is settled only when the smoothed pointer has caught up', () => {
    expect(isPointerSettled({ x: 1, y: -1 }, POINTER)).toBe(true);
    expect(isPointerSettled({ x: 0.9, y: -1 }, POINTER)).toBe(false);
  });
});

describe('cursorStrength', () => {
  it('needs an active pointer and scales with the hero presence and the rise', () => {
    expect(cursorStrength(POINTER, 1, 1)).toBe(1);
    expect(cursorStrength(POINTER, 0.5, 0.5)).toBe(0.25);
    expect(cursorStrength({ ...POINTER, isActive: false }, 1, 1)).toBe(0);
  });
});

describe('cursorParallax', () => {
  it('turns toward the pointer', () => {
    expect(cursorParallax({ x: 1, y: 1 }, 1)).toEqual({
      tiltX: -0.06,
      yaw: 0.12,
    });
    expect(cursorParallax({ x: 1, y: 1 }, 0)).toEqual({ tiltX: -0, yaw: 0 });
  });
});

describe('cursorLightPosition', () => {
  it('maps the pointer onto the plane in front of the model', () => {
    const target = { x: 0, y: 0, z: 0 };

    expect(
      cursorLightPosition({ x: -1, y: 1 }, CURSOR_LIGHTS.key, target),
    ).toBe(target);
    expect(target).toEqual({ x: -520, y: 350, z: 330 });
  });
});

describe('physicalPointIntensity', () => {
  it('matches the legacy light at the reference distance', () => {
    const spec = CURSOR_LIGHTS.key;
    const { referenceDistance: d, distance, decay } = spec;
    const legacy = spec.legacyIntensity * (1 - d / distance) ** decay;
    const window = (1 - (d / distance) ** 4) ** 2;
    const physical = (physicalPointIntensity(spec) * window) / d ** decay;

    expect(physical).toBeCloseTo(legacy * Math.PI);
  });
});
