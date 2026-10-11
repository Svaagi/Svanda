import {
  LAVA_BLOB_SEED,
  LAVA_KEYFRAME_TIMES,
  LAVA_SPACE,
} from 'constants/lavaLamp';
import { mulberry32 } from 'lib/random';
import { describe, expect, it } from 'vitest';

import { createLavaBlobs, type LavaBlob, sampleBlobPath } from './lavaBlobs';

const BLOB: LavaBlob = {
  xs: [10, 10, 20, 40, 40, 30, 10, 10],
  ys: [90, 90, 50, 10, 10, 60, 90, 90],
  radiusX: 5,
  radiusY: 4,
  durationMs: 10_000,
  delayMs: 0,
};

const atProgress = (blob: LavaBlob, progress: number) =>
  sampleBlobPath(blob, blob.durationMs * progress);

describe('createLavaBlobs', () => {
  const blobs = createLavaBlobs(mulberry32(LAVA_BLOB_SEED));

  it('makes 40 blobs with a position per keyframe', () => {
    expect(blobs).toHaveLength(40);
    blobs.forEach(({ xs, ys }) => {
      expect(xs).toHaveLength(LAVA_KEYFRAME_TIMES.length);
      expect(ys).toHaveLength(LAVA_KEYFRAME_TIMES.length);
    });
  });

  it('keeps every blob touching the lamp and loops it back to its start', () => {
    blobs.forEach(({ xs, ys, radiusX, durationMs, delayMs }) => {
      xs.forEach((x) => {
        expect(x).toBeGreaterThanOrEqual(-radiusX);
        expect(x).toBeLessThanOrEqual(LAVA_SPACE + radiusX);
      });
      expect(xs.at(-1)).toBe(xs[0]);
      expect(ys.at(-1)).toBe(ys[0]);
      expect(delayMs).toBeLessThanOrEqual(durationMs);
    });
  });

  it('is the same lamp for the same seed', () => {
    expect(createLavaBlobs(mulberry32(LAVA_BLOB_SEED))).toEqual(blobs);
  });
});

describe('sampleBlobPath', () => {
  it('lands on the keyframes', () => {
    expect(atProgress(BLOB, 0)).toEqual({ x: 10, y: 90 });
    expect(atProgress(BLOB, 0.3)).toEqual({ x: 20, y: 50 });
    expect(atProgress(BLOB, 0.52)).toEqual({ x: 40, y: 10 });
  });

  it('moves linearly between keyframes', () => {
    const point = atProgress(BLOB, 0.41);

    expect(point.x).toBeCloseTo(30);
    expect(point.y).toBeCloseTo(30);
  });

  it('writes into a reused point', () => {
    const point = { x: 0, y: 0 };

    expect(sampleBlobPath(BLOB, 3000, point)).toBe(point);
    expect(point).toEqual({ x: 20, y: 50 });
  });

  it('loops, honours the delay and handles negative time', () => {
    expect(sampleBlobPath(BLOB, BLOB.durationMs * 2.3)).toEqual(
      atProgress(BLOB, 0.3),
    );
    expect(sampleBlobPath({ ...BLOB, delayMs: 3000 }, 0)).toEqual(
      atProgress(BLOB, 0.3),
    );
    expect(sampleBlobPath(BLOB, -BLOB.durationMs * 0.7)).toEqual(
      atProgress(BLOB, 0.3),
    );
  });
});
