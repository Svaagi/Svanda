import { GLYPH_GAP_COLS, SPACE_COLS } from 'constants/pixel';

import {
  type Bitmap,
  DIA,
  FALLBACK_GLYPH,
  FILLED_PIXEL,
  GLYPH,
  NARROW_G,
} from './glyphs';

// A filled cell on the module grid. `letterIndex` counts drawn glyphs (spaces excluded).
export interface GridCell {
  col: number;
  row: number;
  letterIndex: number;
}

interface GridOrigin {
  col: number;
  row: number;
}

const SPACE = ' ';
const ORIGIN: GridOrigin = { col: 0, row: 0 };

// Narrow glyphs cover letters and `&` only; digits and `.` keep their full-width shape.
export function resolveGlyph(char: string, isNarrow = false): Bitmap {
  const key = DIA[char] ?? char;
  return (isNarrow ? NARROW_G[key] : undefined) ?? GLYPH[key] ?? FALLBACK_GLYPH;
}

export function bitmapWidth(bitmap: Bitmap): number {
  return bitmap[0]?.length ?? 0;
}

// Width in columns of an upper-case run: glyphs, one gap between them, two per space.
export function measureText(text: string, isNarrow = false): number {
  let cols = 0;
  for (const char of text) {
    cols +=
      char === SPACE
        ? SPACE_COLS
        : bitmapWidth(resolveGlyph(char, isNarrow)) + GLYPH_GAP_COLS;
  }
  return cols - GLYPH_GAP_COLS;
}

function filledCells(
  bitmap: Bitmap,
  origin: GridOrigin,
  letterIndexAt: (col: number) => number,
): GridCell[] {
  return bitmap.flatMap((pattern, rowOffset) =>
    [...pattern].flatMap((pixel, colOffset) =>
      pixel === FILLED_PIXEL
        ? [
            {
              col: origin.col + colOffset,
              row: origin.row + rowOffset,
              letterIndex: letterIndexAt(colOffset),
            },
          ]
        : [],
    ),
  );
}

export function layoutText(
  text: string,
  isNarrow = false,
  origin: GridOrigin = ORIGIN,
): GridCell[] {
  const cells: GridCell[] = [];
  let col = origin.col;
  let letterIndex = 0;
  for (const char of text) {
    if (char === SPACE) {
      col += SPACE_COLS;
      continue;
    }
    const glyph = resolveGlyph(char, isNarrow);
    const glyphLetterIndex = letterIndex;
    cells.push(
      ...filledCells(glyph, { col, row: origin.row }, () => glyphLetterIndex),
    );
    col += bitmapWidth(glyph) + GLYPH_GAP_COLS;
    letterIndex += 1;
  }
  return cells;
}

// Letters of a bitmap are runs of columns separated by fully empty columns.
function columnLetterIndices(bitmap: Bitmap): number[] {
  const indices: number[] = [];
  let letterIndex = -1;
  let isPreviousEmpty = true;
  for (let col = 0; col < bitmapWidth(bitmap); col++) {
    const isEmpty = bitmap.every((pattern) => pattern[col] !== FILLED_PIXEL);
    if (!isEmpty && isPreviousEmpty) letterIndex += 1;
    isPreviousEmpty = isEmpty;
    indices.push(letterIndex);
  }
  return indices;
}

export function layoutBitmap(bitmap: Bitmap): GridCell[] {
  const letterIndices = columnLetterIndices(bitmap);
  return filledCells(bitmap, ORIGIN, (col) => letterIndices[col] ?? 0);
}
