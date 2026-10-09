import { describe, expect, it } from 'vitest';

import { mixRgb, parseHexColor, toHexAlphaColor, toHexColor } from './color';

describe('parseHexColor', () => {
  it('reads long and short hex colours', () => {
    expect(parseHexColor('#ff9a3c')).toEqual({ r: 255, g: 154, b: 60 });
    expect(parseHexColor(' #FFF ')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('rejects anything else', () => {
    expect(parseHexColor('')).toBeNull();
    expect(parseHexColor('var(--x)')).toBeNull();
    expect(parseHexColor('#12345')).toBeNull();
  });
});

describe('mixRgb', () => {
  it('interpolates each channel and rounds', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };

    expect(mixRgb(black, white, 0)).toEqual(black);
    expect(mixRgb(black, white, 1)).toEqual(white);
    expect(mixRgb(black, white, 0.5)).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe('toHexColor', () => {
  it('writes two lower-case digits per channel', () => {
    expect(toHexColor({ r: 5, g: 171, b: 255 })).toBe('#05abff');
  });

  it('round-trips with parseHexColor', () => {
    expect(toHexColor(parseHexColor('#14141a') ?? { r: 0, g: 0, b: 0 })).toBe(
      '#14141a',
    );
  });
});

describe('toHexAlphaColor', () => {
  it('appends the alpha as a byte and clamps it to 0..1', () => {
    const cyan = { r: 62, g: 230, b: 255 };

    expect(toHexAlphaColor(cyan, 0.7)).toBe('#3ee6ffb3');
    expect(toHexAlphaColor(cyan, 0)).toBe('#3ee6ff00');
    expect(toHexAlphaColor(cyan, 2)).toBe('#3ee6ffff');
  });
});
