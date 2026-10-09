import { renderHook } from '@testing-library/react';
import { useStageStore } from 'features/stage';
import { Group, PerspectiveCamera, PointLight } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useJukeboxChoreography } from './useJukeboxChoreography';

type FrameCallback = (state: unknown, delta: number) => void;

// No WebGL in jsdom: the R3F hooks are replaced by a fixed scene state and a frame callback
// the test drives by hand.
const fiber = vi.hoisted(() => ({
  frame: null as FrameCallback | null,
  invalidate: vi.fn(),
  state: {} as Record<string, unknown>,
}));

vi.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(fiber.state),
  useFrame: (callback: FrameCallback) => {
    fiber.frame = callback;
  },
}));

const SIZE = { width: 1440, height: 900 };

function createCamera() {
  const camera = new PerspectiveCamera(28, SIZE.width / SIZE.height, 50, 8000);
  camera.position.set(0, 40, 1755);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return camera;
}

function renderChoreography() {
  const pivotRef = { current: new Group() };
  const lights = {
    key: { current: new PointLight() },
    tint: { current: new PointLight() },
  };
  const hook = renderHook(
    ({ isReduced }: { isReduced: boolean }) =>
      useJukeboxChoreography(pivotRef, lights, isReduced),
    { initialProps: { isReduced: false } },
  );
  const runFrame = () => fiber.frame?.({}, 1 / 60);
  return { ...hook, pivot: pivotRef.current, lights, runFrame };
}

describe('useJukeboxChoreography', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fiber.invalidate.mockClear();
    fiber.state = {
      size: SIZE,
      camera: createCamera(),
      invalidate: fiber.invalidate,
    };
    useStageStore.setState({
      vp: 0,
      introPhase: 'done',
      pointer: { x: 0, y: 0, isActive: false },
      floorShadow: null,
      screenQuad: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('poses the model and publishes its floor shadow and display quad', () => {
    const { pivot, runFrame } = renderChoreography();

    runFrame();

    expect(pivot.visible).toBe(true);
    expect(pivot.scale.x).toBeCloseTo(1.3);
    expect(useStageStore.getState().floorShadow?.alpha).toBe(1);
    expect(useStageStore.getState().screenQuad).not.toBeNull();
  });

  it('keeps one idle timer for the sway and clears it, the shadow and the quad on unmount', () => {
    const { runFrame, unmount } = renderChoreography();

    runFrame();
    runFrame();
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(useStageStore.getState().floorShadow).toBeNull();
    expect(useStageStore.getState().screenQuad).toBeNull();
  });

  it('lights the model from the cursor over the hero only', () => {
    useStageStore.setState({ pointer: { x: 1, y: 0, isActive: true } });
    const { lights, runFrame } = renderChoreography();

    runFrame();
    expect(lights.key.current.intensity).toBeGreaterThan(0);
    expect(lights.key.current.position.x).toBeGreaterThan(0);

    useStageStore.setState({ vp: 1 });
    runFrame();
    expect(lights.key.current.intensity).toBe(0);
  });

  it('lands a running rise at once when reduced motion switches on', () => {
    useStageStore.setState({ introPhase: 'reveal' });
    const { pivot, runFrame, rerender } = renderChoreography();
    runFrame();
    runFrame();
    expect(pivot.position.y).toBeLessThan(-100);

    fiber.invalidate.mockClear();
    rerender({ isReduced: true });
    runFrame();

    expect(fiber.invalidate).toHaveBeenCalled();
    expect(pivot.position.y).toBeGreaterThan(-100);
    expect(vi.getTimerCount()).toBe(0);
  });
});
