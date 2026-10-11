import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsSceneVisible } from './useIsSceneVisible';

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const setTabHidden = (isHidden: boolean) => {
  Object.defineProperty(document, 'visibilityState', {
    value: isHidden ? 'hidden' : 'visible',
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('useIsSceneVisible', () => {
  let observerCallback: ObserverCallback | null = null;
  const disconnect = vi.fn();

  beforeEach(() => {
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
    vi.unstubAllGlobals();
    setTabHidden(false);
    observerCallback = null;
  });

  const bodyRef = { current: document.body };
  const renderVisibility = () => renderHook(() => useIsSceneVisible(bodyRef));

  it('is visible on screen in a visible tab', () => {
    const { result } = renderVisibility();

    expect(result.current).toBe(true);
  });

  it('turns false off screen and in a hidden tab', () => {
    const { result } = renderVisibility();

    act(() => observerCallback?.([{ isIntersecting: false }]));
    expect(result.current).toBe(false);

    act(() => {
      observerCallback?.([{ isIntersecting: true }]);
      setTabHidden(true);
    });
    expect(result.current).toBe(false);

    act(() => setTabHidden(false));
    expect(result.current).toBe(true);
  });

  it('stops observing on unmount', () => {
    const { unmount } = renderVisibility();

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
