import { JUKEBOX_COLOR_VARS } from 'constants/jukebox3d';
import { LinearSRGBColorSpace } from 'three';
import { afterEach, describe, expect, it } from 'vitest';

import { linearColor, readJukeboxPalette } from './jukeboxPalette';

describe('linearColor', () => {
  it('takes the hex channels as linear values', () => {
    const color = linearColor('#ff8000');

    expect(color.r).toBeCloseTo(1);
    expect(color.g).toBeCloseTo(128 / 255);
    expect(color.b).toBe(0);
  });

  it('keeps a near black token near black instead of converting it from sRGB', () => {
    const color = linearColor('#030304');
    const target = { r: 0, g: 0, b: 0 };
    color.getRGB(target, LinearSRGBColorSpace);

    expect(target.r).toBeCloseTo(3 / 255);
  });

  it('falls back to black for an unresolved token', () => {
    expect(linearColor('').getHex()).toBe(0);
  });
});

describe('readJukeboxPalette', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('reads every jukebox colour token', () => {
    document.documentElement.style.setProperty(
      JUKEBOX_COLOR_VARS.rimLeft,
      '#ff0000',
    );

    const palette = readJukeboxPalette(document.documentElement);

    expect(Object.keys(palette).sort()).toEqual(
      Object.keys(JUKEBOX_COLOR_VARS).sort(),
    );
    expect(palette.rimLeft.r).toBeCloseTo(1);
    expect(palette.shell.getHex()).toBe(0);
  });
});
