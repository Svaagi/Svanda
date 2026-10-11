import {
  LAVA_GLITCH_FIRST_MS,
  LAVA_TEAR_MAX_HEIGHT,
  LAVA_TEAR_MAX_SHIFT,
} from 'constants/lavaLamp';
import { mulberry32 } from 'lib/random';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createGlitchSchedule, pickTearRows } from './lavaPixelFx';

describe('createGlitchSchedule', () => {
  const advance = (ms: number) => vi.advanceTimersByTime(ms);

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['performance'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits before the first burst', () => {
    const schedule = createGlitchSchedule(() => 0);

    expect(schedule.isTearing(performance.now())).toBe(false);
    advance(LAVA_GLITCH_FIRST_MS - 1);
    expect(schedule.isTearing(performance.now())).toBe(false);
  });

  it('tears for 220 to 400 ms, then rests 2.2 to 5.7 s', () => {
    // The shortest burst and gap.
    const schedule = createGlitchSchedule(() => 0);
    schedule.isTearing(performance.now());

    advance(LAVA_GLITCH_FIRST_MS);
    expect(schedule.isTearing(performance.now())).toBe(true);
    advance(219);
    expect(schedule.isTearing(performance.now())).toBe(true);
    advance(1);
    expect(schedule.isTearing(performance.now())).toBe(false);
    advance(2200 - 220 - 1);
    expect(schedule.isTearing(performance.now())).toBe(false);
    advance(1);
    expect(schedule.isTearing(performance.now())).toBe(true);
  });

  it('stretches the burst and the gap with the random draw', () => {
    // The longest burst and gap.
    const schedule = createGlitchSchedule(() => 1);
    schedule.isTearing(performance.now());

    advance(LAVA_GLITCH_FIRST_MS);
    expect(schedule.isTearing(performance.now())).toBe(true);
    advance(399);
    expect(schedule.isTearing(performance.now())).toBe(true);
    advance(1);
    expect(schedule.isTearing(performance.now())).toBe(false);
    advance(5700 - 400 - 1);
    expect(schedule.isTearing(performance.now())).toBe(false);
    advance(1);
    expect(schedule.isTearing(performance.now())).toBe(true);
  });
});

describe('pickTearRows', () => {
  it('picks short bands shifted a few pixels inside the canvas', () => {
    const rows = pickTearRows(50, 80, mulberry32(7));

    expect(rows).toHaveLength(50);
    rows.forEach(({ y, height, shift }) => {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(80);
      expect(height).toBeGreaterThanOrEqual(1);
      expect(height).toBeLessThanOrEqual(LAVA_TEAR_MAX_HEIGHT);
      expect(Math.abs(shift)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(shift)).toBeLessThanOrEqual(LAVA_TEAR_MAX_SHIFT);
    });
  });

  it('is repeatable for a seeded draw', () => {
    expect(pickTearRows(3, 80, mulberry32(7))).toEqual(
      pickTearRows(3, 80, mulberry32(7)),
    );
  });
});
