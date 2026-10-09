import { HERO_REDUCED_MOTION_TIME_S } from 'constants/hero';
import { MS_PER_S } from 'constants/time';
import { useStageStore } from 'features/stage';
import { useReducedMotion, useTheme } from 'hooks';
import { bindFrameLoopVisibility, createFrameLoop } from 'lib/frameLoop';
import { type RefObject, useEffect } from 'react';

import { createHeroDrawGate } from './heroDrawGate';
import { readHeroPalette } from './heroPalette';
import { createHeroScene } from './heroScene';

// The hero background's one rAF loop. It reads the stage store each frame instead of
// subscribing, pauses off screen and in hidden tabs, and starts over (with the new token
// colours) when the theme changes.
export function useHeroBackground(
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  const { theme } = useTheme();
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gate = createHeroDrawGate(isReducedMotion);
    const scene = createHeroScene(
      canvas,
      readHeroPalette(document.documentElement),
      gate.invalidate,
    );
    if (!scene) return undefined;

    const loop = createFrameLoop((nowMs) => {
      const { vp, pointer, floorShadow } = useStageStore.getState();
      const input = { vp, pointer, floorShadow };
      if (!gate.shouldDraw(nowMs, input)) return;
      scene.draw(
        input,
        isReducedMotion ? HERO_REDUCED_MOTION_TIME_S : nowMs / MS_PER_S,
      );
    });
    const unbindVisibility = bindFrameLoopVisibility(loop, canvas);

    return () => {
      unbindVisibility();
      loop.stop();
      scene.dispose();
    };
    // `theme` is not read inside: a change re-reads the token colours in readHeroPalette.
  }, [canvasRef, theme, isReducedMotion]);
}
