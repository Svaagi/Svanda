import {
  INTRO_CELL_GAP_PX,
  INTRO_PIXELS_END_S,
  SWARM_ARC_LIFT_PX,
  SWARM_ARC_LIFT_RANDOM_PX,
  SWARM_ARC_SPREAD_PX,
  SWARM_COLUMN_DELAY_S,
  SWARM_FLIGHT_S,
  SWARM_SEED_DELAY_S,
  SWARM_TRAIL_ALPHA,
  SWARM_TRAIL_COUNT,
  SWARM_TRAIL_STEP,
} from 'constants/intro';
import { LOGO_CELL_INSET_PX } from 'constants/pixel';
import { clamp, easeInOut, HALF, lerp } from 'lib/math';

import { type IntroCell, LOGO_COLS } from './introLayout';

export type Point = {
  x: number;
  y: number;
};

// The nav logo slot in canvas px: where module (0, 0) of the wordmark lands, and its size.
export type SwarmTarget = Point & {
  cellPx: number;
};

export type SwarmSprite = Point & {
  size: number;
  alpha: number;
  insetPx: number;
};

// Bernstein weight of the control point: 2 (1 - q) q.
const CONTROL_WEIGHT = 2;

// Flight progress 0..1 of a logo cell: columns leave left to right, with a random stagger.
export function swarmProgress(cell: IntroCell, t: number): number {
  const logoCol = cell.logo?.col ?? 0;
  const delayS =
    SWARM_COLUMN_DELAY_S * (logoCol / LOGO_COLS) +
    cell.delaySeed * SWARM_SEED_DELAY_S;
  return clamp((t - INTRO_PIXELS_END_S - delayS) / SWARM_FLIGHT_S, 0, 1);
}

export function quadraticBezier(
  from: Point,
  control: Point,
  to: Point,
  progress: number,
): Point {
  const rest = 1 - progress;
  const weightFrom = rest * rest;
  const weightControl = CONTROL_WEIGHT * rest * progress;
  const weightTo = progress * progress;
  return {
    x: weightFrom * from.x + weightControl * control.x + weightTo * to.x,
    y: weightFrom * from.y + weightControl * control.y + weightTo * to.y,
  };
}

// Above both ends, shifted sideways at random, so the cells fly up in loose arcs.
export function swarmControlPoint(
  from: Point,
  to: Point,
  cell: IntroCell,
): Point {
  return {
    x: lerp(from.x, to.x, HALF) + (cell.arcSeedX - HALF) * SWARM_ARC_SPREAD_PX,
    y:
      Math.min(from.y, to.y) -
      SWARM_ARC_LIFT_PX -
      cell.arcSeedY * SWARM_ARC_LIFT_RANDOM_PX,
  };
}

export function swarmEndPoint(cell: IntroCell, target: SwarmTarget): Point {
  return {
    x: target.x + (cell.logo?.col ?? 0) * target.cellPx,
    y: target.y + (cell.logo?.row ?? 0) * target.cellPx,
  };
}

// What to draw for one logo cell at time t: its ghost trails, then the cell itself. A landed
// cell takes the nav logo's own inset, so it matches the DOM logo pixel for pixel.
export function swarmSprites(
  cell: IntroCell,
  cellPx: number,
  target: SwarmTarget,
  t: number,
): SwarmSprite[] {
  const progress = swarmProgress(cell, t);
  const from = { x: cell.col * cellPx, y: cell.row * cellPx };
  const to = swarmEndPoint(cell, target);
  const control = swarmControlPoint(from, to, cell);

  const spriteAt = (
    flight: number,
    alpha: number,
    insetPx: number,
  ): SwarmSprite => {
    const eased = easeInOut(flight);
    return {
      ...quadraticBezier(from, control, to, eased),
      size: lerp(cellPx, target.cellPx, eased),
      alpha,
      insetPx,
    };
  };

  const isFlying = progress > 0 && progress < 1;
  const trails = isFlying
    ? Array.from({ length: SWARM_TRAIL_COUNT }, (_, index) => {
        const distance = index + 1;
        return spriteAt(
          clamp(progress - distance * SWARM_TRAIL_STEP, 0, 1),
          SWARM_TRAIL_ALPHA / distance,
          INTRO_CELL_GAP_PX,
        );
      })
    : [];
  const insetPx = progress < 1 ? INTRO_CELL_GAP_PX : LOGO_CELL_INSET_PX;
  return [...trails, spriteAt(progress, 1, insetPx)];
}
