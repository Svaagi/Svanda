import { LAYER_FADE_RATE, VENUES_LAYER_FADE_RATE } from 'constants/stage';
import { describe, expect, it } from 'vitest';

import { layerOpacity } from './layerOpacity';

describe('layerOpacity', () => {
  it('is opaque on its own page', () => {
    expect(layerOpacity(2, 2, LAYER_FADE_RATE)).toBe(1);
  });

  it('fades symmetrically on both sides of its page', () => {
    expect(layerOpacity(1.75, 2, LAYER_FADE_RATE)).toBeCloseTo(0.45);
    expect(layerOpacity(2.25, 2, LAYER_FADE_RATE)).toBeCloseTo(0.45);
  });

  it('is fully transparent from about half a page away', () => {
    expect(layerOpacity(1.5, 2, LAYER_FADE_RATE)).toBe(0);
    expect(layerOpacity(0, 2, LAYER_FADE_RATE)).toBe(0);
  });

  it('fades slower with a lower rate', () => {
    expect(layerOpacity(3.5, 4, VENUES_LAYER_FADE_RATE)).toBeCloseTo(0.1);
  });
});
