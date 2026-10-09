import {
  LAVA_BLOB_SCALE_X,
  LAVA_BLOB_SCALE_Y,
  LAVA_BLUR_RADIUS_RATIO,
  LAVA_GRADIENT_RADIUS_RATIO,
  LAVA_GRADIENT_STOPS,
  LAVA_SPACE,
} from 'constants/lavaLamp';
import type { Rgb } from 'lib/color';
import { FULL_TURN_RAD } from 'lib/math';

import { type LavaBlob, type LavaPoint, sampleBlobPath } from './lavaBlobs';
import type { GooFilter } from './lavaGoo';
import type { LavaPalette } from './lavaPalette';
import { drawTearRows, type TearRow } from './lavaPixelFx';

const CHANNELS = 4;
const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;
const BYTE_MAX = 255;

// What a lamp keeps between frames: the visible low-res canvas, an offscreen one of the same
// size for the blobs, the metaball filter, one gradient per blob (drawn in blob-local
// coordinates, so they never change) and a point the blob paths are sampled into.
export type LavaSurfaces = {
  context: CanvasRenderingContext2D;
  buffer: CanvasRenderingContext2D;
  goo: GooFilter;
  gradients: readonly CanvasGradient[];
  point: LavaPoint;
};

export type LavaFrame = {
  blobs: readonly LavaBlob[];
  palette: LavaPalette;
  blobAlpha: number;
  timeMs: number;
  // Colour step of the pixel design's posterize; null for none.
  posterizeStep: number | null;
  tearRows: readonly TearRow[];
};

const blobRadiusX = (blob: LavaBlob, width: number) =>
  blob.radiusX * (width / LAVA_SPACE) * LAVA_BLOB_SCALE_X;

export function createBlobGradients(
  buffer: CanvasRenderingContext2D,
  blobs: readonly LavaBlob[],
  palette: LavaPalette,
): CanvasGradient[] {
  const { width } = buffer.canvas;
  return blobs.map((blob, i) => {
    const stops = palette.blobStops[i % palette.blobStops.length] ?? [];
    const gradient = buffer.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      blobRadiusX(blob, width) * LAVA_GRADIENT_RADIUS_RATIO,
    );
    LAVA_GRADIENT_STOPS.forEach(({ offset }, stop) => {
      const color = stops[stop];
      if (color) gradient.addColorStop(offset, color);
    });
    return gradient;
  });
}

function drawBlobs(
  { buffer, gradients, point }: LavaSurfaces,
  { blobs, timeMs }: LavaFrame,
) {
  const { width, height } = buffer.canvas;
  const unit = width / LAVA_SPACE;
  buffer.clearRect(0, 0, width, height);
  blobs.forEach((blob, i) => {
    const gradient = gradients[i];
    if (!gradient) return;
    sampleBlobPath(blob, timeMs, point);
    const radiusX = blobRadiusX(blob, width);
    const radiusY = blob.radiusY * unit * LAVA_BLOB_SCALE_Y;
    buffer.setTransform(
      1,
      0,
      0,
      radiusY / radiusX,
      (point.x / LAVA_SPACE) * width,
      (point.y / LAVA_SPACE) * height,
    );
    buffer.fillStyle = gradient;
    buffer.beginPath();
    buffer.arc(0, 0, radiusX, 0, FULL_TURN_RAD);
    buffer.fill();
  });
  buffer.setTransform(1, 0, 0, 1, 0, 0);
}

// Lays the melted blobs over the base colour at `blobAlpha`, in place, and posterizes the
// result when asked: the frame then goes to the canvas in one put.
export function compositeLava(
  pixels: Uint8ClampedArray,
  base: Rgb,
  blobAlpha: number,
  posterizeStep: number | null,
): void {
  const blend = (under: number, over: number, alpha: number) => {
    const mixed = under + (over - under) * alpha;
    return posterizeStep
      ? Math.round(mixed / posterizeStep) * posterizeStep
      : mixed;
  };
  for (let i = 0; i < pixels.length; i += CHANNELS) {
    const alpha = ((pixels[i + ALPHA] ?? 0) / BYTE_MAX) * blobAlpha;
    pixels[i + RED] = blend(base.r, pixels[i + RED] ?? 0, alpha);
    pixels[i + GREEN] = blend(base.g, pixels[i + GREEN] ?? 0, alpha);
    pixels[i + BLUE] = blend(base.b, pixels[i + BLUE] ?? 0, alpha);
    pixels[i + ALPHA] = BYTE_MAX;
  }
}

// One lamp frame: blobs on the buffer, melted into metaballs, laid over the base colour;
// the pixel design posterizes it and tears the given rows.
export function drawLavaFrame(surfaces: LavaSurfaces, frame: LavaFrame): void {
  const { context, buffer, goo } = surfaces;
  const { width, height } = context.canvas;
  drawBlobs(surfaces, frame);

  const pixels = buffer.getImageData(0, 0, width, height);
  goo(
    pixels.data,
    width,
    height,
    Math.max(1, Math.round(width * LAVA_BLUR_RADIUS_RATIO)),
  );
  compositeLava(
    pixels.data,
    frame.palette.base,
    frame.blobAlpha,
    frame.posterizeStep,
  );
  context.putImageData(pixels, 0, 0);

  if (frame.palette.strip && frame.tearRows.length > 0) {
    drawTearRows(context, width, frame.tearRows, frame.palette.strip);
  }
}
