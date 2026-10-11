import { MODEL_DISPLAY_RECT } from 'constants/jukebox3d';
import { describe, expect, it } from 'vitest';

import {
  copyScreenQuad,
  createScreenQuad,
  displayCorners,
  isSameScreenQuad,
  projectScreenQuadInto,
} from './screenQuad';

// Orthographic, 2 px per unit, y down, origin at (500, 400).
const project = ({ x, y }: { x: number; y: number }) => ({
  x: 500 + x * 2,
  y: 400 - y * 2,
});

function projectDisplay() {
  const quad = createScreenQuad();
  projectScreenQuadInto(quad, displayCorners(), project);
  return quad;
}

describe('displayCorners', () => {
  it('spans the display rect clockwise from the top left, in front of the glass', () => {
    const { topLeft, topRight, bottomRight, bottomLeft } = displayCorners();

    expect(topLeft).toMatchObject({
      x: MODEL_DISPLAY_RECT.minX,
      y: MODEL_DISPLAY_RECT.maxY,
    });
    expect(topRight).toMatchObject({
      x: MODEL_DISPLAY_RECT.maxX,
      y: MODEL_DISPLAY_RECT.maxY,
    });
    expect(bottomRight).toMatchObject({
      x: MODEL_DISPLAY_RECT.maxX,
      y: MODEL_DISPLAY_RECT.minY,
    });
    expect(bottomLeft).toMatchObject({
      x: MODEL_DISPLAY_RECT.minX,
      y: MODEL_DISPLAY_RECT.minY,
    });
    expect(topLeft.z).toBeGreaterThan(45);
  });
});

describe('projectScreenQuadInto', () => {
  it('projects every corner to stage px, rounded to a tenth', () => {
    const quad = projectDisplay();

    expect(quad.topLeft).toEqual({ x: 297, y: -52.6 });
    expect(quad.topRight).toEqual({ x: 698, y: -52.6 });
    expect(quad.bottomRight).toEqual({ x: 698, y: 641 });
    expect(quad.bottomLeft).toEqual({ x: 297, y: 641 });
  });

  it('fills the given quad in place', () => {
    const quad = createScreenQuad();
    const { topLeft } = quad;

    projectScreenQuadInto(quad, displayCorners(), project);

    expect(quad.topLeft).toBe(topLeft);
    expect(topLeft.x).toBe(297);
  });
});

describe('copyScreenQuad', () => {
  it('copies every corner so later fills leave the copy alone', () => {
    const quad = projectDisplay();
    const copy = copyScreenQuad(quad);

    quad.topLeft.x = 0;

    expect(copy.topLeft.x).toBe(297);
    expect(isSameScreenQuad(copy, projectDisplay())).toBe(true);
  });
});

describe('isSameScreenQuad', () => {
  const quad = projectDisplay();

  it('treats equal corners as the same quad', () => {
    expect(isSameScreenQuad(quad, projectDisplay())).toBe(true);
    expect(isSameScreenQuad(null, null)).toBe(true);
  });

  it('sees any moved corner and a missing quad', () => {
    expect(
      isSameScreenQuad(quad, {
        ...quad,
        bottomLeft: { x: quad.bottomLeft.x, y: quad.bottomLeft.y + 0.1 },
      }),
    ).toBe(false);
    expect(isSameScreenQuad(quad, null)).toBe(false);
    expect(isSameScreenQuad(null, quad)).toBe(false);
  });
});
