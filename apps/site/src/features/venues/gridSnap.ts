import {
  VENUE_CHEVRON_COLS,
  VENUE_FRAME_ASPECT_LANDSCAPE,
  VENUE_FRAME_ASPECT_PORTRAIT,
  VENUE_FRAME_MIN_COLS,
  VENUE_FRAME_MIN_ROWS,
  VENUE_FRAME_PORTRAIT_EDGE_COLS,
} from 'constants/venues';
import { HALF } from 'lib/math';

// The background grid in stage px: lines at `origin + k * cell`.
export type GridLines = {
  cell: number;
  originX: number;
  originY: number;
};

// The shift (within half a cell either way) that moves `position` onto the nearest grid line.
export function nearestGridShift(
  position: number,
  origin: number,
  cell: number,
): number {
  const remainder = (((origin - position) % cell) + cell) % cell;
  return remainder > cell * HALF ? remainder - cell : remainder;
}

// The first grid line at or right of the stage's left edge.
const firstLineX = ({ cell, originX }: GridLines) =>
  originX + Math.ceil(-originX / cell) * cell;

// Whole grid columns from the first grid line to the right edge of the stage.
const columnsAcross = (grid: GridLines, stageWidth: number) =>
  Math.floor((stageWidth - firstLineX(grid)) / grid.cell);

export type FrameSnapInput = {
  grid: GridLines;
  // The frame's untransformed top left and the width it may fill, in stage px.
  left: number;
  top: number;
  availableWidth: number;
  stageWidth: number;
  stageHeight: number;
  // Height the frame must leave free below it (the tabs, their gap, the page padding).
  reserveBelow: number;
  isPortrait: boolean;
};

export type FrameSnap = {
  cell: number;
  width: number;
  height: number;
  // Translation onto the grid.
  shiftX: number;
  shiftY: number;
  // The left edge of the centred chevrons, on the grid.
  chevronLeft: number;
};

// Whole rows between the frame's top and the room it leaves below.
const fitRows = ({ grid, top, stageHeight, reserveBelow }: FrameSnapInput) =>
  Math.floor((stageHeight - Math.max(0, top) - reserveBelow) / grid.cell);

function portraitFrame(input: FrameSnapInput) {
  const { grid, stageWidth } = input;
  const { cols: aspectCols, rows: aspectRows } = VENUE_FRAME_ASPECT_PORTRAIT;
  const total = columnsAcross(grid, stageWidth);
  const cols = Math.max(
    VENUE_FRAME_MIN_COLS,
    total - VENUE_FRAME_PORTRAIT_EDGE_COLS,
  );
  const rows = Math.max(
    VENUE_FRAME_MIN_ROWS,
    Math.min(Math.round((cols * aspectRows) / aspectCols), fitRows(input)),
  );
  // Edge to edge: centred on the stage, whatever the padding around the frame.
  const centredLeft =
    firstLineX(grid) + Math.floor((total - cols) * HALF) * grid.cell;
  return { cols, rows, shiftX: centredLeft - input.left };
}

function landscapeFrame(input: FrameSnapInput) {
  const { grid, left, availableWidth } = input;
  const { cols: aspectCols, rows: aspectRows } = VENUE_FRAME_ASPECT_LANDSCAPE;
  const widthCols = Math.floor(availableWidth / grid.cell);
  const cols = Math.max(
    VENUE_FRAME_MIN_COLS,
    Math.min(widthCols, Math.floor((fitRows(input) * aspectCols) / aspectRows)),
  );
  const rows = Math.max(
    VENUE_FRAME_MIN_ROWS,
    Math.round((cols * aspectRows) / aspectCols),
  );
  // A frame narrowed to fit the height stays centred in the available width.
  const inset = Math.max(0, Math.floor((widthCols - cols) * HALF)) * grid.cell;
  return {
    cols,
    rows,
    shiftX: inset + nearestGridShift(left + inset, grid.originX, grid.cell),
  };
}

// The frame resized to whole grid cells and moved onto the grid, so its edges run along the
// background grid lines. Landscape keeps 16:9 within the available width; portrait runs edge
// to edge at 4:5. Either way it stays short enough to leave `reserveBelow` free.
export function snapFrame(input: FrameSnapInput): FrameSnap {
  const { grid, top, isPortrait } = input;
  const { cols, rows, shiftX } = isPortrait
    ? portraitFrame(input)
    : landscapeFrame(input);
  return {
    cell: grid.cell,
    width: cols * grid.cell,
    height: rows * grid.cell,
    shiftX,
    shiftY: nearestGridShift(top, grid.originY, grid.cell),
    chevronLeft: Math.floor((cols - VENUE_CHEVRON_COLS) * HALF) * grid.cell,
  };
}

export type HeadingSnapInput = {
  grid: GridLines;
  left: number;
  top: number;
  contentWidth: number;
  stageWidth: number;
  isPortrait: boolean;
};

export type HeadingSnap = {
  // Grid columns the heading may span (it wraps beyond that).
  cols: number;
  shiftX: number;
  shiftY: number;
};

// The heading moved onto the grid, wrapping within the content width (landscape) or the
// frame's edge to edge width (portrait).
export function snapHeading({
  grid,
  left,
  top,
  contentWidth,
  stageWidth,
  isPortrait,
}: HeadingSnapInput): HeadingSnap {
  return {
    cols: isPortrait
      ? columnsAcross(grid, stageWidth) - VENUE_FRAME_PORTRAIT_EDGE_COLS
      : Math.floor(contentWidth / grid.cell),
    shiftX: nearestGridShift(left, grid.originX, grid.cell),
    shiftY: nearestGridShift(top, grid.originY, grid.cell),
  };
}
