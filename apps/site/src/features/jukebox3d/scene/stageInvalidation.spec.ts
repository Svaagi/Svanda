import { useStageStore } from 'features/stage';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { subscribeStageInvalidation } from './stageInvalidation';

describe('subscribeStageInvalidation', () => {
  afterEach(() => {
    useStageStore.setState({
      vp: 0,
      introPhase: 'done',
      pointer: { x: 0, y: 0, isActive: false },
      modelAnchors: { heroTextTop: null, karaoke: null, jukebox: null },
    });
  });

  it('asks for a frame when the page position or intro phase changes', () => {
    const invalidate = vi.fn();
    const unsubscribe = subscribeStageInvalidation(invalidate);

    useStageStore.getState().setVp(0.5);
    useStageStore.getState().setIntroPhase('reveal');
    unsubscribe();

    expect(invalidate).toHaveBeenCalledTimes(2);
  });

  it('asks for a frame when the model anchors change', () => {
    const invalidate = vi.fn();
    const unsubscribe = subscribeStageInvalidation(invalidate);

    useStageStore.getState().setModelAnchors({ heroTextTop: 640 });
    unsubscribe();

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('ignores pointer moves off the hero', () => {
    const invalidate = vi.fn();
    const unsubscribe = subscribeStageInvalidation(invalidate);

    useStageStore.getState().setPointer({ x: 0.2, y: 0.1, isActive: true });
    useStageStore.setState({ vp: 2 });
    invalidate.mockClear();
    useStageStore.getState().setPointer({ x: 0.4, y: 0.1, isActive: true });
    unsubscribe();

    expect(invalidate).not.toHaveBeenCalled();
  });

  it('redraws when the pointer moves over the hero', () => {
    const invalidate = vi.fn();
    const unsubscribe = subscribeStageInvalidation(invalidate);

    useStageStore.getState().setPointer({ x: 0.2, y: 0.1, isActive: true });
    unsubscribe();

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('stops asking once unsubscribed', () => {
    const invalidate = vi.fn();
    subscribeStageInvalidation(invalidate)();

    useStageStore.getState().setVp(1);

    expect(invalidate).not.toHaveBeenCalled();
  });
});
