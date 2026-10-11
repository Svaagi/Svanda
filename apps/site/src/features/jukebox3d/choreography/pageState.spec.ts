import { describe, expect, it } from 'vitest';

import { pageState } from './pageState';
import type { StageLayout } from './stageLayout';

const LAYOUT: StageLayout = {
  x: [0, 350, -350, 0, 0],
  y: [-30, -140, -140, -50, -1100],
  scale: [1.3, 2, 2, 1.43, 1.3],
};
const FULL_TURN = Math.PI * 2;

describe('pageState', () => {
  it('lands exactly on each page pose at integer vp', () => {
    const yaws = [-0.45, -0.45, 0.45, 0, 0];
    for (let page = 0; page <= 4; page++) {
      const state = pageState(page, LAYOUT);

      expect(state.x).toBeCloseTo(LAYOUT.x[page] ?? NaN);
      expect(state.y).toBeCloseTo(LAYOUT.y[page] ?? NaN);
      expect(state.scale).toBeCloseTo(LAYOUT.scale[page] ?? NaN);
      expect(state.yaw).toBeCloseTo(yaws[page] ?? NaN);
    }
  });

  it('spins a full turn from the hero to karaoke and from jukebox to custom only', () => {
    expect(pageState(0, LAYOUT).spin).toBe(0);
    expect(pageState(0.5, LAYOUT).spin).toBeCloseTo(FULL_TURN / 2);
    expect(pageState(1, LAYOUT).spin).toBeCloseTo(FULL_TURN);
    expect(pageState(1.5, LAYOUT).spin).toBeCloseTo(FULL_TURN);
    expect(pageState(2, LAYOUT).spin).toBeCloseTo(FULL_TURN);
    expect(pageState(2.5, LAYOUT).spin).toBeCloseTo(FULL_TURN * 1.5);
    expect(pageState(3, LAYOUT).spin).toBeCloseTo(FULL_TURN * 2);
    expect(pageState(4, LAYOUT).spin).toBeCloseTo(FULL_TURN * 2);
  });

  it('moves sideways linearly but eases height and scale', () => {
    const quarter = pageState(0.25, LAYOUT);

    expect(quarter.x).toBeCloseTo(350 * 0.25);
    // easeInOut(0.25) = 0.125
    expect(quarter.y).toBeCloseTo(-30 + (-140 + 30) * 0.125);
    expect(quarter.scale).toBeCloseTo(1.3 + (2 - 1.3) * 0.125);
  });

  it('clamps vp outside the stage to the first and last page', () => {
    expect(pageState(-0.5, LAYOUT).y).toBeCloseTo(-30);
    expect(pageState(4.5, LAYOUT).y).toBeCloseTo(-1100);
  });
});
