import { afterEach, describe, expect, it } from 'vitest';

import { readHeroPalette, shadeIndex } from './heroPalette';

const TOKENS = {
  '--color-hero-cell-dim': '#000000',
  '--color-hero-cell-bright': '#ffffff',
  '--color-hero-mark-start': '#101010',
  '--color-hero-mark-end': '#202020',
  '--color-hero-mark-lit-start': '#808080',
  '--color-hero-mark-lit-end': '#909090',
  '--color-fg': '#14141a',
  '--hero-torch-alpha': '0.16',
  '--hero-shadow-alpha': '0.28',
};

const root = document.documentElement;

describe('readHeroPalette', () => {
  afterEach(() => {
    root.removeAttribute('style');
  });

  it('builds the grey ramps from the theme tokens', () => {
    Object.entries(TOKENS).forEach(([name, value]) =>
      root.style.setProperty(name, value),
    );
    const palette = readHeroPalette(root);

    expect(palette.cellShades).toHaveLength(16);
    expect(palette.cellShades[0]).toBe('#000000');
    expect(palette.cellShades.at(-1)).toBe('#ffffff');
    expect(palette.markShades).toHaveLength(8);
    expect(palette.markShades[0]?.[0]).toBe('#101010');
    expect(palette.markShades[0]?.at(-1)).toBe('#808080');
    expect(palette.markShades.at(-1)?.[0]).toBe('#202020');
    expect(palette.markShades.at(-1)?.at(-1)).toBe('#909090');
    expect(palette).toMatchObject({
      light: '#14141a',
      torchAlpha: 0.16,
      shadowAlpha: 0.28,
    });
  });

  it('falls back to black and no light when tokens are missing', () => {
    const palette = readHeroPalette(root);

    expect(palette.cellShades[0]).toBe('#000000');
    expect(palette.torchAlpha).toBe(0);
  });
});

describe('shadeIndex', () => {
  it('maps 0..1 onto the steps and clamps', () => {
    expect(shadeIndex(0, 8)).toBe(0);
    expect(shadeIndex(1, 8)).toBe(7);
    expect(shadeIndex(0.5, 8)).toBe(4);
    expect(shadeIndex(2, 8)).toBe(7);
    expect(shadeIndex(-1, 8)).toBe(0);
  });
});
