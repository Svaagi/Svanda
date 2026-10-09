import { describe, expect, it } from 'vitest';

import { clamp, easeInOut, lerp } from './math';

describe('clamp', () => {
  it('keeps a value inside the range', () => {
    expect(clamp(-2, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
    expect(clamp(3, 0, 1)).toBe(1);
  });
});

describe('lerp', () => {
  it('interpolates between the ends', () => {
    expect(lerp(2, 4, 0)).toBe(2);
    expect(lerp(2, 4, 0.5)).toBe(3);
    expect(lerp(2, 4, 1)).toBe(4);
  });
});

describe('easeInOut', () => {
  it('starts, ends and passes the middle at the right values', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
  });

  it('is slow at the ends and symmetric', () => {
    expect(easeInOut(0.25)).toBeCloseTo(0.125);
    expect(easeInOut(0.75)).toBeCloseTo(0.875);
  });
});
