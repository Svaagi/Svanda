import { PAGE_SPIN_TURNS, PAGE_YAW } from 'constants/jukebox3d';
import { LAST_STAGE_PAGE } from 'constants/stage';
import { clamp, easeInOut, FULL_TURN_RAD, lerp } from 'lib/math';

import type { StageLayout } from './stageLayout';

// The model pose `vp` asks for, before the rise, sway and cursor are added.
export type PageState = {
  x: number;
  y: number;
  yaw: number;
  scale: number;
  // Accumulated page turn spins, in radians.
  spin: number;
};

const valueAt = (values: readonly number[], page: number) => values[page] ?? 0;

const spinTurnsBefore = (page: number) =>
  PAGE_SPIN_TURNS.slice(0, page).reduce((sum, turns) => sum + turns, 0);

// Interpolates between the page the stage is leaving and the next one. Height and scale ease
// in and out; the sideways move, yaw and spin are linear so the turn reads as one motion.
export function pageState(vp: number, layout: StageLayout): PageState {
  const page = clamp(Math.floor(vp), 0, LAST_STAGE_PAGE - 1);
  const progress = clamp(vp - page, 0, 1);
  const eased = easeInOut(progress);
  const between = (values: readonly number[], progressBetween: number) =>
    lerp(valueAt(values, page), valueAt(values, page + 1), progressBetween);

  return {
    x: between(layout.x, progress),
    y: between(layout.y, eased),
    yaw: between(PAGE_YAW, progress),
    scale: between(layout.scale, eased),
    spin:
      FULL_TURN_RAD *
      (spinTurnsBefore(page) + valueAt(PAGE_SPIN_TURNS, page) * progress),
  };
}
