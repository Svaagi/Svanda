import {
  LAVA_GLITCH_ROWS,
  LAVA_MAX_STEP_MS,
  LAVA_STATIC_GLITCH_ROWS,
  LAVA_STATIC_GLITCH_SEED,
  LAVA_TIME_SCALE,
} from 'constants/lavaLamp';
import { MS_PER_S } from 'constants/time';
import { mulberry32 } from 'lib/random';

import {
  createGlitchSchedule,
  pickTearRows,
  type TearRow,
} from './lavaPixelFx';
import type { LavaRenderer } from './lavaRenderer';
import type { LavaLampSettings } from './lavaSettings';

export type LavaLampRunner = {
  // Lamp time, kept by the caller across pauses and config edits.
  readonly timeMs: number;
  // Called on every tick of the shared loop; draws only at the design's frame rate.
  step: (nowMs: number) => void;
  // One frame that stands still, with a fixed tear when the design glitches.
  drawStill: () => void;
};

const NO_TEAR: readonly TearRow[] = [];

export function createLavaLampRunner(
  renderer: LavaRenderer,
  settings: LavaLampSettings,
  startTimeMs: number,
  random: () => number = Math.random,
): LavaLampRunner {
  const frameMs = MS_PER_S / settings.fps;
  const glitch = createGlitchSchedule(random);
  const speed = LAVA_TIME_SCALE * settings.lamp.speed;
  let timeMs = startTimeMs;
  let lastMs: number | null = null;

  return {
    get timeMs() {
      return timeMs;
    },
    step: (nowMs) => {
      if (lastMs !== null && nowMs - lastMs < frameMs) return;
      // After a pause the lamp moves on by one short step instead of jumping.
      const stepMs =
        lastMs === null ? 0 : Math.min(nowMs - lastMs, LAVA_MAX_STEP_MS);
      lastMs = nowMs;
      timeMs += stepMs * speed;
      const isTearing =
        settings.glitchColor !== null && glitch.isTearing(nowMs);
      renderer.draw(
        timeMs,
        isTearing
          ? pickTearRows(LAVA_GLITCH_ROWS, settings.rows, random)
          : NO_TEAR,
      );
    },
    drawStill: () => {
      const tearRows =
        settings.glitchColor === null
          ? NO_TEAR
          : pickTearRows(
              LAVA_STATIC_GLITCH_ROWS,
              settings.rows,
              mulberry32(LAVA_STATIC_GLITCH_SEED),
            );
      renderer.draw(timeMs, tearRows);
    },
  };
}
