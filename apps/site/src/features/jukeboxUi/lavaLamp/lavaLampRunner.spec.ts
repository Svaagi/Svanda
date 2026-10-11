import { GLASS_UI_DEFAULTS, PIXEL_UI_DEFAULTS } from 'constants/jukeboxUi';
import { LAVA_GLITCH_FIRST_MS } from 'constants/lavaLamp';
import { describe, expect, it, vi } from 'vitest';

import { createLavaLampRunner } from './lavaLampRunner';
import { glassLavaSettings, pixelLavaSettings } from './lavaSettings';

const PIXEL = pixelLavaSettings(PIXEL_UI_DEFAULTS.sing);
const GLASS = glassLavaSettings({ ...GLASS_UI_DEFAULTS.sing, speed: 2 });
const TICK_MS = 16;

const createRenderer = () => ({ draw: vi.fn() });

// Runs ticks every TICK_MS from `fromMs` for `durationMs`.
const tick = (
  step: (nowMs: number) => void,
  fromMs: number,
  durationMs: number,
) => {
  for (let nowMs = fromMs; nowMs < fromMs + durationMs; nowMs += TICK_MS) {
    step(nowMs);
  }
};

describe('createLavaLampRunner', () => {
  it('draws at its design frame rate', () => {
    const pixel = createRenderer();
    const glass = createRenderer();
    const pixelRunner = createLavaLampRunner(pixel, PIXEL, 0, () => 0.5);
    const glassRunner = createLavaLampRunner(glass, GLASS, 0, () => 0.5);

    tick(
      (nowMs) => {
        pixelRunner.step(nowMs);
        glassRunner.step(nowMs);
      },
      0,
      1000,
    );

    expect(pixel.draw.mock.calls.length).toBeGreaterThanOrEqual(10);
    expect(pixel.draw.mock.calls.length).toBeLessThanOrEqual(12);
    expect(glass.draw.mock.calls.length).toBeGreaterThanOrEqual(20);
    expect(glass.draw.mock.calls.length).toBeLessThanOrEqual(24);
  });

  it('advances lamp time by 0.6 of real time times the speed, from its start', () => {
    const runner = createLavaLampRunner(createRenderer(), GLASS, 500);

    runner.step(1000);
    runner.step(1050);

    expect(runner.timeMs).toBeCloseTo(500 + 50 * 0.6 * 2);
  });

  it('moves on by one short step after a pause', () => {
    const runner = createLavaLampRunner(createRenderer(), GLASS, 0);

    runner.step(0);
    runner.step(10_000);

    expect(runner.timeMs).toBeCloseTo(100 * 0.6 * 2);
  });

  it('tears rows once the glitch schedule fires', () => {
    const renderer = createRenderer();
    const runner = createLavaLampRunner(renderer, PIXEL, 0, () => 0);

    runner.step(0);
    expect(renderer.draw).toHaveBeenLastCalledWith(0, []);
    runner.step(LAVA_GLITCH_FIRST_MS);
    expect(renderer.draw.mock.lastCall?.[1]).toHaveLength(5);
  });

  it('draws a still frame with a fixed tear, and none for glass', () => {
    const pixel = createRenderer();
    const glass = createRenderer();

    createLavaLampRunner(pixel, PIXEL, 300).drawStill();
    createLavaLampRunner(pixel, PIXEL, 300).drawStill();
    createLavaLampRunner(glass, GLASS, 300).drawStill();

    expect(pixel.draw.mock.calls[0]?.[1]).toHaveLength(3);
    expect(pixel.draw.mock.calls[1]).toEqual(pixel.draw.mock.calls[0]);
    expect(glass.draw).toHaveBeenCalledWith(300, []);
  });
});
