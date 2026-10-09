import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindFrameLoopVisibility, createFrameLoop } from './frameLoop';

const FRAME_MS = 16;
const SECOND_MS = 1000;

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const setTabHidden = (isHidden: boolean) => {
  Object.defineProperty(document, 'visibilityState', {
    value: isHidden ? 'hidden' : 'visible',
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('createFrameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('draws every frame while running and none once stopped', () => {
    const onFrame = vi.fn();
    const loop = createFrameLoop(onFrame);

    vi.advanceTimersByTime(FRAME_MS * 10);
    const runningFrames = onFrame.mock.calls.length;
    expect(runningFrames).toBeGreaterThanOrEqual(9);

    loop.stop();
    vi.advanceTimersByTime(SECOND_MS);
    expect(onFrame).toHaveBeenCalledTimes(runningFrames);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('pauses while hidden or off screen and resumes after', () => {
    const onFrame = vi.fn();
    const loop = createFrameLoop(onFrame);

    loop.setIsTabVisible(false);
    vi.advanceTimersByTime(SECOND_MS);
    expect(onFrame).not.toHaveBeenCalled();

    loop.setIsTabVisible(true);
    loop.setIsOnScreen(false);
    vi.advanceTimersByTime(SECOND_MS);
    expect(onFrame).not.toHaveBeenCalled();

    loop.setIsOnScreen(true);
    vi.advanceTimersByTime(FRAME_MS * 2);
    expect(onFrame).toHaveBeenCalled();
    loop.stop();
  });
});

describe('bindFrameLoopVisibility', () => {
  let observerCallback: ObserverCallback | null = null;
  const disconnect = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: ObserverCallback) {
          observerCallback = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setTabHidden(false);
    observerCallback = null;
  });

  it('counts no frames while the tab is hidden', () => {
    const onFrame = vi.fn();
    const loop = createFrameLoop(onFrame);
    const unbind = bindFrameLoopVisibility(loop, document.body);

    vi.advanceTimersByTime(SECOND_MS);
    const visibleFrames = onFrame.mock.calls.length;
    expect(visibleFrames).toBeGreaterThan(0);

    setTabHidden(true);
    vi.advanceTimersByTime(SECOND_MS * 5);
    expect(onFrame).toHaveBeenCalledTimes(visibleFrames);
    expect(vi.getTimerCount()).toBe(0);

    setTabHidden(false);
    vi.advanceTimersByTime(SECOND_MS);
    expect(onFrame.mock.calls.length).toBeGreaterThan(visibleFrames);

    unbind();
    loop.stop();
    expect(disconnect).toHaveBeenCalled();
  });

  it('counts no frames while the element is off screen', () => {
    const onFrame = vi.fn();
    const loop = createFrameLoop(onFrame);
    const unbind = bindFrameLoopVisibility(loop, document.body);

    observerCallback?.([{ isIntersecting: false }]);
    vi.advanceTimersByTime(SECOND_MS);
    expect(onFrame).not.toHaveBeenCalled();

    observerCallback?.([{ isIntersecting: true }]);
    vi.advanceTimersByTime(FRAME_MS * 2);
    expect(onFrame).toHaveBeenCalled();

    unbind();
    loop.stop();
  });

  it('starts paused in a background tab', () => {
    setTabHidden(true);
    const onFrame = vi.fn();
    const loop = createFrameLoop(onFrame);
    const unbind = bindFrameLoopVisibility(loop, document.body);

    vi.advanceTimersByTime(SECOND_MS);
    expect(onFrame).not.toHaveBeenCalled();

    unbind();
    loop.stop();
  });
});
