import {
  LAVA_BLUR_PASSES,
  LAVA_THRESHOLD_GAIN,
  LAVA_THRESHOLD_OFFSET,
} from 'constants/lavaLamp';
import { clamp } from 'lib/math';

const CHANNELS = 4;
const ALPHA = 3;
const BYTE_MAX = 255;
const EMPTY_ALPHA = 0.0001;

export type GooFilter = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
) => void;

// One box blur pass along a line of `length` samples `stride` apart, from `source` into
// `target`; samples past the edge are left out of the average.
function blurLine(
  source: Float32Array,
  target: Float32Array,
  start: number,
  stride: number,
  length: number,
  radius: number,
) {
  for (let channel = 0; channel < CHANNELS; channel++) {
    for (let i = 0; i < length; i++) {
      let sum = 0;
      let count = 0;
      const from = Math.max(0, i - radius);
      const to = Math.min(length - 1, i + radius);
      for (let k = from; k <= to; k++) {
        sum += source[(start + k * stride) * CHANNELS + channel] ?? 0;
        count++;
      }
      target[(start + i * stride) * CHANNELS + channel] = sum / count;
    }
  }
}

// Metaballs in place on RGBA pixels: premultiply, a separable box blur (two passes come
// close to a gaussian), then sharpen the alpha with the app's threshold a * 60 - 22.
// The scratch buffers are kept between calls, since the lamp filters every frame.
export function createGooFilter(): GooFilter {
  let buffer = new Float32Array(0);
  let scratch = new Float32Array(0);

  return (pixels, width, height, radius) => {
    if (buffer.length !== pixels.length) {
      buffer = new Float32Array(pixels.length);
      scratch = new Float32Array(pixels.length);
    }
    for (let i = 0; i < pixels.length; i += CHANNELS) {
      const alpha = (pixels[i + ALPHA] ?? 0) / BYTE_MAX;
      for (let channel = 0; channel < ALPHA; channel++) {
        buffer[i + channel] = (pixels[i + channel] ?? 0) * alpha;
      }
      buffer[i + ALPHA] = alpha;
    }
    for (let pass = 0; pass < LAVA_BLUR_PASSES; pass++) {
      for (let y = 0; y < height; y++) {
        blurLine(buffer, scratch, y * width, 1, width, radius);
      }
      for (let x = 0; x < width; x++) {
        blurLine(scratch, buffer, x, width, height, radius);
      }
    }
    for (let i = 0; i < pixels.length; i += CHANNELS) {
      const alpha = buffer[i + ALPHA] ?? 0;
      if (alpha <= EMPTY_ALPHA) {
        pixels[i + ALPHA] = 0;
        continue;
      }
      for (let channel = 0; channel < ALPHA; channel++) {
        pixels[i + channel] = (buffer[i + channel] ?? 0) / alpha;
      }
      pixels[i + ALPHA] = Math.round(
        clamp(alpha * LAVA_THRESHOLD_GAIN - LAVA_THRESHOLD_OFFSET, 0, 1) *
          BYTE_MAX,
      );
    }
  };
}
