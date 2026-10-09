import type { Bitmap } from './glyphs';
import { bitmapWidth, layoutBitmap } from './gridLayout';
import { type PixelLayout, toPixelCells } from './pixelCells';

// A fixed bitmap (wordmark, icon, chevron); `colors` cycle per letter, where letters are
// column runs separated by empty columns.
export function pixelBitmap(
  bitmap: Bitmap,
  cellPx: number,
  insetPx: number,
  colors: readonly string[],
): PixelLayout {
  return {
    cells: toPixelCells(layoutBitmap(bitmap), cellPx, insetPx, colors),
    width: bitmapWidth(bitmap) * cellPx,
    height: bitmap.length * cellPx,
  };
}
