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
// The lightbox shows a photo across the viewport.
export const VENUE_LIGHTBOX_PHOTO_SIZES = '100vw';

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

// Switching venue scrambles its name: unresolved letters show random glyphs (ones the pixel
// font and Silkscreen both draw) and resolve left to right, this many per step.
export const VENUE_SCRAMBLE_GLYPHS = '#%&@0123456789XZKW';
export const VENUE_SCRAMBLE_STEP_CHARS = 2;
export const VENUE_SCRAMBLE_STEP_MS = 70;

// The band canvas redraws at 30 fps. Display frames do not land exactly on that interval, so
// a frame this much early still draws (otherwise a 60 Hz screen would drop to 20 fps).
export const VENUE_BAND_FRAME_MS = 1000 / 30;
export const VENUE_BAND_FRAME_TOLERANCE_MS = 4;
// The diagonal band: its centre line starts `startRatio * width` down the left edge, falls
// `slope` px per px and is `halfRatio * width` thick on either side, measured across. Portrait
// enters lower left and runs off the bottom edge.
export const VENUE_BAND_LANDSCAPE = {
  startRatio: 0.22,
  slope: 1.12,
  halfRatio: 0.09,
} as const;
export const VENUE_BAND_PORTRAIT = {
  startRatio: 0.68,
  slope: 1.3,
  halfRatio: 0.135,
} as const;
// Band cells: a base alpha plus a hashed share of the spread.
export const VENUE_BAND_ALPHA = 0.3;
export const VENUE_BAND_ALPHA_SPREAD = 0.2;
export const VENUE_BAND_SHADE_SALT = 5;
// The band twinkle decays linearly; half its sparks are dark, half light.
export const VENUE_BAND_TWINKLE_DECAY_EXPONENT = 1;
export const VENUE_BAND_TWINKLE_MIN_ALPHA = 0.03;
export const VENUE_BAND_SPARK_DARK_ALPHA = 0.28;
export const VENUE_BAND_SPARK_LIGHT_ALPHA = 0.22;
export const VENUE_BAND_SPARK_DARK_SHARE = 0.5;
export const VENUE_BAND_SPARK_SALT = 4;
// Torch strength on band cells and on the name's cells (the first line, light, darkens).
export const VENUE_BAND_TORCH_ALPHA = 0.32;
export const VENUE_BAND_TORCH_TEXT_ALPHA = 0.18;
export const VENUE_BAND_TORCH_TEXT_MUTED_ALPHA = 0.45;
// Reduced motion shows the twinkle frozen at this moment.
export const VENUE_BAND_REDUCED_MOTION_TIME_S = 0;

// The name in the band, in grid cells: lines a glyph plus one row apart, one empty column
// kept at the right edge, and four rows kept free above the bottom edge for the chevron.
export const VENUE_BAND_LINE_PITCH_ROWS = 6;
export const VENUE_BAND_RIGHT_MARGIN_COLS = 1;
export const VENUE_BAND_BOTTOM_RESERVE_ROWS = 5;
// Landscape: the name starts this share of the width in, less a few columns, and this share
// of the height down (the label), the name this many rows below that.
export const VENUE_BAND_TEXT_X_RATIO = 0.07;
export const VENUE_BAND_TEXT_X_BACK_COLS = 3;
export const VENUE_BAND_LABEL_Y_RATIO = 0.2;
export const VENUE_BAND_TEXT_BELOW_LABEL_ROWS = 13;
// Portrait: one column in, this share of the height down.
export const VENUE_BAND_PORTRAIT_TEXT_COL = 1;
export const VENUE_BAND_PORTRAIT_TEXT_Y_RATIO = 0.7;
// The note and place label above the name: about this tall, plus a row of air. Without room
// for it the label hides and the name keeps its place.
export const VENUE_BAND_LABEL_HEIGHT_PX = 56;

// Theme tokens the band canvas reads.
export const VENUE_BAND_COLOR_VARS = {
  text: '--color-venue-band-text',
  textMuted: '--color-venue-band-text-muted',
  sparkLight: '--color-venue-band-spark-light',
  sparkDark: '--color-venue-band-spark-dark',
  torch: '--color-venue-band-torch',
  torchOnText: '--color-venue-band-torch-on-text',
} as const;
// The slide custom properties the band positions the note and place label with.
export const VENUE_LABEL_VARS = {
  x: '--venue-label-x',
  y: '--venue-label-y',
  opacity: '--venue-label-opacity',
} as const;
// Lightbox arrows: sideways pixel chevrons with cells this big.
export const VENUE_LIGHTBOX_CHEVRON_CELL_PX = 6;
