import { hash3 } from 'lib/random';
import { describe, expect, it } from 'vitest';

import { twinkleAlpha } from './heroTwinkle';

const SAMPLE_COLS = 60;
const SAMPLE_ROWS = 40;
const STEP_S = 0.01;

const cells = Array.from({ length: SAMPLE_COLS * SAMPLE_ROWS }, (_, i) => ({
  col: i % SAMPLE_COLS,
  row: Math.floor(i / SAMPLE_COLS),
}));

const blinkingCell = cells.find(({ col, row }) => hash3(col, row, 1) <= 0.34);

describe('twinkleAlpha', () => {
  it('stays within 0..1', () => {
    for (const { col, row } of cells.slice(0, 200)) {
      for (let t = 0; t < 8; t += 0.37) {
        const alpha = twinkleAlpha(col, row, t);
        expect(alpha).toBeGreaterThanOrEqual(0);
        expect(alpha).toBeLessThanOrEqual(1);
      }
    }
  });

  it('only ever lights about a third of the cells', () => {
    const blinking = cells.filter(({ col, row }) => {
      for (let t = 0; t < 8; t += STEP_S * 4) {
        if (twinkleAlpha(col, row, t) > 0) return true;
      }
      return false;
    });
    const share = blinking.length / cells.length;

    expect(share).toBeGreaterThan(0.28);
    expect(share).toBeLessThan(0.4);
  });

  it('blinks once per period: up fast, then a long quadratic decay', () => {
    if (!blinkingCell) throw new Error('no blinking cell in the sample');
    const { col, row } = blinkingCell;
    const samples = Array.from({ length: 800 }, (_, i) =>
      twinkleAlpha(col, row, i * STEP_S),
    );
    const peakIndex = samples.indexOf(Math.max(...samples));
    const litSamples = samples.filter((alpha) => alpha > 0).length;

    expect(samples[peakIndex]).toBeGreaterThan(0.85);
    // Lit for the 0.08 s attack plus the 1.02 s decay, at most twice in 8 s.
    expect(litSamples * STEP_S).toBeLessThanOrEqual(2 * 1.1 + STEP_S * 2);
    expect(samples[peakIndex + 50]).toBeLessThan(samples[peakIndex] ?? 1);
  });

  it('is deterministic', () => {
    expect(twinkleAlpha(3, 7, 12.34)).toBe(twinkleAlpha(3, 7, 12.34));
  });
});
