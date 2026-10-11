import { useStageStore } from 'features/stage';
import { HALF } from 'lib/math';
import { type Camera, type Object3D, Vector3 } from 'three';

import {
  floorShadowAlpha,
  floorShadowHull,
  footprintCorners,
  isSameFloorShadow,
  type ProjectToStage,
} from '../choreography';
import type { SceneSize } from '../sceneLayout';

const MODEL_FOOTPRINT = footprintCorners();
// Scratch vectors reused every frame.
const worldCorners = MODEL_FOOTPRINT.map(() => new Vector3());

// World space to stage px through the camera, y down. Reads the camera matrices at call time,
// so one projector serves until the camera or stage size changes.
export function createStageProjector(
  camera: Camera,
  size: SceneSize,
): ProjectToStage {
  const vector = new Vector3();
  return ({ x, y, z }) => {
    vector.set(x, y, z).project(camera);
    return {
      x: (vector.x + 1) * HALF * size.width,
      y: (1 - vector.y) * HALF * size.height,
    };
  };
}

// The floor shadow under the posed model, written to the stage store only when it changed.
// Nothing is published while the model is hidden.
export function publishFloorShadow(
  pivot: Object3D,
  project: ProjectToStage,
  riseProgress: number,
) {
  const { floorShadow, setFloorShadow } = useStageStore.getState();
  let next = null;
  if (pivot.visible) {
    pivot.updateMatrixWorld(true);
    MODEL_FOOTPRINT.forEach((corner, i) =>
      worldCorners[i]?.copy(corner).applyMatrix4(pivot.matrixWorld),
    );
    next = {
      points: floorShadowHull(worldCorners, project),
      alpha: floorShadowAlpha(riseProgress),
    };
  }
  if (!isSameFloorShadow(floorShadow, next)) setFloorShadow(next);
}
