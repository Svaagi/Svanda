import {
  GLASS_UI_DEFAULTS,
  type GlassUiConfig,
  PIXEL_UI_DEFAULTS,
  type PixelUiConfig,
} from 'constants/jukeboxUi';
import { describe, expect, it } from 'vitest';

import { glassCssVars, pixelCssVars } from './appCssVars';

const LAVA_CONFIG = {
  blob1: '#3ee6ff',
  blob2: '#5ff5e0',
  blob3: '#2bc4dc',
  blobAlpha: 0.6,
  animate: true,
  speed: 1,
};

const PIXEL_CONFIG: PixelUiConfig = {
  ...LAVA_CONFIG,
  pixel: 12,
  glitch: true,
  scan: true,
  base: '#010203',
  acc: '#aabbcc',
  accInk: '#111111',
  btnLine: '#222222',
  vip: '#ffd800',
  now: '#3ee6ff',
  txt: '#ffffff',
  rowLine: '#34373e',
  panelA: 0.4,
  rowA: 0.6,
  modalA: 0.7,
};

const GLASS_CONFIG: GlassUiConfig = {
  ...LAVA_CONFIG,
  blur: 10,
  base: '#063d49',
  acc: '#ffd700',
  vip: '#ffd36e',
  now: '#ffd809',
  txt: '#ffffff',
  glassA: 0.16,
  panelA: 0.11,
  rowA: 0.12,
  modalA: 1,
};

describe('pixelCssVars', () => {
  it('maps every pixel config value to its custom property', () => {
    expect(pixelCssVars(PIXEL_CONFIG)).toEqual({
      '--app-base': '#010203',
      '--app-txt': '#ffffff',
      '--app-acc': '#aabbcc',
      '--app-vip': '#ffd800',
      '--app-now': '#3ee6ff',
      '--app-panel-a': 0.4,
      '--app-row-a': 0.6,
      '--app-modal-a': 0.7,
      '--app-acc-ink': '#111111',
      '--app-btn-line': '#222222',
      '--app-row-line': '#34373e',
    });
  });

  it('takes its defaults from theme tokens', () => {
    const cssVars = pixelCssVars(PIXEL_UI_DEFAULTS.listen);

    expect(cssVars['--app-acc']).toBe(
      'var(--color-jukebox-ui-pixel-listen-acc)',
    );
    expect(cssVars['--app-panel-a']).toBe(0.425);
  });
});

describe('glassCssVars', () => {
  it('maps every glass config value to its custom property', () => {
    expect(glassCssVars(GLASS_CONFIG)).toEqual({
      '--app-base': '#063d49',
      '--app-txt': '#ffffff',
      '--app-acc': '#ffd700',
      '--app-vip': '#ffd36e',
      '--app-now': '#ffd809',
      '--app-panel-a': 0.11,
      '--app-row-a': 0.12,
      '--app-modal-a': 1,
      '--app-glass-a': 0.16,
    });
  });

  it('has no pixel-only properties', () => {
    expect(glassCssVars(GLASS_UI_DEFAULTS.sing)).not.toHaveProperty(
      '--app-acc-ink',
    );
  });
});
