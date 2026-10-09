import { PIXEL_CURRENT_COLOR } from 'constants/pixel';

import type { GridCell } from './gridLayout';

// A drawn square in CSS pixels. `color` is a CSS colour value, normally a token reference.
export interface PixelCell {
  left: number;
  top: number;
  size: number;
  color: string;
}

export interface PixelLayout {
  cells: PixelCell[];
  width: number;
  height: number;
}

export function colorForLetter(
  colors: readonly string[],
  letterIndex: number,
): string {
  return colors[letterIndex % colors.length] ?? PIXEL_CURRENT_COLOR;
}

export function toPixelCells(
  gridCells: readonly GridCell[],
  cellPx: number,
  insetPx: number,
  colors: readonly string[],
): PixelCell[] {
  return gridCells.map(({ col, row, letterIndex }) => ({
    left: col * cellPx + insetPx,
    top: row * cellPx + insetPx,
    size: cellPx - insetPx - insetPx,
    color: colorForLetter(colors, letterIndex),
  }));
}

// One group per colour, so a renderer sets each fill once instead of per cell.
export function groupCellsByColor(
  cells: readonly PixelCell[],
): [color: string, cells: PixelCell[]][] {
  const groups = new Map<string, PixelCell[]>();
  cells.forEach((cell) => {
    const group = groups.get(cell.color) ?? [];
    group.push(cell);
    groups.set(cell.color, group);
  });
  return [...groups];
}
