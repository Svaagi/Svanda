import { VENUE_SCRAMBLE_GLYPHS } from 'constants/venues';
import { describe, expect, it } from 'vitest';

import { scrambleText } from './venueScramble';

describe('scrambleText', () => {
  it('keeps the resolved head and scrambles the rest, spaces kept', () => {
    const scrambled = scrambleText('Arcade Bar', 3, () => 0);

    expect(scrambled).toBe('Arc### ###');
  });

  it('only scrambles into the scramble glyphs', () => {
    const scrambled = scrambleText('Music Bar Anděl', 0).replaceAll(' ', '');

    [...scrambled].forEach((char) =>
      expect(VENUE_SCRAMBLE_GLYPHS).toContain(char),
    );
    expect(scrambled).toHaveLength('MusicBarAnděl'.length);
  });

  it('picks the glyph from the random value', () => {
    expect(scrambleText('ab', 0, () => 0.999)).toBe('WW');
    expect(scrambleText('ab', 1, () => 0.25)).toBe('a0');
  });

  it('shows the text itself once every character is resolved', () => {
    expect(scrambleText('Lemon', 5)).toBe('Lemon');
    expect(scrambleText('Lemon', 99)).toBe('Lemon');
  });
});
