// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';

import { VENUE_IDS, VENUES } from 'constants/venues';
import { describe, expect, it } from 'vitest';

import {
  PHOTOS_PER_VENUE,
  placeholderSvg,
  readToken,
  VENUE_IDS as SCRIPT_VENUE_IDS,
} from './generateVenuePlaceholders.mjs';

// The script is plain Node and cannot import the TypeScript constants: it keeps copies,
// held in step with the app here.
describe('generateVenuePlaceholders.mjs', () => {
  it('paints a photo set for every venue the page lists', () => {
    expect(SCRIPT_VENUE_IDS).toEqual(VENUE_IDS);
    VENUES.forEach((venue) => {
      expect(venue.photos.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('has committed every placeholder it paints', () => {
    SCRIPT_VENUE_IDS.forEach((venueId) => {
      for (let photo = 1; photo <= PHOTOS_PER_VENUE; photo += 1) {
        const path = new URL(
          `../src/images/venues/${venueId}-${photo}.webp`,
          import.meta.url,
        );
        expect(existsSync(path)).toBe(true);
      }
    });
  });

  it('reads the venue colours from the theme tokens', () => {
    const css = readFileSync(
      new URL('../src/styles/theme.css', import.meta.url),
      'utf8',
    );
    VENUE_IDS.forEach((_, index) => {
      expect(readToken(css, `--color-venue-${index + 1}`)).toMatch(
        /^#[\da-f]{6}$/i,
      );
      expect(readToken(css, `--color-venue-tint-${index + 1}`)).toMatch(
        /^#[\da-f]{6}$/i,
      );
    });
    expect(() => readToken(css, '--color-venue-missing')).toThrow();
  });

  it('scatters a different, repeatable pixel pattern per seed', () => {
    const paint = (seed: number) =>
      placeholderSvg({
        tint: '#111111',
        frame: '#000000',
        color: '#ffffff',
        seed,
        fillRatio: 0.1,
      });

    expect(paint(1)).toBe(paint(1));
    expect(paint(1)).not.toBe(paint(2));
    expect(paint(1)).toContain('<rect x=');
  });
});
