import { describe, expect, it } from 'vitest';

import { rubberBand, swipeStep } from './venueSwipe';

describe('rubberBand', () => {
  it('follows the drag between the first and last photo', () => {
    expect(rubberBand(40, 2, 5)).toBe(40);
    expect(rubberBand(-40, 2, 5)).toBe(-40);
    expect(rubberBand(-40, 0, 5)).toBe(-40);
    expect(rubberBand(40, 4, 5)).toBe(40);
  });

  it('pulls at 0.3 past the first and the last photo', () => {
    expect(rubberBand(50, 0, 5)).toBeCloseTo(15);
    expect(rubberBand(-50, 4, 5)).toBeCloseTo(-15);
  });

  it('treats a single photo as both ends', () => {
    expect(rubberBand(10, 0, 1)).toBeCloseTo(3);
    expect(rubberBand(-10, 0, 1)).toBeCloseTo(-3);
  });
});

describe('swipeStep', () => {
  it('commits past 60 px on a wide frame', () => {
    expect(swipeStep(-61, 1000)).toBe(1);
    expect(swipeStep(61, 1000)).toBe(-1);
    expect(swipeStep(-60, 1000)).toBe(0);
    expect(swipeStep(59, 1000)).toBe(0);
  });

  it('commits past 15 % of the width on a narrow frame', () => {
    expect(swipeStep(-46, 300)).toBe(1);
    expect(swipeStep(-45, 300)).toBe(0);
    expect(swipeStep(46, 300)).toBe(-1);
  });
});
