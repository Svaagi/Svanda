import {
  MODEL_BOUNDS,
  RISE_OVERSHOOT,
  SHADOW_DECIMALS,
  SHADOW_DEPTH_RATIO,
  SHADOW_OFFSET_RATIO,
} from 'constants/jukebox3d';
import type { FloorShadow } from 'features/stage';
import { convexHull, type Point } from 'lib/geometry';
import { clamp, easeOutBack, roundTo } from 'lib/math';
import type { Vector3Like } from 'three';

export type ProjectToStage = (point: Vector3Like) => Point;

const round = (value: number) => roundTo(value, SHADOW_DECIMALS);

// The four corners of the cabinet base, in model space.
export function footprintCorners(): Vector3Like[] {
  const { minX, maxX, minY, minZ, maxZ } = MODEL_BOUNDS;
  return [minX, maxX].flatMap((x) =>
    [minZ, maxZ].map((z) => ({ x, y: minY, z })),
  );
}

// The base footprint (world space) and its copy pushed along the floor, away from a light at
// the upper left, projected to stage px. The hull of both is the shadow on the floor.
export function floorShadowHull(
  worldCorners: readonly Vector3Like[],
  project: ProjectToStage,
): Point[] {
  const xs = worldCorners.map(({ x }) => x);
  const offset = (Math.max(...xs) - Math.min(...xs)) * SHADOW_OFFSET_RATIO;
  const projected = worldCorners.flatMap((corner) => [
    project(corner),
    project({
      x: corner.x + offset,
      y: corner.y,
      z: corner.z + offset * SHADOW_DEPTH_RATIO,
    }),
  ]);
  return convexHull(projected).map(({ x, y }) => ({
    x: round(x),
    y: round(y),
  }));
}

// The shadow follows the model rising into place (without its overshoot).
export function floorShadowAlpha(riseProgress: number): number {
  return clamp(easeOutBack(riseProgress, RISE_OVERSHOOT), 0, 1);
}

export function isSameFloorShadow(
  shadow: FloorShadow | null,
  other: FloorShadow | null,
): boolean {
  if (!shadow || !other) return shadow === other;
  return (
    shadow.alpha === other.alpha &&
    shadow.points.length === other.points.length &&
    shadow.points.every(
      (point, i) =>
        point.x === other.points[i]?.x && point.y === other.points[i]?.y,
    )
  );
}
