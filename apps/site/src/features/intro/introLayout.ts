import {
  INTRO_LOCK_SPREAD_S,
  INTRO_LOCK_START_S,
  INTRO_NOISE_LOCK_DELAY_S,
  INTRO_SEED,
} from 'constants/intro';
import { BITMAP, bitmapWidth, layoutBitmap, wordmarkCellPx } from 'lib/pixel';
import { mulberry32 } from 'lib/random';

export const LOGO_COLS = bitmapWidth(BITMAP);
export const LOGO_ROWS = BITMAP.length;

// The wordmark module a logo cell resolves into.
export type IntroLogoModule = {
  col: number;
  row: number;
  letterIndex: number;
};

export type IntroCell = {
  col: number;
  row: number;
  logo: IntroLogoModule | null;
  // When the cell stops flickering and settles.
  lockS: number;
  // Per-cell randomness for the swarm departure and its arc.
  delaySeed: number;
  arcSeedX: number;
  arcSeedY: number;
};

export type IntroLayout = {
  width: number;
  height: number;
  cellPx: number;
  cells: IntroCell[];
  logoCells: IntroCell[];
};

const CENTRE_RATIO = 0.5;

const moduleKey = (col: number, row: number) => `${col}:${row}`;

const LOGO_MODULES = new Map(
  layoutBitmap(BITMAP).map((module) => [
    moduleKey(module.col, module.row),
    module,
  ]),
);

// A full screen grid with the wordmark centred on it. The PRNG is seeded, so every visit
// sees the same pattern for the same viewport.
export function createIntroLayout(width: number, height: number): IntroLayout {
  const cellPx = wordmarkCellPx(width);
  const cols = Math.ceil(width / cellPx);
  const rows = Math.ceil(height / cellPx);
  const originCol = Math.floor((cols - LOGO_COLS) * CENTRE_RATIO);
  const originRow = Math.floor((rows - LOGO_ROWS) * CENTRE_RATIO);
  const random = mulberry32(INTRO_SEED);

  const cells: IntroCell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const logo =
        LOGO_MODULES.get(moduleKey(col - originCol, row - originRow)) ?? null;
      cells.push({
        col,
        row,
        logo,
        lockS:
          INTRO_LOCK_START_S +
          random() * INTRO_LOCK_SPREAD_S +
          (logo ? 0 : INTRO_NOISE_LOCK_DELAY_S),
        delaySeed: random(),
        arcSeedX: random(),
        arcSeedY: random(),
      });
    }
  }

  return {
    width,
    height,
    cellPx,
    cells,
    logoCells: cells.filter((cell) => cell.logo),
  };
}
