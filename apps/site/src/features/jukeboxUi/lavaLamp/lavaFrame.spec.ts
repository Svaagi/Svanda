import { describe, expect, it } from 'vitest';

import { compositeLava } from './lavaFrame';

const BASE = { r: 10, g: 20, b: 30 };

describe('compositeLava', () => {
  it('lays blobs over the base at their alpha times the blob strength', () => {
    const pixels = new Uint8ClampedArray([
      // No blob: the base shows.
      200, 200, 200, 0,
      // A solid blob at half strength: halfway to the blob colour.
      210, 120, 30, 255,
    ]);

    compositeLava(pixels, BASE, 0.5, null);

    expect(Array.from(pixels)).toEqual([10, 20, 30, 255, 110, 70, 30, 255]);
  });

  it('posterizes the result to the step', () => {
    const pixels = new Uint8ClampedArray([9, 31, 251, 255]);

    compositeLava(pixels, BASE, 1, 20);

    expect(Array.from(pixels)).toEqual([0, 40, 255, 255]);
  });
});
