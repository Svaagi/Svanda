import {
  CALM_FADE_RATE,
  REST_ROLL_Z,
  REST_TILT_X,
  RISE_DURATION_S,
  RISE_OVERSHOOT,
  RISE_SPIN_IN_YAW,
  RISE_START_SCALE,
  RISE_START_TILT,
  RISE_START_Y,
  SWAY_AMPLITUDE,
  SWAY_RATE,
} from 'constants/jukebox3d';
import { CUSTOM_PAGE, HERO_PAGE } from 'constants/stage';
import type { IntroPhase } from 'features/stage';
import { clamp, easeOut, easeOutBack, lerp } from 'lib/math';

import type { PageState } from './pageState';

// The rise waits for the intro to reveal the page, plays once, then stays risen.
export type RiseState = {
  status: 'waiting' | 'rising' | 'risen';
  elapsedS: number;
};

export type Parallax = {
  tiltX: number;
  yaw: number;
};

export type ModelPose = {
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  isVisible: boolean;
};

export type ModelPoseInput = {
  page: PageState;
  riseProgress: number;
  // Scene clock, drives the idle sway.
  timeS: number;
  // 1 on Custom, where the model stands still and face-on.
  calm: number;
  parallax: Parallax;
  isReducedMotion: boolean;
};

const RISEN: RiseState = { status: 'risen', elapsedS: RISE_DURATION_S };
const NO_PARALLAX: Parallax = { tiltX: 0, yaw: 0 };

// The rise runs on the intro clock, as in the prototype: with no intro (already seen this
// session, or reduced motion) and when the model only loads after the intro has ended, the
// rise is long over and the model is simply there. Only a model loaded while the intro plays
// rises.
export function initialRise(
  introPhase: IntroPhase,
  isReducedMotion: boolean,
): RiseState {
  if (isReducedMotion || introPhase === 'done') return RISEN;
  return { status: 'waiting', elapsedS: 0 };
}

export function advanceRise(
  rise: RiseState,
  introPhase: IntroPhase,
  deltaS: number,
): RiseState {
  if (rise.status === 'waiting') {
    const isRevealed = introPhase === 'reveal' || introPhase === 'done';
    return isRevealed ? { status: 'rising', elapsedS: 0 } : rise;
  }
  if (rise.status === 'risen') return rise;
  const elapsedS = rise.elapsedS + deltaS;
  return elapsedS >= RISE_DURATION_S ? RISEN : { status: 'rising', elapsedS };
}

// Linear 0..1 progress of the rise.
export function riseProgress(rise: RiseState): number {
  return clamp(rise.elapsedS / RISE_DURATION_S, 0, 1);
}

export function calmAt(vp: number): number {
  return 1 - clamp(Math.abs(vp - CUSTOM_PAGE) * CALM_FADE_RATE, 0, 1);
}

// 1 on the hero, gone one page later: the cursor effects belong to the hero only.
export function heroPresence(vp: number): number {
  return 1 - clamp(vp - HERO_PAGE, 0, 1);
}

export function swayAt(timeS: number): number {
  return Math.sin(timeS * SWAY_RATE) * SWAY_AMPLITUDE;
}

// The final model transform: the page pose, risen from below with an overshoot and a decaying
// spin-in, plus the idle sway and cursor tilt everywhere but on Custom. Reduced motion keeps
// the page poses and the rest lean only.
export function modelPose({
  page,
  riseProgress: progress,
  timeS,
  calm,
  parallax,
  isReducedMotion,
}: ModelPoseInput): ModelPose {
  const rise = easeOutBack(progress, RISE_OVERSHOOT);
  const wobble = 1 - calm;
  const sway = isReducedMotion ? 0 : swayAt(timeS);
  const tilt = isReducedMotion ? NO_PARALLAX : parallax;
  const spin = isReducedMotion ? 0 : page.spin;

  return {
    x: page.x,
    y: lerp(RISE_START_Y, page.y, rise),
    rotationX:
      (REST_TILT_X + tilt.tiltX) * wobble + (1 - rise) * RISE_START_TILT,
    rotationY:
      page.yaw +
      (1 - easeOut(progress)) * RISE_SPIN_IN_YAW +
      (sway + tilt.yaw) * wobble +
      spin,
    rotationZ: REST_ROLL_Z * wobble,
    scale: lerp(RISE_START_SCALE, 1, rise) * page.scale,
    isVisible: progress > 0,
  };
}
