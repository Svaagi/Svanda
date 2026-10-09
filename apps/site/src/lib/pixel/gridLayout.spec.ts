import { countFilledPixels } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { BITMAP } from './bitmaps';
import { FALLBACK_GLYPH, GLYPH, NARROW_G } from './glyphs';
import {
  layoutBitmap,
  layoutText,
  measureText,
  resolveGlyph,
} from './gridLayout';

describe('resolveGlyph', () => {
  it('maps Czech and Slovak diacritics to their base letter', () => {
    expect(resolveGlyph('Č')).toBe(GLYPH.C);
    expect(resolveGlyph('Ů')).toBe(GLYPH.U);
    expect(resolveGlyph('Ô')).toBe(GLYPH.O);
    expect(resolveGlyph('Ľ', true)).toBe(NARROW_G.L);
  });

  it('uses narrow letters when asked and keeps digits full width', () => {
    expect(resolveGlyph('A', true)).toBe(NARROW_G.A);
    expect(resolveGlyph('&', true)).toBe(NARROW_G['&']);
    expect(resolveGlyph('7', true)).toBe(GLYPH['7']);
  });

  it('falls back to X for unknown characters', () => {
    expect(resolveGlyph('?')).toBe(FALLBACK_GLYPH);
    expect(resolveGlyph('?', true)).toBe(FALLBACK_GLYPH);
  });
});

describe('measureText', () => {
  it('counts glyph widths with one gap between glyphs', () => {
    expect(measureText('SVANDA')).toBe(4 + 5 + 4 + 5 + 4 + 4 + 5);
    expect(measureText('I')).toBe(3);
  });

  it('advances two columns per space', () => {
    expect(measureText('A B')).toBe(4 + 1 + 2 + 4);
  });

  it('measures narrow text', () => {
    expect(measureText('SVANDA', true)).toBe(6 * 3 + 5);
  });
});

describe('layoutText', () => {
  it('places glyphs left to right and numbers the letters', () => {
    const cells = layoutText('I A');
    const letterOf = (index: number) =>
      cells.filter(({ letterIndex }) => letterIndex === index);

    expect(letterOf(0)).toHaveLength(countFilledPixels(GLYPH.I ?? []));
    expect(Math.min(...letterOf(1).map(({ col }) => col))).toBe(3 + 1 + 2);
  });

  it('offsets cells by the origin', () => {
    expect(layoutText('.', false, { col: 3, row: 7 })).toEqual([
      { col: 3, row: 11, letterIndex: 0 },
    ]);
  });
});

describe('layoutBitmap', () => {
  it('splits the wordmark into six letters at its empty columns', () => {
    const cells = layoutBitmap(BITMAP);
    const letterIndices = new Set(cells.map(({ letterIndex }) => letterIndex));

    expect([...letterIndices].sort()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(cells).toHaveLength(countFilledPixels(BITMAP));
  });
});
