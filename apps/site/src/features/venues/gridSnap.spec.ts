import { describe, expect, it } from 'vitest';

import {
  type FrameSnapInput,
  nearestGridShift,
  snapFrame,
  snapHeading,
} from './gridSnap';

const grid = { cell: 14, originX: 0, originY: 0 };

const landscape: FrameSnapInput = {
  grid,
  left: 100,
  top: 150,
  availableWidth: 1000,
  stageWidth: 1280,
  stageHeight: 800,
  reserveBelow: 90,
  isPortrait: false,
};

const portrait: FrameSnapInput = {
  grid,
  left: 24,
  top: 160,
  availableWidth: 342,
  stageWidth: 390,
  stageHeight: 844,
  reserveBelow: 150,
  isPortrait: true,
};

const isOnGrid = (position: number, origin: number, cell: number) =>
  (((position - origin) % cell) + cell) % cell === 0;

describe('nearestGridShift', () => {
  it('moves a position onto the nearest grid line, within half a cell', () => {
    expect(nearestGridShift(100, 0, 14)).toBe(-2);
    expect(nearestGridShift(96, 0, 14)).toBe(2);
    expect(nearestGridShift(98, 0, 14)).toBe(0);
    expect(nearestGridShift(10, 3, 14)).toBe(7);
  });

  it('follows a grid origin on either side of the position', () => {
    expect(nearestGridShift(20, 25, 10)).toBe(5);
    expect(nearestGridShift(20, -1, 10)).toBe(-1);
  });
});

describe('snapFrame', () => {
  it('sizes a landscape frame to whole cells at 16:9 within the available width', () => {
    const snap = snapFrame(landscape);

    expect(snap.width).toBe(71 * 14);
    expect(snap.height).toBe(40 * 14);
    expect(snap.width).toBeLessThanOrEqual(landscape.availableWidth);
    expect(isOnGrid(landscape.left + snap.shiftX, 0, 14)).toBe(true);
    expect(isOnGrid(landscape.top + snap.shiftY, 0, 14)).toBe(true);
    expect(Math.abs(snap.shiftX)).toBeLessThanOrEqual(7);
  });

  it('narrows a landscape frame that would run into the tabs, keeping it centred', () => {
    const snap = snapFrame({ ...landscape, stageHeight: 600 });
    // (600 - 150 - 90) / 14 = 25 whole rows: 44 columns at 16:9.
    expect(snap.width).toBe(44 * 14);
    expect(snap.height).toBe(25 * 14);
    const left = landscape.left + snap.shiftX;
    expect(isOnGrid(left, 0, 14)).toBe(true);
    const marginLeft = left - landscape.left;
    const marginRight = landscape.availableWidth - snap.width - marginLeft;
    // Centred to within a cell either way, plus the width left over from whole cells.
    expect(Math.abs(marginLeft - marginRight)).toBeLessThanOrEqual(2 * 14);
  });

  it('snaps to a grid with an offset origin', () => {
    const offsetGrid = { cell: 12, originX: 5, originY: -3 };
    const snap = snapFrame({ ...landscape, grid: offsetGrid });

    expect(isOnGrid(landscape.left + snap.shiftX, 5, 12)).toBe(true);
    expect(isOnGrid(landscape.top + snap.shiftY, -3, 12)).toBe(true);
    expect(snap.cell).toBe(12);
  });

  it('runs a portrait frame edge to edge, centred on the stage, two cells short', () => {
    const snap = snapFrame(portrait);
    // 27 whole columns across 390 px; the frame takes 25 of them.
    expect(snap.width).toBe(25 * 14);
    const left = portrait.left + snap.shiftX;
    expect(left).toBe(14);
    expect(left + snap.width).toBeLessThanOrEqual(portrait.stageWidth);
    // 4:5 of 25 columns rounds to 31 rows, which fits above the tabs.
    expect(snap.height).toBe(31 * 14);
  });

  it('shortens a portrait frame that would run into the tabs', () => {
    const snap = snapFrame({ ...portrait, reserveBelow: 394 });
    // (844 - 160 - 394) / 14 = 20 whole rows.
    expect(snap.height).toBe(20 * 14);
  });

  it('keeps a minimum frame on tiny stages', () => {
    const snap = snapFrame({
      ...landscape,
      availableWidth: 40,
      stageWidth: 60,
    });

    expect(snap.width).toBe(8 * 14);
    expect(snap.height).toBe(5 * 14);
  });

  it('centres the chevrons on whole cells', () => {
    expect(snapFrame(landscape).chevronLeft).toBe(33 * 14);
    expect(snapFrame(portrait).chevronLeft).toBe(10 * 14);
  });
});

describe('snapHeading', () => {
  it('wraps within the content width in landscape and snaps onto the grid', () => {
    const snap = snapHeading({
      grid,
      left: 503,
      top: 90,
      contentWidth: 1100,
      stageWidth: 1280,
      isPortrait: false,
    });

    expect(snap.cols).toBe(78);
    expect(isOnGrid(503 + snap.shiftX, 0, 14)).toBe(true);
    expect(isOnGrid(90 + snap.shiftY, 0, 14)).toBe(true);
  });

  it('wraps within the edge to edge frame width in portrait', () => {
    const snap = snapHeading({
      grid,
      left: 40,
      top: 90,
      contentWidth: 300,
      stageWidth: 390,
      isPortrait: true,
    });

    expect(snap.cols).toBe(25);
  });
});
