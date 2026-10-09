import type { Picture } from 'vite-imagetools';
import { describe, expect, it } from 'vitest';

import { collectVenuePhotos, VENUE_IDS, VENUES } from './venues';

const picture = (src: string): Picture => ({
  sources: { avif: `${src}.avif` },
  img: { src, w: 1600, h: 1200 },
});

describe('venues', () => {
  it('lists every venue once, in id order, with an ISO date and photos', () => {
    expect(VENUES.map(({ id }) => id)).toEqual(VENUE_IDS);
    VENUES.forEach((venue) => {
      expect(venue.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(venue.date))).toBe(false);
      expect(venue.color).toMatch(/^var\(--color-venue-\d\)$/);
      expect(venue.tint).toMatch(/^var\(--color-venue-tint-\d\)$/);
      expect(venue.photos.length).toBeGreaterThan(0);
    });
  });

  it("collects a venue's photos in number order", () => {
    const modules = {
      '/src/images/venues/lemon-10.webp': picture('lemon-10'),
      '/src/images/venues/lemon-2.webp': picture('lemon-2'),
      '/src/images/venues/arcadeBar-1.webp': picture('arcadeBar-1'),
      '/src/images/venues/lemon-1.webp': picture('lemon-1'),
    };

    expect(
      collectVenuePhotos(modules, 'lemon').map(({ img }) => img.src),
    ).toEqual(['lemon-1', 'lemon-2', 'lemon-10']);
    expect(collectVenuePhotos(modules, 'galerieZlin')).toEqual([]);
  });
});
