import { CELL_INSET_PX } from 'constants/pixel';
import {
  VENUE_BAND_ALPHA,
  VENUE_BAND_ALPHA_SPREAD,
  VENUE_BAND_SHADE_SALT,
  VENUE_BAND_SPARK_DARK_ALPHA,
  VENUE_BAND_SPARK_DARK_SHARE,
  VENUE_BAND_SPARK_LIGHT_ALPHA,
  VENUE_BAND_SPARK_SALT,
  VENUE_BAND_TORCH_ALPHA,
  VENUE_BAND_TORCH_TEXT_ALPHA,
  VENUE_BAND_TORCH_TEXT_MUTED_ALPHA,
  VENUE_BAND_TWINKLE_DECAY_EXPONENT,
  VENUE_BAND_TWINKLE_MIN_ALPHA,
} from 'constants/venues';
import type { Point } from 'lib/geometry';
import { HALF } from 'lib/math';
import { fillInsetCell, layoutText } from 'lib/pixel';
import { isTorchCellLit, torchLevel, twinkleAlpha } from 'lib/pixelEffects';
import { hash3 } from 'lib/random';

import { isOnBand, type VenueBandLayout } from './venueBandLayout';

// Canvas colours resolved from the theme tokens.
export type VenueBandPalette = {
  text: string;
  textMuted: string;
  sparkLight: string;
  sparkDark: string;
  torch: string;
  torchOnText: string;
};

export type VenueBandFrame = {
  layout: VenueBandLayout;
  palette: VenueBandPalette;
  // The venue's own colour.
  color: string;
  // The canvas's top left on the stage, in stage px: background grid cells (the same hashes
  // as the page background) and the torch are counted from there.
  origin: Point;
  // The pointer in stage px, or null when the torch is off.
  torch: Point | null;
  t: number;
};

type CellPainter = {
  context: CanvasRenderingContext2D;
  frame: VenueBandFrame;
};

function fillCell({ context, frame }: CellPainter, col: number, row: number) {
  const { cell } = frame.layout;
  fillInsetCell(context, col * cell, row * cell, cell, CELL_INSET_PX);
}

// The background grid cell under a band cell, for hashes that must match the page grid.
function gridCell(
  { layout, origin }: VenueBandFrame,
  col: number,
  row: number,
) {
  return {
    col: Math.round(origin.x / layout.cell) + col,
    row: Math.round(origin.y / layout.cell) + row,
  };
}

// The torch level on a band cell, 0 when unlit (also by the rim dither).
function torchLevelAt(frame: VenueBandFrame, col: number, row: number) {
  const { torch, origin, layout } = frame;
  if (!torch) return 0;
  const { cell } = layout;
  const level = torchLevel(
    Math.hypot(
      origin.x + (col + HALF) * cell - torch.x,
      origin.y + (row + HALF) * cell - torch.y,
    ),
  );
  const grid = gridCell(frame, col, row);
  return isTorchCellLit(grid.col, grid.row, level) ? level : 0;
}

function drawBandCell(painter: CellPainter, col: number, row: number) {
  const { context, frame } = painter;
  const { palette, t } = frame;
  const grid = gridCell(frame, col, row);
  context.globalAlpha =
    VENUE_BAND_ALPHA +
    VENUE_BAND_ALPHA_SPREAD * hash3(grid.col, grid.row, VENUE_BAND_SHADE_SALT);
  context.fillStyle = frame.color;
  fillCell(painter, col, row);

  const torch = torchLevelAt(frame, col, row);
  if (torch > 0) {
    context.globalAlpha = torch * VENUE_BAND_TORCH_ALPHA;
    context.fillStyle = palette.torch;
    fillCell(painter, col, row);
  }

  const spark = twinkleAlpha(col, row, t, VENUE_BAND_TWINKLE_DECAY_EXPONENT);
  if (spark < VENUE_BAND_TWINKLE_MIN_ALPHA) return;
  const isDark =
    hash3(col, row, VENUE_BAND_SPARK_SALT) > VENUE_BAND_SPARK_DARK_SHARE;
  context.globalAlpha =
    spark *
    (isDark ? VENUE_BAND_SPARK_DARK_ALPHA : VENUE_BAND_SPARK_LIGHT_ALPHA);
  context.fillStyle = isDark ? palette.sparkDark : palette.sparkLight;
  fillCell(painter, col, row);
}

function drawBand(painter: CellPainter) {
  const { layout } = painter.frame;
  const { cell } = layout;
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      if (isOnBand((col + HALF) * cell, (row + HALF) * cell, layout)) {
        drawBandCell(painter, col, row);
      }
    }
  }
}

// The name in solid cells, one grid cell per glyph pixel; the torch tints them too.
function drawName(painter: CellPainter) {
  const { context, frame } = painter;
  const { layout, palette } = frame;
  for (const line of layout.lines) {
    const cells = layoutText(line.text.toUpperCase(), false, {
      col: layout.textCol,
      row: line.row,
    });
    const tint = line.isPrimary ? palette.torchOnText : palette.torch;
    const tintAlpha = line.isPrimary
      ? VENUE_BAND_TORCH_TEXT_ALPHA
      : VENUE_BAND_TORCH_TEXT_MUTED_ALPHA;
    for (const { col, row } of cells) {
      context.globalAlpha = 1;
      context.fillStyle = line.isPrimary ? palette.text : palette.textMuted;
      fillCell(painter, col, row);
      const torch = torchLevelAt(frame, col, row);
      if (torch === 0) continue;
      context.globalAlpha = torch * tintAlpha;
      context.fillStyle = tint;
      fillCell(painter, col, row);
    }
  }
}

// One frame of a venue band: the twinkling diagonal band in the venue colour, then the name
// over it, both lit by the pixel torch.
export function drawVenueBand(
  context: CanvasRenderingContext2D,
  frame: VenueBandFrame,
) {
  const { width, height } = frame.layout;
  context.clearRect(0, 0, width, height);
  const painter = { context, frame };
  drawBand(painter);
  drawName(painter);
  context.globalAlpha = 1;
}
