import {
  CQ_CELL_FILL_RATIO,
  CQ_DECIMALS_SCALE,
  GLYPH_ROWS,
} from 'constants/pixel';

import { layoutText, measureText } from './gridLayout';
import { colorForLetter } from './pixelCells';

// Lengths are CSS strings in container-query width units.
export interface CqPixelCell {
  left: string;
  top: string;
  size: string;
  color: string;
}

export interface CqPixelLayout {
  cells: CqPixelCell[];
  width: string;
  height: string;
}

function toCqw(value: number): string {
  return `${Math.round(value * CQ_DECIMALS_SCALE) / CQ_DECIMALS_SCALE}cqw`;
}

// Pixel text that scales with its container (`cellCqw` is one module in cqw).
export function pixelCq(
  word: string,
  cellCqw: number,
  colors: readonly string[],
): CqPixelLayout {
  const text = word.toUpperCase();
  const size = toCqw(cellCqw * CQ_CELL_FILL_RATIO);
  return {
    cells: layoutText(text).map(({ col, row, letterIndex }) => ({
      left: toCqw(col * cellCqw),
      top: toCqw(row * cellCqw),
      size,
      color: colorForLetter(colors, letterIndex),
    })),
    width: toCqw(Math.max(0, measureText(text)) * cellCqw),
    height: toCqw(GLYPH_ROWS * cellCqw),
  };
}
