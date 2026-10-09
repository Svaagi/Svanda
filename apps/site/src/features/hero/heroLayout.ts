import {
  HERO_CELL_EXTRA_PX,
  HERO_CELL_FALLBACK_MIN_PX,
  HERO_CELL_MIN_PX,
  HERO_MARGIN_LANDSCAPE_PX,
  HERO_MARGIN_PORTRAIT_PX,
  HERO_MARK_EDGE_PX,
  HERO_MARK_OFFSET_Y_PX,
  HERO_MARK_PORTRAIT_CENTRE_RATIO,
  HERO_MARK_SCALE_LANDSCAPE,
  HERO_MARK_SCALE_PORTRAIT,
} from 'constants/hero';
import { BITMAP, bitmapWidth, wordmarkCellPx } from 'lib/pixel';

const MARK_COLS = bitmapWidth(BITMAP);
const MARK_ROWS = BITMAP.length;
const CENTRE_RATIO = 0.5;

// Cell (col, row) covers [col * cellPx, (col + 1) * cellPx) in stage px from the origin.
export type HeroLayout = {
  width: number;
  height: number;
  isPortrait: boolean;
  // Rows entirely above this are behind the header.
  navHeightPx: number;
  cellPx: number;
  cols: number;
  rows: number;
  // Grid cells per wordmark module, and the wordmark's top left on the grid.
  markScale: number;
  markCol: number;
  markRow: number;
};

function gridCellPx(width: number, isPortrait: boolean): number {
  const margin = isPortrait
    ? HERO_MARGIN_PORTRAIT_PX
    : HERO_MARGIN_LANDSCAPE_PX;
  const cellPx = Math.max(
    HERO_CELL_MIN_PX,
    Math.min(
      wordmarkCellPx(width) + HERO_CELL_EXTRA_PX,
      Math.floor((width - margin) / MARK_COLS),
    ),
  );
  if (isPortrait) return cellPx;
  // A double-size wordmark wider than the screen shrinks the whole grid instead.
  const maxMarkPx = width - HERO_MARK_EDGE_PX;
  if (cellPx * HERO_MARK_SCALE_LANDSCAPE * MARK_COLS <= maxMarkPx)
    return cellPx;
  return Math.max(
    HERO_CELL_FALLBACK_MIN_PX,
    Math.floor(maxMarkPx / (MARK_COLS * HERO_MARK_SCALE_LANDSCAPE)),
  );
}

// The stage-wide background grid and the ghost wordmark snapped onto it.
export function createHeroLayout(
  width: number,
  height: number,
  navHeightPx = 0,
): HeroLayout {
  const isPortrait = height > width;
  const cellPx = gridCellPx(width, isPortrait);
  const markScale = isPortrait
    ? HERO_MARK_SCALE_PORTRAIT
    : HERO_MARK_SCALE_LANDSCAPE;
  const markPx = cellPx * markScale;
  const markTopPx = isPortrait
    ? height * HERO_MARK_PORTRAIT_CENTRE_RATIO -
      MARK_ROWS * markPx * CENTRE_RATIO
    : (height - MARK_ROWS * markPx) * CENTRE_RATIO + HERO_MARK_OFFSET_Y_PX;
  const markLeftPx = (width - MARK_COLS * markPx) * CENTRE_RATIO;

  return {
    width,
    height,
    isPortrait,
    navHeightPx,
    cellPx,
    cols: Math.ceil(width / cellPx),
    rows: Math.ceil(height / cellPx),
    markScale,
    markCol: Math.floor(Math.round(markLeftPx) / cellPx),
    markRow: Math.floor(Math.round(markTopPx) / cellPx),
  };
}
