import { describe, expect, it } from 'vitest';

import { clamp, easeInOut, easeOut, easeOutBack, lerp, roundTo } from './math';

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

describe('easeOut', () => {
  it('runs from 0 to 1 and is past the middle early', () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeCloseTo(0.875);
  });
});

describe('easeOutBack', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeOutBack(0, 1.2)).toBeCloseTo(0);
    expect(easeOutBack(1, 1.2)).toBe(1);
  });

  it('overshoots the end before settling', () => {
    expect(easeOutBack(0.8, 1.2)).toBeGreaterThan(1);
  });
});

describe('roundTo', () => {
  it('rounds to the given number of decimals', () => {
    expect(roundTo(1.26, 1)).toBe(1.3);
    expect(roundTo(-3.14159, 2)).toBe(-3.14);
    expect(roundTo(7.5, 0)).toBe(8);
  });
});
