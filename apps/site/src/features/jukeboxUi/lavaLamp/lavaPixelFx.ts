import {
  LAVA_GLITCH_DURATION_MS,
  LAVA_GLITCH_FIRST_MS,
  LAVA_GLITCH_GAP_MS,
  LAVA_TEAR_MAX_HEIGHT,
  LAVA_TEAR_MAX_SHIFT,
  LAVA_TEAR_STRIP_CHANCE,
} from 'constants/lavaLamp';
import { lerp } from 'lib/math';

type Random = () => number;

export type GlitchSchedule = {
  // Whether rows tear at `nowMs`; times must not go backwards.
  isTearing: (nowMs: number) => boolean;
};

// Short tearing bursts at random gaps. The first burst comes a while after the first call.
export function createGlitchSchedule(random: Random): GlitchSchedule {
  let nextStartMs: number | null = null;
  let tearUntilMs = 0;

  return {
    isTearing: (nowMs) => {
      nextStartMs ??= nowMs + LAVA_GLITCH_FIRST_MS;
      if (nowMs >= nextStartMs) {
        tearUntilMs = nowMs + lerp(...LAVA_GLITCH_DURATION_MS, random());
        nextStartMs = nowMs + lerp(...LAVA_GLITCH_GAP_MS, random());
      }
      return nowMs < tearUntilMs;
    },
  };
}

export type TearRow = {
  y: number;
  height: number;
  // Signed horizontal shift in canvas pixels.
  shift: number;
  hasStrip: boolean;
};

const randomInt = (random: Random, max: number) => Math.floor(random() * max);

// Which rows tear and how: a band of 1-3 rows shifted 1-4 px, sometimes with a colour strip
// in the gap it leaves.
export function pickTearRows(
  count: number,
  canvasHeight: number,
  random: Random,
): TearRow[] {
  return Array.from({ length: count }, () => {
    const y = randomInt(random, canvasHeight);
    const height = 1 + randomInt(random, LAVA_TEAR_MAX_HEIGHT);
    const direction = random() < LAVA_TEAR_STRIP_CHANCE ? -1 : 1;
    const shift = direction * (1 + randomInt(random, LAVA_TEAR_MAX_SHIFT));
    return { y, height, shift, hasStrip: random() < LAVA_TEAR_STRIP_CHANCE };
  });
}

export function drawTearRows(
  context: CanvasRenderingContext2D,
  width: number,
  rows: readonly TearRow[],
  stripColor: string,
): void {
  rows.forEach(({ y, height, shift, hasStrip }) => {
    context.putImageData(context.getImageData(0, y, width, height), shift, y);
    if (!hasStrip) return;
    context.fillStyle = stripColor;
    context.fillRect(
      shift > 0 ? 0 : width + shift,
      y,
      Math.abs(shift) + 1,
      height,
    );
  });
}
