import type { Point, Quad } from 'lib/geometry';

// A 3x3 projective transform, row major, normalised so its last entry is 1.
export type Homography = readonly number[];

type Matrix3 = number[];
type Vector3 = [number, number, number];

// Below this the transform sends points to infinity: the quad is degenerate.
const DEGENERATE_EPSILON = 1e-9;
const LAST_ENTRY = 8;

/* eslint-disable @typescript-eslint/no-magic-numbers -- 3x3 matrix entry indices */
const at = (matrix: Matrix3, index: number) => matrix[index] ?? 0;

function adjugate(m: Matrix3): Matrix3 {
  return [
    at(m, 4) * at(m, 8) - at(m, 5) * at(m, 7),
    at(m, 2) * at(m, 7) - at(m, 1) * at(m, 8),
    at(m, 1) * at(m, 5) - at(m, 2) * at(m, 4),
    at(m, 5) * at(m, 6) - at(m, 3) * at(m, 8),
    at(m, 0) * at(m, 8) - at(m, 2) * at(m, 6),
    at(m, 2) * at(m, 3) - at(m, 0) * at(m, 5),
    at(m, 3) * at(m, 7) - at(m, 4) * at(m, 6),
    at(m, 1) * at(m, 6) - at(m, 0) * at(m, 7),
    at(m, 0) * at(m, 4) - at(m, 1) * at(m, 3),
  ];
}

function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const product: Matrix3 = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += at(a, 3 * row + k) * at(b, 3 * k + col);
      }
      product.push(sum);
    }
  }
  return product;
}

function transformVector(m: Matrix3, [x, y, w]: Vector3): Vector3 {
  return [
    at(m, 0) * x + at(m, 1) * y + at(m, 2) * w,
    at(m, 3) * x + at(m, 4) * y + at(m, 5) * w,
    at(m, 6) * x + at(m, 7) * y + at(m, 8) * w,
  ];
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

// The projective map sending the unit basis vectors to a, b, c and (1, 1, 1) to d: three
// points span the frame, the fourth fixes the scale along each axis.
function basisToPoints(a: Point, b: Point, c: Point, d: Point): Matrix3 {
  const frame = [a.x, b.x, c.x, a.y, b.y, c.y, 1, 1, 1];
  const [scaleA, scaleB, scaleC] = transformVector(adjugate(frame), [
    d.x,
    d.y,
    1,
  ]);
  return multiply(frame, [scaleA, 0, 0, 0, scaleB, 0, 0, 0, scaleC]);
}

// The homography taking a width x height box (origin top left) onto the quad, or null when
// the quad is degenerate (corners on one line or on one point).
export function boxToQuadHomography(
  width: number,
  height: number,
  quad: Quad,
): Homography | null {
  const toQuad = basisToPoints(
    quad.topLeft,
    quad.topRight,
    quad.bottomLeft,
    quad.bottomRight,
  );
  const fromBox = basisToPoints(
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height },
  );
  const homography = multiply(toQuad, adjugate(fromBox));
  const scale = at(homography, LAST_ENTRY);
  if (Math.abs(scale) < DEGENERATE_EPSILON) return null;
  const normalised = homography.map((value) => value / scale);
  return normalised.every(Number.isFinite) ? normalised : null;
}

// The CSS `matrix3d` (column major, z untouched) for a homography of the xy plane.
export function homographyToMatrix3d(homography: Homography): string {
  const [a = 1, b = 0, c = 0, d = 0, e = 1, f = 0, g = 0, h = 0] = homography;
  const columns = [a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${columns.join(',')})`;
}
