import { act, render, screen } from '@testing-library/react';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { THEME_ATTRIBUTE } from 'constants/theme';
import { useStageStore } from 'features/stage';
import { chooseTheme } from 'hooks/themeStore';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroBackground } from './HeroBackground';

const WIDTH = 1280;
const HEIGHT = 800;
const SECOND_MS = 1000;
const root = document.documentElement;

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const createFakeContext = () =>
  ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
  }) as unknown as CanvasRenderingContext2D;

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const setTabHidden = (isHidden: boolean) => {
  Object.defineProperty(document, 'visibilityState', {
    value: isHidden ? 'hidden' : 'visible',
    configurable: true,
  });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

describe('HeroBackground', () => {
  let context: CanvasRenderingContext2D;
  let observerCallback: ObserverCallback | null;
  let media: ReturnType<typeof createMatchMediaMock>;

  // Frames drawn so far: each one starts by clearing the canvas.
  const drawnFrames = () => vi.mocked(context.clearRect).mock.calls.length;

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    });
    context = createFakeContext();
    observerCallback = null;
    media = createMatchMediaMock();
    vi.stubGlobal('matchMedia', media.matchMedia);
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: ObserverCallback) {
          observerCallback = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => context as never,
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
      WIDTH,
    );
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
      HEIGHT,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    setTabHidden(false);
    root.removeAttribute(THEME_ATTRIBUTE);
    window.localStorage.clear();
  });

  it('is decorative and publishes its grid for features that snap onto it', () => {
    render(<HeroBackground />);

    expect(screen.getByTestId('hero-background')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(useStageStore.getState().grid).toEqual({
      cell: 17,
      originX: 0,
      originY: 0,
    });
  });

  it('redraws an idle stage at about 20 fps', () => {
    render(<HeroBackground />);

    advance(SECOND_MS);
    expect(drawnFrames()).toBeGreaterThanOrEqual(15);
    expect(drawnFrames()).toBeLessThanOrEqual(22);
  });

  it('draws no frames while the tab is hidden', () => {
    render(<HeroBackground />);
    advance(SECOND_MS);

    setTabHidden(true);
    const framesWhenHidden = drawnFrames();
    advance(SECOND_MS * 5);
    expect(drawnFrames()).toBe(framesWhenHidden);
    expect(vi.getTimerCount()).toBe(0);

    setTabHidden(false);
    advance(SECOND_MS);
    expect(drawnFrames()).toBeGreaterThan(framesWhenHidden);
  });

  it('draws no frames while scrolled off screen', () => {
    render(<HeroBackground />);

    act(() => observerCallback?.([{ isIntersecting: false }]));
    const framesOffScreen = drawnFrames();
    advance(SECOND_MS);
    expect(drawnFrames()).toBe(framesOffScreen);
  });

  it('only redraws on change with reduced motion', () => {
    media.setMatches(REDUCED_MOTION_QUERY, true);
    render(<HeroBackground />);

    advance(SECOND_MS);
    expect(drawnFrames()).toBe(1);

    act(() => useStageStore.getState().setVp(0.5));
    advance(SECOND_MS);
    expect(drawnFrames()).toBe(2);
  });

  it('starts over with the new colours when the theme changes', () => {
    const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
    render(<HeroBackground />);
    const scenesBefore = getContext.mock.calls.length;

    act(() => chooseTheme('light'));

    expect(getContext).toHaveBeenCalledTimes(scenesBefore + 1);
  });

  it('stops drawing and listening on unmount', () => {
    const { unmount } = render(<HeroBackground />);
    advance(SECOND_MS);

    unmount();
    const framesAtUnmount = drawnFrames();
    advance(SECOND_MS);
    expect(drawnFrames()).toBe(framesAtUnmount);
    expect(vi.getTimerCount()).toBe(0);
  });
});
