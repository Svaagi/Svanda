import { describe, expect, it } from 'vitest';

import { convexHull, isPointInPolygon, polygonBounds } from './geometry';

const SQUARE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('convexHull', () => {
  it('drops interior and collinear points', () => {
    const hull = convexHull([
      ...SQUARE,
      { x: 5, y: 5 },
      { x: 5, y: 0 },
      { x: 2, y: 8 },
    ]);

    expect(hull).toHaveLength(4);
    expect(hull).toEqual(expect.arrayContaining(SQUARE));
  });

  it('wraps a footprint and its shifted copy in one outline', () => {
    const shifted = SQUARE.map(({ x, y }) => ({ x: x + 4, y: y + 3 }));
    const hull = convexHull([...SQUARE, ...shifted]);

    expect(hull).toHaveLength(6);
    expect(hull).not.toContainEqual({ x: 10, y: 10 });
    expect(hull).not.toContainEqual({ x: 4, y: 3 });
  });

  it('returns degenerate input sorted', () => {
    expect(
      convexHull([
        { x: 3, y: 1 },
        { x: 1, y: 1 },
      ]),
    ).toEqual([
      { x: 1, y: 1 },
      { x: 3, y: 1 },
    ]);
  });
});

describe('isPointInPolygon', () => {
  it('tells inside from outside', () => {
    expect(isPointInPolygon({ x: 5, y: 5 }, SQUARE)).toBe(true);
    expect(isPointInPolygon({ x: 15, y: 5 }, SQUARE)).toBe(false);
    expect(isPointInPolygon({ x: 5, y: -1 }, SQUARE)).toBe(false);
  });

  it('works on a triangle hull', () => {
    const triangle = convexHull([
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 10, y: 20 },
    ]);

    expect(isPointInPolygon({ x: 10, y: 5 }, triangle)).toBe(true);
    expect(isPointInPolygon({ x: 2, y: 15 }, triangle)).toBe(false);
  });
});

describe('polygonBounds', () => {
  it('spans every vertex', () => {
    expect(polygonBounds(SQUARE)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 10,
      maxY: 10,
    });
  });
});
