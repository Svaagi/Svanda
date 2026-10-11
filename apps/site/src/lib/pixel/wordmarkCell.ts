import {
  WORDMARK_CELL_MAX_PX,
  WORDMARK_CELL_MIN_PX,
  WORDMARK_MARGIN_PX,
} from 'constants/pixel';
import { clamp } from 'lib/math';

import { BITMAP } from './bitmaps';
import { bitmapWidth } from './gridLayout';

const WORDMARK_COLS = bitmapWidth(BITMAP);

// The cell size at which the wordmark spans the width minus a margin, bounded both ways.
export function wordmarkCellPx(width: number): number {
  return clamp(
    Math.floor((width - WORDMARK_MARGIN_PX) / WORDMARK_COLS),
    WORDMARK_CELL_MIN_PX,
    WORDMARK_CELL_MAX_PX,
  );
}
