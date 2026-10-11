import { useStageStore } from 'features/stage';
import { Group, PerspectiveCamera } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createStageProjector,
  publishFloorShadow,
} from './floorShadowPublisher';

const SIZE = { width: 1440, height: 900 };

function createCamera() {
  const camera = new PerspectiveCamera(28, SIZE.width / SIZE.height, 50, 8000);
  camera.position.set(0, 40, 1755);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return camera;
}

describe('createStageProjector', () => {
  it('maps the look-at point to the stage centre, y down', () => {
    const camera = createCamera();
    camera.position.set(0, 0, 1755);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const project = createStageProjector(camera, SIZE);

    expect(project({ x: 0, y: 0, z: 0 }).x).toBeCloseTo(720);
    expect(project({ x: 0, y: 0, z: 0 }).y).toBeCloseTo(450);
    expect(project({ x: 0, y: 100, z: 0 }).y).toBeLessThan(450);
    expect(project({ x: 100, y: 0, z: 0 }).x).toBeGreaterThan(720);
  });
});

describe('publishFloorShadow', () => {
  afterEach(() => {
    useStageStore.setState({ floorShadow: null });
    vi.restoreAllMocks();
  });

  it('publishes the hull under the model, below the stage centre', () => {
    const pivot = new Group();
    pivot.scale.setScalar(1.3);

    publishFloorShadow(pivot, createStageProjector(createCamera(), SIZE), 1);

    const shadow = useStageStore.getState().floorShadow;
    expect(shadow?.alpha).toBe(1);
    expect(shadow?.points.length).toBeGreaterThanOrEqual(3);
    for (const { x, y } of shadow?.points ?? []) {
      expect(y).toBeGreaterThan(450);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(SIZE.width);
    }
  });

  it('writes to the store only when the shadow changes', () => {
    const pivot = new Group();
    const project = createStageProjector(createCamera(), SIZE);
    const setFloorShadow = vi.spyOn(useStageStore.getState(), 'setFloorShadow');
    useStageStore.setState({ setFloorShadow });

    publishFloorShadow(pivot, project, 1);
    publishFloorShadow(pivot, project, 1);
    pivot.position.x = 100;
    publishFloorShadow(pivot, project, 1);

    expect(setFloorShadow).toHaveBeenCalledTimes(2);
  });

  it('clears the shadow while the model is hidden', () => {
    const pivot = new Group();
    publishFloorShadow(pivot, createStageProjector(createCamera(), SIZE), 1);
    pivot.visible = false;

    publishFloorShadow(pivot, createStageProjector(createCamera(), SIZE), 0);

    expect(useStageStore.getState().floorShadow).toBeNull();
  });
});
