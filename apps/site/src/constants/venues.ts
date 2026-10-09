import type { Picture } from 'vite-imagetools';

export const VENUE_IDS = [
  'lemon',
  'arcadeBar',
  'kavarnaPodLampou',
  'musicBarAndel',
  'galerieZlin',
  'pivniceUMostu',
] as const;

export type VenueId = (typeof VENUE_IDS)[number];

export type Venue = {
  id: VenueId;
  // Proper names, not translated. The note is the catalog key `venues.notes.<id>`.
  name: string;
  city: string;
  // ISO `YYYY-MM-DD`, formatted per locale when shown.
  date: string;
  // CSS colours (theme tokens): the venue's own colour and its photo placeholder tint.
  color: string;
  tint: string;
  photos: readonly Picture[];
};

const PHOTO_DIR = '/src/images/venues/';

// Placeholder photos (scripts/generateVenuePlaceholders.mjs) until real ones arrive, named
// `<venue id>-<n>.webp`. The query must be a literal for Vite to read it: widths in px up to
// the source width, AVIF first, WebP as the fallback image.
const photoModules = import.meta.glob<Picture>('/src/images/venues/*.webp', {
  eager: true,
  import: 'default',
  query: { w: '640;1024;1600', format: 'avif;webp', as: 'picture' },
});

const photoNumber = (path: string) =>
  Number.parseInt(path.slice(path.lastIndexOf('-') + 1), 10);

export function collectVenuePhotos(
  modules: Readonly<Record<string, Picture>>,
  venueId: VenueId,
): Picture[] {
  const prefix = `${PHOTO_DIR}${venueId}-`;
  return Object.entries(modules)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([first], [second]) => photoNumber(first) - photoNumber(second))
    .map(([, photo]) => photo);
}

const venue = (
  id: VenueId,
  index: number,
  details: Pick<Venue, 'name' | 'city' | 'date'>,
): Venue => ({
  id,
  ...details,
  color: `var(--color-venue-${index + 1})`,
  tint: `var(--color-venue-tint-${index + 1})`,
  photos: collectVenuePhotos(photoModules, id),
});

// PLACEHOLDER: demo venues from the design until the real list is known.
export const VENUES: readonly [Venue, ...Venue[]] = [
  venue('lemon', 0, { name: 'Lemon', city: 'Brno', date: '2026-09-20' }),
  venue('arcadeBar', 1, {
    name: 'Arcade Bar',
    city: 'Ostrava',
    date: '2026-09-26',
  }),
  venue('kavarnaPodLampou', 2, {
    name: 'Kavárna Pod Lampou',
    city: 'Olomouc',
    date: '2026-10-03',
  }),
  venue('musicBarAndel', 3, {
    name: 'Music Bar Anděl',
    city: 'Praha',
    date: '2026-10-10',
  }),
  venue('galerieZlin', 4, {
    name: 'Galerie Zlín',
    city: 'Zlín',
    date: '2026-10-17',
  }),
  venue('pivniceUMostu', 5, {
    name: 'Pivnice U Mostu',
    city: 'Plzeň',
    date: '2026-10-24',
  }),
];

// Sizes hint for the photo srcsets: the frame spans the width in portrait and is capped in
// landscape (`--venues-frame-width`).
export const VENUE_PHOTO_SIZES =
  '(orientation: portrait) 100vw, min(100vw, 1750px)';

// The frame is sized in whole background grid cells: at least this many, in this aspect.
export const VENUE_FRAME_MIN_COLS = 8;
export const VENUE_FRAME_MIN_ROWS = 5;
export const VENUE_FRAME_ASPECT_LANDSCAPE = { cols: 16, rows: 9 } as const;
export const VENUE_FRAME_ASPECT_PORTRAIT = { cols: 4, rows: 5 } as const;
// Portrait: the frame runs edge to edge, short of this many cells.
export const VENUE_FRAME_PORTRAIT_EDGE_COLS = 2;
// The venue chevrons are 5 cells wide and 3 tall.
export const VENUE_CHEVRON_COLS = 5;
// The heading's pixel cells are half a background cell, so its glyphs sit on the grid.
export const VENUE_HEADING_CELL_RATIO = 0.5;
// Before the grid is measured (prerender, first paint). The cell mirrors the CSS token
// `--venue-cell-fallback`.
export const VENUE_CELL_FALLBACK_PX = 14;
export const VENUE_HEADING_FALLBACK_CELL_PX =
  VENUE_CELL_FALLBACK_PX * VENUE_HEADING_CELL_RATIO;
export const VENUE_HEADING_FALLBACK_MAX_COLS = 999;

// Swipe on the photo strip: a drag starts past this many px, pulls at this share past the
// first and last photo, and turns the photo past `min(px, ratio * frame width)`.
export const VENUE_SWIPE_START_PX = 6;
export const VENUE_SWIPE_RUBBER_BAND_RATIO = 0.3;
export const VENUE_SWIPE_COMMIT_MAX_PX = 60;
export const VENUE_SWIPE_COMMIT_RATIO = 0.15;
