import {
  MODEL_DISPLAY_RECT,
  SCREEN_FACE_Z,
  SCREEN_QUAD_DECIMALS,
} from 'constants/jukebox3d';
import type { ScreenQuad } from 'features/stage';
import { roundTo } from 'lib/math';
import type { Vector3Like } from 'three';

import type { ProjectToStage } from './floorShadow';

type QuadCorner = keyof ScreenQuad;
export type QuadCorners<T> = Record<QuadCorner, T>;

export const QUAD_CORNERS: readonly QuadCorner[] = [
  'topLeft',
  'topRight',
  'bottomRight',
  'bottomLeft',
];

export function displayCorners(): QuadCorners<Vector3Like> {
  const { minX, maxX, minY, maxY } = MODEL_DISPLAY_RECT;
  return {
    topLeft: { x: minX, y: maxY, z: SCREEN_FACE_Z },
    topRight: { x: maxX, y: maxY, z: SCREEN_FACE_Z },
    bottomRight: { x: maxX, y: minY, z: SCREEN_FACE_Z },
    bottomLeft: { x: minX, y: minY, z: SCREEN_FACE_Z },
  };
}

export function createScreenQuad(): ScreenQuad {
  return {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
  };
}

export function copyScreenQuad(quad: ScreenQuad): ScreenQuad {
  return {
    topLeft: { ...quad.topLeft },
    topRight: { ...quad.topRight },
    bottomRight: { ...quad.bottomRight },
    bottomLeft: { ...quad.bottomLeft },
  };
}

// Writes the display corners (world space) into `target` in stage px, rounded so that a still
// model gives the same quad every frame. Filling a reused quad keeps still frames allocation
// free.
export function projectScreenQuadInto(
  target: ScreenQuad,
  worldCorners: QuadCorners<Vector3Like>,
  project: ProjectToStage,
) {
  for (const corner of QUAD_CORNERS) {
    const { x, y } = project(worldCorners[corner]);
    target[corner].x = roundTo(x, SCREEN_QUAD_DECIMALS);
    target[corner].y = roundTo(y, SCREEN_QUAD_DECIMALS);
  }
}

export function isSameScreenQuad(
  quad: ScreenQuad | null,
  other: ScreenQuad | null,
): boolean {
  if (!quad || !other) return quad === other;
  return QUAD_CORNERS.every(
    (corner) =>
      quad[corner].x === other[corner].x && quad[corner].y === other[corner].y,
  );
}
