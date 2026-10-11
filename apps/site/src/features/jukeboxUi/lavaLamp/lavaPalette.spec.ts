import { PIXEL_UI_DEFAULTS } from 'constants/jukeboxUi';
import { afterEach, describe, expect, it } from 'vitest';

import { createLavaPalette, readLavaPalette } from './lavaPalette';

const root = document.documentElement;

describe('createLavaPalette', () => {
  it('builds gradient stops darkening to the rim and an alpha strip', () => {
    const palette = createLavaPalette({
      base: { r: 5, g: 37, b: 45 },
      blobs: [{ r: 200, g: 100, b: 0 }],
      glitch: { r: 62, g: 230, b: 255 },
    });

    expect(palette.base).toEqual({ r: 5, g: 37, b: 45 });
    expect(palette.blobStops).toEqual([
      ['#c86400b3', '#c86400b3', '#824100b3', '#8241003e'],
    ]);
    expect(palette.strip).toBe('#3ee6ff47');
  });

  it('has no strip without a glitch colour', () => {
    expect(
      createLavaPalette({ base: { r: 0, g: 0, b: 0 }, blobs: [], glitch: null })
        .strip,
    ).toBeNull();
  });
});

describe('readLavaPalette', () => {
  afterEach(() => {
    root.removeAttribute('style');
  });

  it('resolves token references and plain hex values', () => {
    root.style.setProperty('--color-jukebox-ui-pixel-sing-base', '#05252d');
    const palette = readLavaPalette(
      root,
      { ...PIXEL_UI_DEFAULTS.sing, blob1: '#ffffff' },
      null,
    );

    expect(palette.base).toEqual({ r: 5, g: 37, b: 45 });
    expect(palette.blobStops[0]?.[0]).toBe('#ffffffb3');
  });

  it('falls back to black for a colour it cannot read', () => {
    const palette = readLavaPalette(root, PIXEL_UI_DEFAULTS.sing, 'red');

    expect(palette.blobStops[1]?.[0]).toBe('#000000b3');
    expect(palette.strip).toBe('#00000047');
  });
});
