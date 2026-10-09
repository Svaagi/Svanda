import { CELL_INSET_PX, GLYPH_ROWS } from 'constants/pixel';

import { layoutText, measureText } from './gridLayout';
import { type PixelLayout, toPixelCells } from './pixelCells';

// One line of full-width pixel letters; `colors` cycle per letter.
export function pixelWord(
  word: string,
  cellPx: number,
  colors: readonly string[],
): PixelLayout {
  const text = word.toUpperCase();
  return {
    cells: toPixelCells(layoutText(text), cellPx, CELL_INSET_PX, colors),
    width: Math.max(0, measureText(text)) * cellPx,
    height: GLYPH_ROWS * cellPx,
  };
}
