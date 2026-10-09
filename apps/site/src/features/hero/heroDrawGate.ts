import { HERO_IDLE_FRAME_MS } from 'constants/hero';

import type { HeroFrameInput } from './heroFrame';

export type HeroDrawGate = {
  shouldDraw: (nowMs: number, input: HeroFrameInput) => boolean;
  // Forces the next frame to draw (after a resize).
  invalidate: () => void;
};

const isSameInput = (a: HeroFrameInput, b: HeroFrameInput) =>
  a.vp === b.vp && a.pointer === b.pointer && a.floorShadow === b.floorShadow;

// Decides which animation frames draw. With motion: every frame while anything moved (a
// resting pointer included), otherwise capped to the idle rate for the twinkle. Reduced motion: time
// stands still, so only a change in input draws.
export function createHeroDrawGate(isReducedMotion: boolean): HeroDrawGate {
  let lastInput: HeroFrameInput | null = null;
  let lastDrawMs = Number.NEGATIVE_INFINITY;

  return {
    shouldDraw: (nowMs, input) => {
      const hasChanged = !lastInput || !isSameInput(lastInput, input);
      const isDue = isReducedMotion
        ? hasChanged
        : hasChanged || nowMs - lastDrawMs >= HERO_IDLE_FRAME_MS;
      if (!isDue) return false;
      lastInput = input;
      lastDrawMs = nowMs;
      return true;
    },
    invalidate: () => {
      lastInput = null;
    },
  };
}
