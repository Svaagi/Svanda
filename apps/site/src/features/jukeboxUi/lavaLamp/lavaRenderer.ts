import { LAVA_BLOB_SEED, LAVA_POSTERIZE_STEP } from 'constants/lavaLamp';
import { mulberry32 } from 'lib/random';

import { createLavaBlobs } from './lavaBlobs';
import {
  createBlobGradients,
  drawLavaFrame,
  type LavaFrame,
  type LavaSurfaces,
} from './lavaFrame';
import { createGooFilter } from './lavaGoo';
import { readLavaPalette } from './lavaPalette';
import type { TearRow } from './lavaPixelFx';
import type { LavaLampSettings } from './lavaSettings';

// Seeded, so every visitor sees the same lamp.
const LAVA_BLOBS = createLavaBlobs(mulberry32(LAVA_BLOB_SEED));

export type LavaRenderer = {
  draw: (timeMs: number, tearRows: readonly TearRow[]) => void;
};

// Sizes the canvas to the lamp's low resolution (CSS scales it up), resolves the colours
// against it, builds everything a frame reuses and draws frames on demand. Null when the
// browser has no 2D canvas.
export function createLavaRenderer(
  canvas: HTMLCanvasElement,
  settings: LavaLampSettings,
): LavaRenderer | null {
  const bufferCanvas = document.createElement('canvas');
  canvas.width = settings.columns;
  canvas.height = settings.rows;
  bufferCanvas.width = settings.columns;
  bufferCanvas.height = settings.rows;
  // The buffer is read back every frame for the metaballs.
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const buffer = bufferCanvas.getContext('2d', { willReadFrequently: true });
  if (!context || !buffer) return null;

  const palette = readLavaPalette(canvas, settings.lamp, settings.glitchColor);
  const surfaces: LavaSurfaces = {
    context,
    buffer,
    goo: createGooFilter(),
    gradients: createBlobGradients(buffer, LAVA_BLOBS, palette),
    point: { x: 0, y: 0 },
  };
  const frame: LavaFrame = {
    blobs: LAVA_BLOBS,
    palette,
    blobAlpha: settings.lamp.blobAlpha,
    timeMs: 0,
    posterizeStep: settings.design === 'pixel' ? LAVA_POSTERIZE_STEP : null,
    tearRows: [],
  };

  return {
    draw: (timeMs, tearRows) => {
      frame.timeMs = timeMs;
      frame.tearRows = tearRows;
      drawLavaFrame(surfaces, frame);
    },
  };
}
