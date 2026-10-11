import {
  INTRO_BLOCK_STEPS,
  INTRO_CELL_GAP_PX,
  INTRO_COLOR_REROLL_HZ,
  INTRO_DENSITY_DROP_S,
  INTRO_DENSITY_DROP_START_S,
  INTRO_DENSITY_MIN,
  INTRO_DENSITY_SLACK,
  INTRO_FINAL_BLOCK_CELLS,
  INTRO_FLASH_S,
  INTRO_NOISE_COLOR_SALT,
  INTRO_NOISE_DENSITY_SALT,
  INTRO_NOISE_FADE_S,
  INTRO_NOISE_FILL_RATIO,
  INTRO_NOISE_FILL_SALT,
  INTRO_NOISE_PHASE_SALT,
  INTRO_NOISE_SALTS_PER_STEP,
  INTRO_REROLL_PHASE_STEPS,
} from 'constants/intro';
import { fillInsetCell } from 'lib/pixel';
import { hash3 } from 'lib/random';

import type { IntroCell, IntroLayout } from './introLayout';
import { type IntroPalette, letterColor } from './introPalette';

export type CellRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function blockSizeAt(t: number): number {
  return (
    INTRO_BLOCK_STEPS.find(({ untilS }) => t < untilS)?.sizeCells ??
    INTRO_FINAL_BLOCK_CELLS
  );
}

// Share of noise blocks still lit: full at first, thinning out as the cells lock.
export function densityAt(t: number): number {
  if (t < INTRO_DENSITY_DROP_START_S) return 1;
  return Math.max(
    INTRO_DENSITY_MIN,
    1 - (t - INTRO_DENSITY_DROP_START_S) / INTRO_DENSITY_DROP_S,
  );
}

// Palette index of a noise cell at time t, or null when its block is dark. Whole blocks
// share a colour, re-rolled several times a second, each block slightly out of phase.
export function noiseColorIndex(
  col: number,
  row: number,
  t: number,
  paletteSize: number,
): number | null {
  const blockSize = blockSizeAt(t);
  const blockCol = Math.floor(col / blockSize);
  const blockRow = Math.floor(row / blockSize);
  const step = Math.floor(
    t * INTRO_COLOR_REROLL_HZ +
      hash3(blockCol, blockRow, INTRO_NOISE_PHASE_SALT) *
        INTRO_REROLL_PHASE_STEPS,
  );
  const salt = step * INTRO_NOISE_SALTS_PER_STEP;
  if (
    hash3(blockCol, blockRow, salt + INTRO_NOISE_FILL_SALT) >=
    INTRO_NOISE_FILL_RATIO
  ) {
    return null;
  }
  return Math.floor(
    hash3(blockCol, blockRow, salt + INTRO_NOISE_COLOR_SALT) * paletteSize,
  );
}

// A noise cell fills its square, leaving a gap only along the outer edges of its block, so
// a block reads as one big pixel.
export function noiseBlockRect(
  col: number,
  row: number,
  blockSize: number,
  cellPx: number,
): CellRect {
  const edgeGap = (index: number, edge: number) =>
    index % blockSize === edge ? INTRO_CELL_GAP_PX : 0;
  const gapLeft = edgeGap(col, 0);
  const gapTop = edgeGap(row, 0);
  const gapRight = edgeGap(col, blockSize - 1);
  const gapBottom = edgeGap(row, blockSize - 1);
  return {
    x: col * cellPx + gapLeft,
    y: row * cellPx + gapTop,
    width: cellPx - gapLeft - gapRight,
    height: cellPx - gapTop - gapBottom,
  };
}

export function fillCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
  insetPx: number,
) {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  fillInsetCell(context, x, y, size, insetPx);
  context.globalAlpha = 1;
}

function drawNoiseCell(
  context: CanvasRenderingContext2D,
  cell: IntroCell,
  cellPx: number,
  palette: IntroPalette,
  t: number,
) {
  const colorIndex = noiseColorIndex(
    cell.col,
    cell.row,
    t,
    palette.noise.length,
  );
  const color = colorIndex === null ? undefined : palette.noise[colorIndex];
  if (!color) return;
  const blockSize = blockSizeAt(t);
  const isLit =
    hash3(
      Math.floor(cell.col / blockSize),
      Math.floor(cell.row / blockSize),
      INTRO_NOISE_DENSITY_SALT,
    ) <
    densityAt(t) + INTRO_DENSITY_SLACK;
  if (!isLit) return;
  const rect = noiseBlockRect(cell.col, cell.row, blockSize, cellPx);
  context.fillStyle = color;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
}

// A locked noise cell keeps the colour it had when it locked and fades out.
function drawFadingNoiseCell(
  context: CanvasRenderingContext2D,
  cell: IntroCell,
  cellPx: number,
  palette: IntroPalette,
  t: number,
) {
  const fadeProgress = (t - cell.lockS) / INTRO_NOISE_FADE_S;
  if (fadeProgress >= 1) return;
  const colorIndex = noiseColorIndex(
    cell.col,
    cell.row,
    cell.lockS,
    palette.noise.length,
  );
  const color = colorIndex === null ? undefined : palette.noise[colorIndex];
  if (!color) return;
  fillCell(
    context,
    cell.col * cellPx,
    cell.row * cellPx,
    cellPx,
    color,
    1 - fadeProgress,
    INTRO_CELL_GAP_PX,
  );
}

// Palette noise resolving into the wordmark: logo cells flash, then take their letter colour.
export function drawIntroPixels(
  context: CanvasRenderingContext2D,
  layout: IntroLayout,
  palette: IntroPalette,
  t: number,
  isLogoHidden: boolean,
) {
  const { cellPx } = layout;
  for (const cell of layout.cells) {
    if (t < cell.lockS) {
      drawNoiseCell(context, cell, cellPx, palette, t);
    } else if (!cell.logo) {
      drawFadingNoiseCell(context, cell, cellPx, palette, t);
    } else if (!isLogoHidden) {
      const isFlashing = t - cell.lockS < INTRO_FLASH_S;
      fillCell(
        context,
        cell.col * cellPx,
        cell.row * cellPx,
        cellPx,
        isFlashing
          ? palette.flash
          : letterColor(palette, cell.logo.letterIndex),
        1,
        INTRO_CELL_GAP_PX,
      );
    }
  }
}
