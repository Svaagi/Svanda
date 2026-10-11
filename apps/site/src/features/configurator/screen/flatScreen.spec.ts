import { describe, expect, it } from 'vitest';

import { fitScale, isOutsideVpRange } from './flatScreen';

const SCREEN = { width: 540, height: 960 };

describe('fitScale', () => {
  it('fits a tall container by width and a wide one by height', () => {
    expect(fitScale({ width: 270, height: 960 }, SCREEN)).toBe(0.5);
    expect(fitScale({ width: 1000, height: 480 }, SCREEN)).toBe(0.5);
  });

  it('is 0 while the container has no size', () => {
    expect(fitScale({ width: 0, height: 400 }, SCREEN)).toBe(0);
  });
});

describe('isOutsideVpRange', () => {
  const range = { fromVp: 2.8, toVp: 3.2 };

  it('is inside only strictly between the range ends', () => {
    expect(isOutsideVpRange(3, range)).toBe(false);
    expect(isOutsideVpRange(2.8, range)).toBe(true);
    expect(isOutsideVpRange(3.2, range)).toBe(true);
    expect(isOutsideVpRange(1, range)).toBe(true);
  });
});
