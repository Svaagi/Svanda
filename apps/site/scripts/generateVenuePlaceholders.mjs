// Usage: node scripts/generateVenuePlaceholders.mjs
//
// Paints the placeholder venue photos (until real photos arrive): a diagonal gradient from the
// venue tint into the frame colour, scattered with faint pixel squares in the venue colour,
// a different scatter per photo. Colours come from the venue tokens in src/styles/theme.css.
// The sources are committed; vite-imagetools turns them into AVIF/WebP srcsets at build time.
// The venue ids and photo count copied from src/constants/venues.ts are checked by
// generateVenuePlaceholders.spec.ts.

import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

export const VENUE_IDS = [
  'lemon',
  'arcadeBar',
  'kavarnaPodLampou',
  'musicBarAndel',
  'galerieZlin',
  'pivniceUMostu',
];
export const PHOTOS_PER_VENUE = 5;

const THEME_PATH = fileURLToPath(
  new URL('../src/styles/theme.css', import.meta.url),
);
const OUTPUT_DIR = fileURLToPath(
  new URL('../src/images/venues/', import.meta.url),
);
const WIDTH_PX = 1600;
const HEIGHT_PX = 1200;
const CELL_PX = 40;
// Squares sit inset in their cells so neighbours read as separate pixels.
const CELL_INSET_PX = 2;
const SQUARE_PX = CELL_PX - CELL_INSET_PX - CELL_INSET_PX;
const ALPHA_DECIMALS = 2;
const WEBP_QUALITY = 82;
const MIN_ALPHA = 0.06;
const ALPHA_RANGE = 0.22;
// Share of grid cells lit; it grows with the photo number so the five photos read apart.
const BASE_FILL_RATIO = 0.05;
const FILL_STEP_RATIO = 0.025;
const PRNG_MULTIPLIER = 1664525;
const PRNG_INCREMENT = 1013904223;
const PRNG_MODULUS = 0x100000000;
const SEED_STRIDE = 7919;
const BYTES_PER_KIB = 1024;

export function readToken(css, name) {
  const match = css.match(new RegExp(`${name}:\\s*(#[\\da-f]{6})`, 'i'));
  if (!match) throw new Error(`Token ${name} not found in theme.css`);
  return match[1];
}

function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * PRNG_MULTIPLIER + PRNG_INCREMENT) % PRNG_MODULUS;
    return state / PRNG_MODULUS;
  };
}

export function placeholderSvg({ tint, frame, color, seed, fillRatio }) {
  const random = createRandom(seed);
  const squares = [];
  for (let y = 0; y < HEIGHT_PX; y += CELL_PX) {
    for (let x = 0; x < WIDTH_PX; x += CELL_PX) {
      if (random() >= fillRatio) continue;
      const alpha = (MIN_ALPHA + random() * ALPHA_RANGE).toFixed(
        ALPHA_DECIMALS,
      );
      squares.push(
        `<rect x="${x + CELL_INSET_PX}" y="${y + CELL_INSET_PX}" width="${SQUARE_PX}" height="${SQUARE_PX}" fill="${color}" fill-opacity="${alpha}"/>`,
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH_PX}" height="${HEIGHT_PX}">
<defs><linearGradient id="tint" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${tint}"/><stop offset="1" stop-color="${frame}"/>
</linearGradient></defs>
<rect width="100%" height="100%" fill="url(#tint)"/>
${squares.join('\n')}
</svg>`;
}

async function main() {
  const css = readFileSync(THEME_PATH, 'utf8');
  const frame = readToken(css, '--color-venue-frame');
  mkdirSync(OUTPUT_DIR, { recursive: true });
  let totalBytes = 0;

  for (const [venueIndex, venueId] of VENUE_IDS.entries()) {
    const tint = readToken(css, `--color-venue-tint-${venueIndex + 1}`);
    const color = readToken(css, `--color-venue-${venueIndex + 1}`);
    for (let photo = 1; photo <= PHOTOS_PER_VENUE; photo += 1) {
      const svg = placeholderSvg({
        tint,
        frame,
        color,
        seed: venueIndex * SEED_STRIDE + photo,
        fillRatio: BASE_FILL_RATIO + (photo - 1) * FILL_STEP_RATIO,
      });
      const output = `${OUTPUT_DIR}${venueId}-${photo}.webp`;
      await sharp(Buffer.from(svg))
        .webp({ quality: WEBP_QUALITY })
        .toFile(output);
      totalBytes += statSync(output).size;
    }
  }

  const count = VENUE_IDS.length * PHOTOS_PER_VENUE;
  process.stdout.write(
    `Wrote ${count} placeholders, ${(totalBytes / BYTES_PER_KIB).toFixed(1)} KiB\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
