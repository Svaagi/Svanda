import { GLASS_UI_DEFAULTS, PIXEL_UI_DEFAULTS } from 'constants/jukeboxUi';
import { describe, expect, it } from 'vitest';

import { glassLavaSettings, pixelLavaSettings } from './lavaSettings';

describe('pixelLavaSettings', () => {
  it('draws one block per 12 design pixels at 12 fps by default', () => {
    const settings = pixelLavaSettings(PIXEL_UI_DEFAULTS.sing);

    expect(settings).toMatchObject({
      design: 'pixel',
      columns: 45,
      rows: 80,
      fps: 12,
      glitchColor: PIXEL_UI_DEFAULTS.sing.now,
      hasScanlines: true,
      blur: 0,
    });
    expect(settings.lamp).toEqual({
      base: PIXEL_UI_DEFAULTS.sing.base,
      blob1: PIXEL_UI_DEFAULTS.sing.blob1,
      blob2: PIXEL_UI_DEFAULTS.sing.blob2,
      blob3: PIXEL_UI_DEFAULTS.sing.blob3,
      blobAlpha: 0.6,
      animate: true,
      speed: 1,
    });
  });

  it('follows the pixel size, never below 10 columns', () => {
    expect(
      pixelLavaSettings({ ...PIXEL_UI_DEFAULTS.sing, pixel: 6 }),
    ).toMatchObject({ columns: 90, rows: 160 });
    expect(
      pixelLavaSettings({ ...PIXEL_UI_DEFAULTS.sing, pixel: 200 }),
    ).toMatchObject({ columns: 10, rows: 18 });
  });

  it('drops the tearing and the scanlines when switched off', () => {
    const settings = pixelLavaSettings({
      ...PIXEL_UI_DEFAULTS.listen,
      glitch: false,
      scan: false,
    });

    expect(settings.glitchColor).toBeNull();
    expect(settings.hasScanlines).toBe(false);
  });
});

describe('glassLavaSettings', () => {
  it('draws a fixed 90 x 160 lamp at 24 fps under a CSS blur', () => {
    expect(
      glassLavaSettings({ ...GLASS_UI_DEFAULTS.listen, blur: 4 }),
    ).toMatchObject({
      design: 'glass',
      columns: 90,
      rows: 160,
      fps: 24,
      glitchColor: null,
      hasScanlines: false,
      blur: 4,
    });
  });
});
