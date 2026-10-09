import { useFrame, useThree } from '@react-three/fiber';
import {
  CURSOR_LIGHTS,
  IDLE_FRAME_MS,
  MAX_FRAME_DELTA_S,
} from 'constants/jukebox3d';
import { useStageStore } from 'features/stage';
import { type RefObject, useEffect, useMemo, useRef } from 'react';
import type { Group, PointLight } from 'three';

import {
  createStageLayout,
  cursorLightPosition,
  initialMotion,
  type ModelPose,
  type MotionState,
  physicalPointIntensity,
  settleMotion,
  stepChoreography,
} from '../choreography';
import {
  createStageProjector,
  publishFloorShadow,
} from './floorShadowPublisher';
import { createFrameScheduler } from './frameScheduler';
import { publishScreenQuad } from './screenQuadPublisher';

export type CursorLightRefs = Record<
  keyof typeof CURSOR_LIGHTS,
  RefObject<PointLight | null>
>;

const CURSOR_LIGHT_NAMES = Object.keys(CURSOR_LIGHTS) as Array<
  keyof typeof CURSOR_LIGHTS
>;
const CURSOR_INTENSITIES = {
  key: physicalPointIntensity(CURSOR_LIGHTS.key),
  tint: physicalPointIntensity(CURSOR_LIGHTS.tint),
};

function applyPose(pivot: Group, pose: ModelPose) {
  pivot.visible = pose.isVisible;
  pivot.position.set(pose.x, pose.y, 0);
  pivot.rotation.set(pose.rotationX, pose.rotationY, pose.rotationZ);
  pivot.scale.setScalar(pose.scale);
}

function applyCursorLights(
  lightRefs: CursorLightRefs,
  motion: MotionState,
  strength: number,
) {
  for (const name of CURSOR_LIGHT_NAMES) {
    const light = lightRefs[name].current;
    if (!light) continue;
    cursorLightPosition(motion.pointer, CURSOR_LIGHTS[name], light.position);
    light.intensity = CURSOR_INTENSITIES[name] * strength;
  }
}

// Drives the model through the pages from the stage store: the intro rise, page poses and
// spins, idle sway and cursor tilt, the cursor lights, the floor shadow and the display quad.
// With the demand frameloop it asks for the next frame itself only while something moves.
export function useJukeboxChoreography(
  pivotRef: RefObject<Group | null>,
  lightRefs: CursorLightRefs,
  isReducedMotion: boolean,
) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const anchors = useStageStore((state) => state.modelAnchors);
  const layout = useMemo(
    () => createStageLayout(size, anchors),
    [size, anchors],
  );
  const project = useMemo(
    () => createStageProjector(camera, size),
    [camera, size],
  );
  const scheduler = useMemo(
    () => createFrameScheduler(invalidate, IDLE_FRAME_MS),
    [invalidate],
  );
  const motionRef = useRef<MotionState | null>(null);

  useEffect(() => scheduler.cancel, [scheduler]);

  useEffect(
    () => () => {
      const { setFloorShadow, setScreenQuad } = useStageStore.getState();
      setFloorShadow(null);
      setScreenQuad(null);
    },
    [],
  );

  // Switching reduced motion on lands a running rise at once; either way the scene redraws.
  useEffect(() => {
    if (isReducedMotion && motionRef.current) {
      motionRef.current = settleMotion(motionRef.current);
    }
    invalidate();
  }, [isReducedMotion, invalidate]);

  useFrame((_, delta) => {
    const pivot = pivotRef.current;
    if (!pivot) return;
    const { vp, pointer, introPhase } = useStageStore.getState();
    motionRef.current ??= initialMotion(introPhase, isReducedMotion, pointer);
    const frame = stepChoreography(motionRef.current, {
      deltaS: Math.min(delta, MAX_FRAME_DELTA_S),
      vp,
      pointer,
      introPhase,
      isReducedMotion,
      layout,
    });
    motionRef.current = frame.motion;
    applyPose(pivot, frame.pose);
    applyCursorLights(lightRefs, frame.motion, frame.cursorStrength);
    // The renderer refreshes the camera matrices only while drawing, and the camera rig may
    // have moved the camera since the last frame.
    camera.updateMatrixWorld();
    publishFloorShadow(pivot, project, frame.riseProgress);
    publishScreenQuad(pivot, project);
    scheduler.request(frame.frameRequest);
  });
}
