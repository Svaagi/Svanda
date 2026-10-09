export type { FrameRequest, MotionState } from './choreographyStep';
export {
  initialMotion,
  settleMotion,
  stepChoreography,
} from './choreographyStep';
export { cursorLightPosition, physicalPointIntensity } from './cursorRig';
export type { ProjectToStage } from './floorShadow';
export {
  floorShadowAlpha,
  floorShadowHull,
  footprintCorners,
  isSameFloorShadow,
} from './floorShadow';
export type { ModelPose } from './modelMotion';
export { heroPresence } from './modelMotion';
export { createStageLayout } from './stageLayout';
