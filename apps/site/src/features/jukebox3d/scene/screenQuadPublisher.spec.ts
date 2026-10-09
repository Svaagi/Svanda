import { useStageStore } from 'features/stage';
import { Group, PerspectiveCamera } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createStageProjector } from './floorShadowPublisher';
import { publishScreenQuad } from './screenQuadPublisher';

const SIZE = { width: 1440, height: 900 };

function createProjector() {
  const camera = new PerspectiveCamera(28, SIZE.width / SIZE.height, 50, 8000);
  camera.position.set(0, 0, 1755);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return createStageProjector(camera, SIZE);
}

describe('publishScreenQuad', () => {
  afterEach(() => {
    useStageStore.setState({ screenQuad: null });
    vi.restoreAllMocks();
  });

  it('publishes the display face-on as an upright rectangle above the centre', () => {
    publishScreenQuad(new Group(), createProjector());

    const quad = useStageStore.getState().screenQuad;
    if (!quad) throw new Error('expected a screen quad');
    expect(quad.topLeft.y).toBe(quad.topRight.y);
    expect(quad.bottomLeft.y).toBe(quad.bottomRight.y);
    expect(quad.topLeft.x).toBe(quad.bottomLeft.x);
    expect(quad.topRight.x).toBeGreaterThan(quad.topLeft.x);
    expect(quad.bottomLeft.y).toBeGreaterThan(quad.topLeft.y);
    // The display sits in the upper half of the cabinet.
    expect(quad.topLeft.y).toBeLessThan(SIZE.height / 2);
  });

  it('follows the pivot: a shift moves the quad, a half turn mirrors it', () => {
    const pivot = new Group();
    const project = createProjector();
    publishScreenQuad(pivot, project);
    const faceOn = useStageStore.getState().screenQuad;

    pivot.position.x = 100;
    publishScreenQuad(pivot, project);
    const shifted = useStageStore.getState().screenQuad;
    expect(shifted?.topLeft.x).toBeGreaterThan(faceOn?.topLeft.x ?? 0);

    pivot.position.x = 0;
    pivot.rotation.y = Math.PI;
    publishScreenQuad(pivot, project);
    const turned = useStageStore.getState().screenQuad;
    expect(turned?.topLeft.x).toBeGreaterThan(turned?.topRight.x ?? 0);
  });

  it('writes to the store only when the quad changes', () => {
    const pivot = new Group();
    const project = createProjector();
    const setScreenQuad = vi.spyOn(useStageStore.getState(), 'setScreenQuad');
    useStageStore.setState({ setScreenQuad });

    publishScreenQuad(pivot, project);
    publishScreenQuad(pivot, project);
    pivot.position.y = 40;
    publishScreenQuad(pivot, project);

    expect(setScreenQuad).toHaveBeenCalledTimes(2);
  });

  it('clears the quad while the model is hidden', () => {
    const pivot = new Group();
    const project = createProjector();
    publishScreenQuad(pivot, project);
    pivot.visible = false;

    publishScreenQuad(pivot, project);

    expect(useStageStore.getState().screenQuad).toBeNull();
  });
});
