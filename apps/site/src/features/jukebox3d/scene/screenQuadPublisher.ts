import { useStageStore } from 'features/stage';
import { type Object3D, Vector3 } from 'three';

import {
  copyScreenQuad,
  createScreenQuad,
  displayCorners,
  isSameScreenQuad,
  projectScreenQuadInto,
  type ProjectToStage,
  QUAD_CORNERS,
  type QuadCorners,
} from '../choreography';

const MODEL_CORNERS = displayCorners();
// Scratch values reused every frame; a copy reaches the store only when the quad moved.
const worldCorners: QuadCorners<Vector3> = {
  topLeft: new Vector3(),
  topRight: new Vector3(),
  bottomRight: new Vector3(),
  bottomLeft: new Vector3(),
};
const projected = createScreenQuad();

// Where the display of the posed model sits on the stage, written to the stage store only
// when it moved. Nothing is published while the model is hidden.
export function publishScreenQuad(pivot: Object3D, project: ProjectToStage) {
  const { screenQuad, setScreenQuad } = useStageStore.getState();
  if (!pivot.visible) {
    if (screenQuad) setScreenQuad(null);
    return;
  }
  pivot.updateWorldMatrix(true, false);
  for (const corner of QUAD_CORNERS) {
    worldCorners[corner]
      .copy(MODEL_CORNERS[corner])
      .applyMatrix4(pivot.matrixWorld);
  }
  projectScreenQuadInto(projected, worldCorners, project);
  if (!isSameScreenQuad(screenQuad, projected)) {
    setScreenQuad(copyScreenQuad(projected));
  }
}
