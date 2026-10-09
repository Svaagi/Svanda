import { describe, expect, it } from 'vitest';

import { createGooFilter } from './lavaGoo';

const SIZE = 9;
const CHANNELS = 4;

const createPixels = (paint: (x: number, y: number) => boolean) => {
  const pixels = new Uint8ClampedArray(SIZE * SIZE * CHANNELS);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!paint(x, y)) continue;
      pixels.set([200, 100, 50, 255], (y * SIZE + x) * CHANNELS);
    }
  }
  return pixels;
};

const alphaAt = (pixels: Uint8ClampedArray, x: number, y: number) =>
  pixels[(y * SIZE + x) * CHANNELS + 3];

describe('createGooFilter', () => {
  it('keeps a solid blob solid and its colour unchanged', () => {
    const pixels = createPixels((x, y) => x >= 2 && x <= 6 && y >= 2 && y <= 6);

    createGooFilter()(pixels, SIZE, SIZE, 1);

    expect(alphaAt(pixels, 4, 4)).toBe(255);
    expect(Array.from(pixels.slice(40 * CHANNELS, 40 * CHANNELS + 3))).toEqual([
      200, 100, 50,
    ]);
  });

  it('clears what lies far from any blob', () => {
    const pixels = createPixels((x, y) => x >= 3 && x <= 5 && y >= 3 && y <= 5);

    createGooFilter()(pixels, SIZE, SIZE, 1);

    expect(alphaAt(pixels, 0, 0)).toBe(0);
    expect(alphaAt(pixels, 8, 8)).toBe(0);
  });

  it('leaves an empty frame empty', () => {
    const pixels = createPixels(() => false);

    createGooFilter()(pixels, SIZE, SIZE, 2);

    expect(pixels.every((value) => value === 0)).toBe(true);
  });
});
