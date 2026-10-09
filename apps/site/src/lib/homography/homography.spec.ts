import type { Point, Quad } from 'lib/geometry';
import { describe, expect, it } from 'vitest';

import {
  boxToQuadHomography,
  type Homography,
  homographyToMatrix3d,
} from './homography';

const WIDTH = 540;
const HEIGHT = 960;

function apply(homography: Homography, { x, y }: Point): Point {
  const [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0] =
    homography;
  const w = g * x + h * y + i;
  return { x: (a * x + b * y + c) / w, y: (d * x + e * y + f) / w };
}

function expectPoint(actual: Point, expected: Point) {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
}

function expectBoxOnQuad(quad: Quad): Homography {
  const homography = boxToQuadHomography(WIDTH, HEIGHT, quad);
  if (!homography) throw new Error('expected a homography');
  expectPoint(apply(homography, { x: 0, y: 0 }), quad.topLeft);
  expectPoint(apply(homography, { x: WIDTH, y: 0 }), quad.topRight);
  expectPoint(apply(homography, { x: WIDTH, y: HEIGHT }), quad.bottomRight);
  expectPoint(apply(homography, { x: 0, y: HEIGHT }), quad.bottomLeft);
  return homography;
}

const BOX: Quad = {
  topLeft: { x: 0, y: 0 },
  topRight: { x: WIDTH, y: 0 },
  bottomRight: { x: WIDTH, y: HEIGHT },
  bottomLeft: { x: 0, y: HEIGHT },
};

// A display turned away to the right: the far edge is shorter.
const PERSPECTIVE: Quad = {
  topLeft: { x: 812.4, y: 118.2 },
  topRight: { x: 1104.9, y: 160.5 },
  bottomRight: { x: 1098.3, y: 688.1 },
  bottomLeft: { x: 806.7, y: 742.6 },
};

function diagonalsCrossing({
  topLeft: a,
  bottomRight: b,
  topRight: c,
  bottomLeft: d,
}: Quad): Point {
  const denominator = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  const t =
    ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / denominator;
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}

describe('boxToQuadHomography', () => {
  it('is the identity when the quad is the box itself', () => {
    const homography = expectBoxOnQuad(BOX);

    [1, 0, 0, 0, 1, 0, 0, 0, 1].forEach((value, i) =>
      expect(homography[i]).toBeCloseTo(value, 9),
    );
  });

  it('is a plain scale and shift for an axis aligned rectangle', () => {
    const homography = expectBoxOnQuad({
      topLeft: { x: 100, y: 50 },
      topRight: { x: 370, y: 50 },
      bottomRight: { x: 370, y: 530 },
      bottomLeft: { x: 100, y: 530 },
    });

    expect(homography[0]).toBeCloseTo(0.5);
    expect(homography[4]).toBeCloseTo(0.5);
    expect(homography[2]).toBeCloseTo(100);
    expect(homography[5]).toBeCloseTo(50);
    expect(homography[6]).toBeCloseTo(0);
    expect(homography[7]).toBeCloseTo(0);
  });

  it('maps every corner of the box onto a perspective quad', () => {
    const homography = expectBoxOnQuad(PERSPECTIVE);

    expect(homography[6]).not.toBeCloseTo(0, 6);
  });

  it('keeps lines straight: the box centre lands where the quad diagonals cross', () => {
    const homography = expectBoxOnQuad(PERSPECTIVE);

    expectPoint(
      apply(homography, { x: WIDTH / 2, y: HEIGHT / 2 }),
      diagonalsCrossing(PERSPECTIVE),
    );
  });

  it('maps onto a mirrored (back facing) quad', () => {
    expectBoxOnQuad({
      topLeft: BOX.topRight,
      topRight: BOX.topLeft,
      bottomRight: BOX.bottomLeft,
      bottomLeft: BOX.bottomRight,
    });
  });

  it('returns null for a degenerate quad', () => {
    const point = { x: 10, y: 10 };
    expect(
      boxToQuadHomography(WIDTH, HEIGHT, {
        topLeft: point,
        topRight: point,
        bottomRight: point,
        bottomLeft: point,
      }),
    ).toBeNull();
    expect(
      boxToQuadHomography(WIDTH, HEIGHT, {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 10, y: 0 },
        bottomRight: { x: 20, y: 0 },
        bottomLeft: { x: 30, y: 0 },
      }),
    ).toBeNull();
  });
});

describe('homographyToMatrix3d', () => {
  it('writes the identity as the CSS identity matrix', () => {
    expect(homographyToMatrix3d([1, 0, 0, 0, 1, 0, 0, 0, 1])).toBe(
      'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
    );
  });

  it('writes the translation and the perspective row in column major order', () => {
    expect(homographyToMatrix3d([2, 3, 40, 5, 6, 70, 0.1, 0.2, 1])).toBe(
      'matrix3d(2,5,0,0.1,3,6,0,0.2,0,0,1,0,40,70,0,1)',
    );
  });
});
