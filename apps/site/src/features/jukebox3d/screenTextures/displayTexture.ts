import {
  SCREEN_LOGO_CELL_INSET_PX,
  SCREEN_LOGO_CELL_PX,
  SCREEN_LOGO_FADE_VP,
  SCREEN_LOGO_PHASE_SALT,
  SCREEN_LOGO_PHASE_STEPS,
  SCREEN_LOGO_STEPS_PER_S,
  SCREEN_TEXTURE_HEIGHT_PX,
  SCREEN_TEXTURE_WIDTH_PX,
} from 'constants/jukebox3d';
import { clamp, HALF } from 'lib/math';
import { BITMAP, fillInsetCell, layoutBitmap } from 'lib/pixel';
import { hash3 } from 'lib/random';

import type { ScreenPalette } from './screenPalette';

// The first letter of the wordmark: the "S".
const LOGO_CELLS = layoutBitmap(BITMAP).filter(
  ({ letterIndex }) => letterIndex === 0,
);
const LOGO_COLS = Math.max(...LOGO_CELLS.map(({ col }) => col)) + 1;
const LOGO_ROWS = BITMAP.length;
const LOGO_LEFT_PX = Math.round(
  (SCREEN_TEXTURE_WIDTH_PX - LOGO_COLS * SCREEN_LOGO_CELL_PX) * HALF,
);
const LOGO_TOP_PX = Math.round(
  (SCREEN_TEXTURE_HEIGHT_PX - LOGO_ROWS * SCREEN_LOGO_CELL_PX) * HALF,
);

// What the display shows: the S fading out over the first page, every cell in one of the
// logo colours. One frame object is updated in place for the life of the scene.
export type DisplayFrame = {
  logoAlpha: number;
  colorIndices: number[];
};

// Starts out of range, so the first update always counts as a change.
const UNSET = -1;

export function createDisplayFrame(): DisplayFrame {
  return {
    logoAlpha: UNSET,
    colorIndices: LOGO_CELLS.map(() => UNSET),
  };
}

export function displayLogoAlpha(vp: number): number {
  return 1 - clamp(vp / SCREEN_LOGO_FADE_VP, 0, 1);
}

// Each cell steps through random colours at the same rate, offset by its own phase.
export function logoCellColorIndex(
  col: number,
  row: number,
  timeS: number,
  colorCount: number,
): number {
  const phase =
    hash3(col, row, SCREEN_LOGO_PHASE_SALT) * SCREEN_LOGO_PHASE_STEPS;
  const step = Math.floor(timeS * SCREEN_LOGO_STEPS_PER_S + phase);
  return Math.floor(hash3(col, row, step) * colorCount);
}

// Moves the frame to this `vp` and time; true when that changed what the display shows.
// Cell colours are not tracked while the S is faded out.
export function updateDisplayFrame(
  frame: DisplayFrame,
  vp: number,
  timeS: number,
  colorCount: number,
): boolean {
  const logoAlpha = displayLogoAlpha(vp);
  let hasChanged = frame.logoAlpha !== logoAlpha;
  frame.logoAlpha = logoAlpha;
  if (logoAlpha <= 0) return hasChanged;
  for (let i = 0; i < LOGO_CELLS.length; i++) {
    const cell = LOGO_CELLS[i];
    if (!cell) continue;
    const colorIndex = logoCellColorIndex(
      cell.col,
      cell.row,
      timeS,
      colorCount,
    );
    if (frame.colorIndices[i] !== colorIndex) {
      frame.colorIndices[i] = colorIndex;
      hasChanged = true;
    }
  }
  return hasChanged;
}

// The display stays dark past the hero: the product pages lay the projected DOM screen over it.
export function drawDisplay(
  context: CanvasRenderingContext2D,
  frame: DisplayFrame,
  palette: ScreenPalette,
) {
  context.globalAlpha = 1;
  context.fillStyle = palette.background;
  context.fillRect(0, 0, SCREEN_TEXTURE_WIDTH_PX, SCREEN_TEXTURE_HEIGHT_PX);
  if (frame.logoAlpha <= 0) return;
  context.globalAlpha = frame.logoAlpha;
  LOGO_CELLS.forEach(({ col, row }, i) => {
    context.fillStyle =
      palette.logo[frame.colorIndices[i] ?? 0] ?? palette.background;
    fillInsetCell(
      context,
      LOGO_LEFT_PX + col * SCREEN_LOGO_CELL_PX,
      LOGO_TOP_PX + row * SCREEN_LOGO_CELL_PX,
      SCREEN_LOGO_CELL_PX,
      SCREEN_LOGO_CELL_INSET_PX,
    );
  });
  context.globalAlpha = 1;
}
