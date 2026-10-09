import { useReducedMotion } from 'hooks';
import { bindFrameLoopVisibility, createFrameLoop } from 'lib/frameLoop';
import { type RefObject, useEffect, useRef } from 'react';

import { createLavaLampRunner, type LavaLampRunner } from './lavaLampRunner';
import { createLavaRenderer } from './lavaRenderer';
import type { LavaLampSettings } from './lavaSettings';

export type LavaLampSlot = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  settings: LavaLampSettings;
  // A lamp nobody can see (clipped away) draws nothing.
  isHidden: boolean;
};

type IndexedRunner = { index: number; runner: LavaLampRunner };

function createRunners(
  lamps: readonly LavaLampSlot[],
  lampTimes: number[],
): IndexedRunner[] {
  return lamps.flatMap(({ canvasRef, settings, isHidden }, index) => {
    const canvas = canvasRef.current;
    if (isHidden || !canvas) return [];
    const renderer = createLavaRenderer(canvas, settings);
    if (!renderer) return [];
    const runner = createLavaLampRunner(
      renderer,
      settings,
      lampTimes[index] ?? 0,
    );
    return [{ index, runner }];
  });
}

// One rAF loop for every lamp of a scene, each drawn at its own frame rate. The loop runs
// only while the scene (`rootRef`) is on screen in a visible tab and not paused; with
// reduced motion or a lamp's `animate` off, that lamp draws one still frame. Lamp times
// survive pauses and config edits. `lamps` must be memoized: a new array starts over.
export function useLavaLamps(
  rootRef: RefObject<HTMLElement | null>,
  lamps: readonly LavaLampSlot[],
  isPaused: boolean,
) {
  const isReducedMotion = useReducedMotion();
  const lampTimesRef = useRef<number[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || isPaused) return undefined;
    const lampTimes = lampTimesRef.current;
    const runners = createRunners(lamps, lampTimes);
    const isMoving = ({ index }: IndexedRunner) =>
      !isReducedMotion && (lamps[index]?.settings.lamp.animate ?? false);
    runners
      .filter((entry) => !isMoving(entry))
      .forEach(({ runner }) => runner.drawStill());
    const moving = runners.filter(isMoving);
    if (moving.length === 0) return undefined;

    const loop = createFrameLoop((nowMs) =>
      moving.forEach(({ runner }) => runner.step(nowMs)),
    );
    const unbindVisibility = bindFrameLoopVisibility(loop, root);

    return () => {
      unbindVisibility();
      loop.stop();
      moving.forEach(({ index, runner }) => {
        lampTimes[index] = runner.timeMs;
      });
    };
  }, [rootRef, lamps, isPaused, isReducedMotion]);
}
