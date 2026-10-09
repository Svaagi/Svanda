import {
  LAVA_DRIFT_X,
  LAVA_EDGE_MARGIN,
  LAVA_FALL_JITTER_X,
  LAVA_FALL_Y,
  LAVA_KEYFRAME_TIMES,
  LAVA_REST_Y,
  LAVA_RISE_DRIFT_RATIO,
  LAVA_RISE_Y,
  LAVA_SPACE,
  LAVA_TIERS,
  LAVA_TOP_Y_MIN_RANGE,
  LAVA_TOP_Y_PAD,
  type LavaTier,
} from 'constants/lavaLamp';
import { MS_PER_S } from 'constants/time';
import { clamp, HALF, lerp } from 'lib/math';

// One blob: keyframe positions in lamp space (one per LAVA_KEYFRAME_TIMES entry), its
// radii, and when in its loop it starts.
export type LavaBlob = {
  xs: readonly number[];
  ys: readonly number[];
  radiusX: number;
  radiusY: number;
  durationMs: number;
  delayMs: number;
};

export type LavaPoint = { x: number; y: number };

type Random = () => number;

const between = (random: Random, [min, max]: readonly [number, number]) =>
  lerp(min, max, random());

function createBlob(random: Random, tier: LavaTier): LavaBlob {
  const radiusX = Math.round(between(random, tier.radiusX));
  const radiusY = Math.round(between(random, tier.radiusY));
  // A blob may hang over the side, but never leave the lamp.
  const xRange = [
    -radiusX + LAVA_EDGE_MARGIN,
    LAVA_SPACE + radiusX - LAVA_EDGE_MARGIN,
  ] as const;
  const inX = (x: number) => clamp(x, xRange[0], xRange[1]);

  const startX = between(random, xRange);
  const driftX = between(random, [-LAVA_DRIFT_X, LAVA_DRIFT_X]);
  const topX = inX(startX + driftX);
  const fallX = inX(
    (topX + startX) * HALF +
      between(random, [-LAVA_FALL_JITTER_X, LAVA_FALL_JITTER_X]),
  );
  const riseX = inX(startX + driftX * LAVA_RISE_DRIFT_RATIO);
  const restY = between(random, [
    LAVA_REST_Y[0],
    Math.min(LAVA_REST_Y[1], LAVA_SPACE + radiusY - LAVA_EDGE_MARGIN),
  ]);
  const topY = between(random, [
    Math.max(-radiusY + LAVA_EDGE_MARGIN, 0),
    Math.max(radiusY + LAVA_TOP_Y_PAD, LAVA_TOP_Y_MIN_RANGE),
  ]);
  const riseY = between(random, LAVA_RISE_Y);
  const fallY = between(random, LAVA_FALL_Y);
  const durationS = Math.round(between(random, tier.durationS));

  return {
    xs: [startX, startX, riseX, topX, topX, fallX, startX, startX],
    ys: [restY, restY, riseY, topY, topY, fallY, restY, restY],
    radiusX,
    radiusY,
    durationMs: durationS * MS_PER_S,
    delayMs: Math.round(between(random, [0, durationS])) * MS_PER_S,
  };
}

export function createLavaBlobs(random: Random): LavaBlob[] {
  return LAVA_TIERS.flatMap((tier) =>
    Array.from({ length: tier.count }, () => createBlob(random, tier)),
  );
}

// The keyframe segment a 0..1 loop progress falls in (its start index).
function segmentAt(progress: number): number {
  for (let i = 1; i < LAVA_KEYFRAME_TIMES.length; i++) {
    if (progress <= (LAVA_KEYFRAME_TIMES[i] ?? 1)) return i - 1;
  }
  return 0;
}

// Where a blob is at lamp time `timeMs`: linear between the keyframes of its loop. Written
// into `out` (and returned), since the lamp samples every blob every frame.
export function sampleBlobPath(
  blob: LavaBlob,
  timeMs: number,
  out: LavaPoint = { x: 0, y: 0 },
): LavaPoint {
  const { xs, ys, durationMs, delayMs } = blob;
  const cycle = (timeMs + delayMs) % durationMs;
  const progress = (cycle < 0 ? cycle + durationMs : cycle) / durationMs;
  const from = segmentAt(progress);
  const fromTime = LAVA_KEYFRAME_TIMES[from] ?? 0;
  const toTime = LAVA_KEYFRAME_TIMES[from + 1] ?? 1;
  const ratio = (progress - fromTime) / (toTime - fromTime || 1);
  out.x = lerp(xs[from] ?? 0, xs[from + 1] ?? 0, ratio);
  out.y = lerp(ys[from] ?? 0, ys[from + 1] ?? 0, ratio);
  return out;
}
