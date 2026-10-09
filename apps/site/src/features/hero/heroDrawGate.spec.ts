import { describe, expect, it } from 'vitest';

import { createHeroDrawGate } from './heroDrawGate';
import type { HeroFrameInput } from './heroFrame';

const IDLE_POINTER = { x: 0, y: 0, isActive: false };
const ACTIVE_POINTER = { x: 0.2, y: 0.1, isActive: true };
const FRAME_MS = 16;

const idleInput: HeroFrameInput = {
  vp: 0,
  pointer: IDLE_POINTER,
  floorShadow: null,
};

// Frames drawn over one second of 60 fps animation frames.
const drawnFramesPerSecond = (
  isReducedMotion: boolean,
  inputAt: (frame: number) => HeroFrameInput,
) => {
  const gate = createHeroDrawGate(isReducedMotion);
  let drawn = 0;
  for (let frame = 0; frame < 60; frame++) {
    if (gate.shouldDraw(frame * FRAME_MS, inputAt(frame))) drawn += 1;
  }
  return drawn;
};

describe('createHeroDrawGate', () => {
  it('caps an idle stage to about 20 fps', () => {
    const drawn = drawnFramesPerSecond(false, () => idleInput);

    expect(drawn).toBeGreaterThanOrEqual(15);
    expect(drawn).toBeLessThanOrEqual(21);
  });

  it('keeps the idle cap while the pointer rests over the stage', () => {
    const restingInput = { ...idleInput, pointer: ACTIVE_POINTER };
    const drawn = drawnFramesPerSecond(false, () => restingInput);

    expect(drawn).toBeGreaterThanOrEqual(15);
    expect(drawn).toBeLessThanOrEqual(21);
  });

  it('draws every frame while the pointer moves or the page turns', () => {
    expect(
      drawnFramesPerSecond(false, (frame) => ({
        ...idleInput,
        pointer: { ...ACTIVE_POINTER, x: frame / 60 },
      })),
    ).toBe(60);
    expect(
      drawnFramesPerSecond(false, (frame) => ({
        ...idleInput,
        vp: frame / 60,
      })),
    ).toBe(60);
  });

  it('draws only on change with reduced motion', () => {
    expect(drawnFramesPerSecond(true, () => idleInput)).toBe(1);
    expect(
      drawnFramesPerSecond(true, (frame) => ({
        ...idleInput,
        vp: frame < 30 ? 0 : 1,
      })),
    ).toBe(2);
  });

  it('draws again after an invalidate', () => {
    const gate = createHeroDrawGate(true);

    expect(gate.shouldDraw(0, idleInput)).toBe(true);
    expect(gate.shouldDraw(FRAME_MS, idleInput)).toBe(false);
    gate.invalidate();
    expect(gate.shouldDraw(FRAME_MS * 2, idleInput)).toBe(true);
  });
});
