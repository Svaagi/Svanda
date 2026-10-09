import { useStageStore } from 'features/stage';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { subscribeStageInvalidation } from './stageInvalidation';

describe('subscribeStageInvalidation', () => {
  afterEach(() => {
    useStageStore.setState({ vp: 0, introPhase: 'done' });
  });

  it('asks for a frame when the page position or intro phase changes', () => {
    const invalidate = vi.fn();
    const unsubscribe = subscribeStageInvalidation(invalidate);

    useStageStore.getState().setVp(0.5);
    useStageStore.getState().setIntroPhase('reveal');
    unsubscribe();

    expect(invalidate).toHaveBeenCalledTimes(2);
  });

  it('ignores pointer moves', () => {
    const invalidate = vi.fn();
    const unsubscribe = subscribeStageInvalidation(invalidate);

    useStageStore.getState().setPointer({ x: 0.2, y: 0.1, isActive: true });
    unsubscribe();

    expect(invalidate).not.toHaveBeenCalled();
  });

  it('stops asking once unsubscribed', () => {
    const invalidate = vi.fn();
    subscribeStageInvalidation(invalidate)();

    useStageStore.getState().setVp(1);

    expect(invalidate).not.toHaveBeenCalled();
  });
});
