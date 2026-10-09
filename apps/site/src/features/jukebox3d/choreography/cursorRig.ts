import {
  CURSOR_LIGHT_OFFSET_Y,
  CURSOR_LIGHT_SPAN_X,
  CURSOR_LIGHT_SPAN_Y,
  type CursorLightSpec,
  PARALLAX_TILT_X,
  PARALLAX_YAW,
  POINTER_SETTLED_EPSILON,
  POINTER_SMOOTHING,
  POINTER_SMOOTHING_FPS,
} from 'constants/jukebox3d';
import type { StagePointer } from 'features/stage';

import type { Parallax } from './modelMotion';

// The pointer the cursor effects follow, eased toward the stage pointer (-1..1, y up).
export type SmoothedPointer = {
  x: number;
  y: number;
};

export type Writable3 = {
  x: number;
  y: number;
  z: number;
};

// three.js smooths a physical light to zero at its range with (1 - (d / range)^4)^2.
const CUTOFF_EXPONENT = 4;
const CUTOFF_WINDOW_EXPONENT = 2;

// Frame rate independent version of closing a fixed share of the gap every frame.
export function smoothPointer(
  current: SmoothedPointer,
  target: StagePointer,
  deltaS: number,
): SmoothedPointer {
  const share = 1 - (1 - POINTER_SMOOTHING) ** (deltaS * POINTER_SMOOTHING_FPS);
  return {
    x: current.x + (target.x - current.x) * share,
    y: current.y + (target.y - current.y) * share,
  };
}

export function isPointerSettled(
  current: SmoothedPointer,
  target: StagePointer,
): boolean {
  return (
    Math.abs(target.x - current.x) < POINTER_SETTLED_EPSILON &&
    Math.abs(target.y - current.y) < POINTER_SETTLED_EPSILON
  );
}

// 0..1 strength of the cursor tilt and lights: only with a pointer over the hero, and only
// as far as the model has risen.
export function cursorStrength(
  pointer: StagePointer,
  presence: number,
  riseProgress: number,
): number {
  return pointer.isActive ? presence * riseProgress : 0;
}

export function cursorParallax(
  pointer: SmoothedPointer,
  strength: number,
): Parallax {
  return {
    tiltX: -pointer.y * PARALLAX_TILT_X * strength,
    yaw: pointer.x * PARALLAX_YAW * strength,
  };
}

// Written into the light's own position: this runs every frame.
export function cursorLightPosition(
  pointer: SmoothedPointer,
  spec: CursorLightSpec,
  target: Writable3,
): Writable3 {
  target.x = pointer.x * CURSOR_LIGHT_SPAN_X;
  target.y = pointer.y * CURSOR_LIGHT_SPAN_Y + CURSOR_LIGHT_OFFSET_Y;
  target.z = spec.z;
  return target;
}

// The prototype's point lights used legacy units with a linear falloff to zero at their
// range; physical point lights fall off with distance^decay. This matches the two at the
// distance the light usually has to the model face (times pi, like the other lights).
export function physicalPointIntensity(spec: CursorLightSpec): number {
  const { legacyIntensity, distance, decay, referenceDistance } = spec;
  const legacyFalloff = Math.max(0, 1 - referenceDistance / distance) ** decay;
  const physicalWindow =
    Math.max(0, 1 - (referenceDistance / distance) ** CUTOFF_EXPONENT) **
    CUTOFF_WINDOW_EXPONENT;
  const physicalFalloff = physicalWindow / referenceDistance ** decay;
  return (legacyIntensity * Math.PI * legacyFalloff) / physicalFalloff;
}
