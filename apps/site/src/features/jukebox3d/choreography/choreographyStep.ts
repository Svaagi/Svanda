import { VENUES_PAGE } from 'constants/stage';
import type { IntroPhase, StagePointer } from 'features/stage';

import {
  cursorParallax,
  cursorStrength,
  isPointerSettled,
  type SmoothedPointer,
  smoothPointer,
} from './cursorRig';
import {
  advanceRise,
  calmAt,
  heroPresence,
  initialRise,
  type ModelPose,
  modelPose,
  riseProgress,
  type RiseState,
} from './modelMotion';
import { pageState } from './pageState';
import type { StageLayout } from './stageLayout';

export type MotionState = {
  rise: RiseState;
  // Scene clock in seconds, for the idle sway.
  timeS: number;
  pointer: SmoothedPointer;
};

export type ChoreographyInput = {
  deltaS: number;
  vp: number;
  pointer: StagePointer;
  introPhase: IntroPhase;
  isReducedMotion: boolean;
  layout: StageLayout;
};

// `now`: something is moving, draw the next frame at full rate. `idle`: only the sway moves,
// a slower frame rate will do. `none`: the scene is still until a stage value changes.
export type FrameRequest = 'now' | 'idle' | 'none';

export type ChoreographyFrame = {
  motion: MotionState;
  pose: ModelPose;
  riseProgress: number;
  cursorStrength: number;
  frameRequest: FrameRequest;
};

export function initialMotion(
  introPhase: IntroPhase,
  isReducedMotion: boolean,
  pointer: StagePointer,
): MotionState {
  return {
    rise: initialRise(introPhase, isReducedMotion),
    timeS: 0,
    pointer: { x: pointer.x, y: pointer.y },
  };
}

// Reduced motion switched on mid-animation: land the rise at once.
export function settleMotion(motion: MotionState): MotionState {
  return { ...motion, rise: initialRise('done', true) };
}

type FrameRequestInput = {
  rise: RiseState;
  calm: number;
  vp: number;
  isReducedMotion: boolean;
  isPointerMoving: boolean;
};

function frameRequestFor({
  rise,
  calm,
  vp,
  isReducedMotion,
  isPointerMoving,
}: FrameRequestInput): FrameRequest {
  if (rise.status === 'rising' || isPointerMoving) return 'now';
  const isSwaying =
    rise.status === 'risen' && !isReducedMotion && calm < 1 && vp < VENUES_PAGE;
  return isSwaying ? 'idle' : 'none';
}

// One scene frame: advances the rise, the clock and the smoothed pointer, and derives the
// model pose and cursor effects from them.
export function stepChoreography(
  motion: MotionState,
  input: ChoreographyInput,
): ChoreographyFrame {
  const { deltaS, vp, pointer, introPhase, isReducedMotion, layout } = input;
  const rise = advanceRise(motion.rise, introPhase, deltaS);
  const progress = riseProgress(rise);
  const smoothed = smoothPointer(motion.pointer, pointer, deltaS);
  const strength = cursorStrength(pointer, heroPresence(vp), progress);
  const calm = calmAt(vp);
  const next: MotionState = {
    rise,
    timeS: motion.timeS + deltaS,
    pointer: smoothed,
  };

  return {
    motion: next,
    pose: modelPose({
      page: pageState(vp, layout),
      riseProgress: progress,
      timeS: next.timeS,
      calm,
      parallax: cursorParallax(smoothed, strength),
      isReducedMotion,
    }),
    riseProgress: progress,
    cursorStrength: strength,
    frameRequest: frameRequestFor({
      rise,
      calm,
      vp,
      isReducedMotion,
      isPointerMoving: strength > 0 && !isPointerSettled(smoothed, pointer),
    }),
  };
}
