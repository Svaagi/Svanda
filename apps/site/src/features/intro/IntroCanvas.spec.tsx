import { act, render, screen } from '@testing-library/react';
import {
  INTRO_ATTRIBUTE,
  INTRO_PENDING,
  INTRO_PLAYING,
  INTRO_REVEAL_VARS,
  INTRO_SEEN_STORAGE_KEY,
} from 'constants/intro';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { useStageStore } from 'features/stage';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IntroCanvas } from './IntroCanvas';
import { markIntroSeen } from './introMode';

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const root = document.documentElement;

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

const rootVar = (name: string) => root.style.getPropertyValue(name);
const stage = () => useStageStore.getState();

describe('IntroCanvas', () => {
  let context: CanvasRenderingContext2D | null;

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    });
    context = createFakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => context as never,
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
      VIEWPORT_WIDTH,
    );
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
      VIEWPORT_HEIGHT,
    );
    stage().setNavLogoSlot({ x: 310, y: 19.5, cellPx: 5 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
    root.removeAttribute(INTRO_ATTRIBUTE);
    root.removeAttribute('style');
    window.history.replaceState(null, '', '/');
    stage().setNavLogoSlot(null);
  });

  it('plays the timeline, then hands over to the page', () => {
    render(<IntroCanvas />);

    expect(root).toHaveAttribute(INTRO_ATTRIBUTE, INTRO_PLAYING);
    expect(stage()).toMatchObject({ isReady: false, introPhase: 'pixels' });
    // The ramps go to the elements that read them, through the store; not to <html>.
    expect(stage().introReveal?.['--sv-nav']).toBe('0.000');
    expect(rootVar('--sv-nav')).toBe('');
    expect(context?.fillRect).toHaveBeenCalled();

    advance(4000);
    expect(stage().introPhase).toBe('swarm');
    expect(stage().introReveal?.['--sv-nav']).toBe('0.400');
    expect(rootVar('--sv-logo')).toBe('0');
    expect(
      window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY),
    ).not.toBeNull();

    advance(1000);
    expect(stage().introPhase).toBe('reveal');
    expect(rootVar('--sv-logo')).toBe('1');

    advance(1600);
    expect(root).not.toHaveAttribute(INTRO_ATTRIBUTE);
    expect(stage()).toMatchObject({
      isReady: true,
      introPhase: 'done',
      introReveal: null,
    });
    INTRO_REVEAL_VARS.forEach((name) => expect(rootVar(name)).toBe(''));
  });

  it('skips straight to the final state on a repeat visit', () => {
    markIntroSeen();
    root.setAttribute(INTRO_ATTRIBUTE, INTRO_PENDING);

    render(<IntroCanvas />);

    expect(root).not.toHaveAttribute(INTRO_ATTRIBUTE);
    expect(stage()).toMatchObject({ isReady: true, introPhase: 'done' });
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  });

  it('resumes where it stopped after a hidden tab instead of jumping ahead', () => {
    render(<IntroCanvas />);
    advance(1000);
    const fakeNow = performance.now.bind(performance);
    vi.spyOn(performance, 'now').mockImplementation(() => fakeNow() + 60_000);

    advance(500);

    expect(stage().introPhase).toBe('pixels');
    expect(root).toHaveAttribute(INTRO_ATTRIBUTE, INTRO_PLAYING);
  });

  it('marks the intro seen only once a frame is visible', () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    render(<IntroCanvas />);
    advance(100);

    expect(window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY)).toBeNull();
  });

  it('skips a deep link past the stage', () => {
    window.history.replaceState(null, '', '/#contact');

    render(<IntroCanvas />);

    expect(root).not.toHaveAttribute(INTRO_ATTRIBUTE);
    expect(stage().isReady).toBe(true);
  });

  it('cleans up once when unmounted after it finished', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<IntroCanvas />);
    advance(7000);

    unmount();

    const resizeRemovals = removeListener.mock.calls.filter(
      ([type]) => type === 'resize',
    );
    expect(resizeRemovals).toHaveLength(1);
  });

  it('skips with reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      createMatchMediaMock([REDUCED_MOTION_QUERY]).matchMedia,
    );

    render(<IntroCanvas />);

    expect(root).not.toHaveAttribute(INTRO_ATTRIBUTE);
    expect(stage().isReady).toBe(true);
    expect(window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY)).toBeNull();
  });

  it('skips when the browser has no 2D canvas', () => {
    context = null;

    render(<IntroCanvas />);

    expect(root).not.toHaveAttribute(INTRO_ATTRIBUTE);
    expect(stage().isReady).toBe(true);
  });

  it('restores the final state when unmounted mid-intro', () => {
    const { unmount } = render(<IntroCanvas />);
    advance(2000);

    unmount();

    expect(root).not.toHaveAttribute(INTRO_ATTRIBUTE);
    expect(stage()).toMatchObject({ isReady: true, introPhase: 'done' });
    expect(rootVar('--sv-logo')).toBe('');
    expect(stage().introReveal).toBeNull();
  });

  it('renders a decorative canvas', () => {
    render(<IntroCanvas />);

    expect(screen.getByTestId('intro')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('intro-canvas').tagName).toBe('CANVAS');
  });
});
