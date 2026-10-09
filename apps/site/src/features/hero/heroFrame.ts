import {
  FLOOR_SHADOW_MIN_ALPHA,
  FLOOR_SHADOW_MIN_POINTS,
  MARK_ALPHA,
  MARK_FADE_RATE,
  MARK_GRADIENT_STEPS,
  MARK_LIT_STEPS,
  TORCH_RADIUS_PX,
  TWINKLE_ALPHA,
  TWINKLE_MIN_ALPHA,
  TWINKLE_SHADE_SALT,
  TWINKLE_SHADE_STEPS,
} from 'constants/hero';
import { CELL_INSET_PX } from 'constants/pixel';
import {
  type FloorShadow,
  type StagePointer,
  stagePointerToPx,
} from 'features/stage';
import { convexHull, isPointInPolygon, polygonBounds } from 'lib/geometry';
import { clamp } from 'lib/math';
import { BITMAP, bitmapWidth, fillInsetCell, layoutBitmap } from 'lib/pixel';
import { hash3 } from 'lib/random';

import type { HeroLayout } from './heroLayout';
import { type HeroPalette, shadeIndex } from './heroPalette';
import { isTorchCellLit, torchLevel } from './heroTorch';
import { twinkleAlpha } from './heroTwinkle';

export type HeroFrameInput = {
  vp: number;
  pointer: StagePointer;
  floorShadow: FloorShadow | null;
};

type HeroCanvas = {
  context: CanvasRenderingContext2D;
  layout: HeroLayout;
  palette: HeroPalette;
};

const MARK_MODULES = layoutBitmap(BITMAP);
const MARK_COLS = bitmapWidth(BITMAP);
const HALF = 0.5;

function fillCell({ context, layout }: HeroCanvas, col: number, row: number) {
  const { cellPx } = layout;
  fillInsetCell(context, col * cellPx, row * cellPx, cellPx, CELL_INSET_PX);
}

// Cells entirely behind the header are skipped.
const isBelowNav = (row: number, { cellPx, navHeightPx }: HeroLayout) =>
  (row + 1) * cellPx >= navHeightPx;

function drawTwinkle(canvas: HeroCanvas, t: number) {
  const { context, layout, palette } = canvas;
  for (let row = 0; row < layout.rows; row++) {
    if (!isBelowNav(row, layout)) continue;
    for (let col = 0; col < layout.cols; col++) {
      const alpha = twinkleAlpha(col, row, t);
      if (alpha <= TWINKLE_MIN_ALPHA) continue;
      const shade = shadeIndex(
        hash3(col, row, TWINKLE_SHADE_SALT),
        TWINKLE_SHADE_STEPS,
      );
      context.globalAlpha = alpha * TWINKLE_ALPHA;
      context.fillStyle = palette.cellShades[shade] ?? '';
      fillCell(canvas, col, row);
    }
  }
}

// The wordmark in greys, a left to right gradient, brightened where a cell twinkles.
function drawGhostMark(canvas: HeroCanvas, alpha: number, t: number) {
  const { context, layout, palette } = canvas;
  const { markScale, markCol, markRow } = layout;
  context.globalAlpha = alpha;
  for (const module of MARK_MODULES) {
    const shades =
      palette.markShades[
        shadeIndex(module.col / MARK_COLS, MARK_GRADIENT_STEPS)
      ] ?? [];
    for (let subRow = 0; subRow < markScale; subRow++) {
      for (let subCol = 0; subCol < markScale; subCol++) {
        const col = markCol + module.col * markScale + subCol;
        const row = markRow + module.row * markScale + subRow;
        const lit = shadeIndex(twinkleAlpha(col, row, t), MARK_LIT_STEPS);
        context.fillStyle = shades[lit] ?? '';
        fillCell(canvas, col, row);
      }
    }
  }
}

function drawTorch(canvas: HeroCanvas, pointer: StagePointer) {
  const { context, layout, palette } = canvas;
  const { cellPx } = layout;
  const centre = stagePointerToPx(pointer, layout.width, layout.height);
  const centreCol = Math.round(centre.x / cellPx);
  const centreRow = Math.round(centre.y / cellPx);
  const reach = Math.ceil(TORCH_RADIUS_PX / cellPx);
  context.fillStyle = palette.light;
  for (let row = centreRow - reach; row <= centreRow + reach; row++) {
    if (!isBelowNav(row, layout)) continue;
    for (let col = centreCol - reach; col <= centreCol + reach; col++) {
      const distance = Math.hypot(
        (col + HALF) * cellPx - centre.x,
        (row + HALF) * cellPx - centre.y,
      );
      const level = torchLevel(distance);
      if (!isTorchCellLit(col, row, level)) continue;
      context.globalAlpha = level * palette.torchAlpha;
      fillCell(canvas, col, row);
    }
  }
}

// The convex hull of the published footprint, filled cell by cell on the grid.
function drawFloorShadow(canvas: HeroCanvas, floorShadow: FloorShadow) {
  const { context, layout, palette } = canvas;
  const { cellPx } = layout;
  const hull = convexHull(floorShadow.points);
  if (hull.length < FLOOR_SHADOW_MIN_POINTS) return;
  const bounds = polygonBounds(hull);
  context.fillStyle = palette.light;
  context.globalAlpha = floorShadow.alpha * palette.shadowAlpha;
  const lastRow = Math.ceil(bounds.maxY / cellPx);
  const lastCol = Math.ceil(bounds.maxX / cellPx);
  for (let row = Math.floor(bounds.minY / cellPx); row <= lastRow; row++) {
    if (!isBelowNav(row, layout)) continue;
    for (let col = Math.floor(bounds.minX / cellPx); col <= lastCol; col++) {
      const cellCentre = {
        x: (col + HALF) * cellPx,
        y: (row + HALF) * cellPx,
      };
      if (isPointInPolygon(cellCentre, hull)) fillCell(canvas, col, row);
    }
  }
}

export function markAlphaAt(vp: number): number {
  return MARK_ALPHA * (1 - clamp(vp * MARK_FADE_RATE, 0, 1));
}

export function drawHeroFrame(
  canvas: HeroCanvas,
  { vp, pointer, floorShadow }: HeroFrameInput,
  t: number,
) {
  const { context, layout } = canvas;
  context.clearRect(0, 0, layout.width, layout.height);
  drawTwinkle(canvas, t);
  const markAlpha = markAlphaAt(vp);
  if (markAlpha > 0) drawGhostMark(canvas, markAlpha, t);
  if (pointer.isActive) drawTorch(canvas, pointer);
  if (floorShadow && floorShadow.alpha > FLOOR_SHADOW_MIN_ALPHA) {
    drawFloorShadow(canvas, floorShadow);
  }
  context.globalAlpha = 1;
}
