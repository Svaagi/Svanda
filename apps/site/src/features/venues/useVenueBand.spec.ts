import { act, renderHook } from '@testing-library/react';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { VENUES_PAGE } from 'constants/stage';
import { useStageStore } from 'features/stage';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useVenueBand } from './useVenueBand';

const SECOND_MS = 1000;
const WIDTH = 560;
const HEIGHT = 315;

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const box = (top: number) =>
  ({
    left: 0,
    top,
    right: WIDTH,
    bottom: top + HEIGHT,
    width: WIDTH,
    height: HEIGHT,
  }) as DOMRect;

const createSlide = (isActive: boolean, text: string) => {
  const slide = document.createElement('div');
  slide.dataset.active = String(isActive);
  const canvas = document.createElement('canvas');
  canvas.dataset.venueBand = '';
  canvas.dataset.text = text;
  canvas.dataset.color = '#ffe11a';
  slide.append(canvas);
  return { slide, canvas };
};

// A frame with an inactive and an active slide, each with its band canvas.
function createDom() {
  const frame = document.createElement('div');
  const inactive = createSlide(false, 'Arcade Bar');
  const { slide, canvas } = createSlide(true, 'Lemon');
  frame.append(inactive.slide, slide);
  document.body.append(frame);
  return { frame, slide, canvas, inactiveCanvas: inactive.canvas };
}

describe('useVenueBand', () => {
  let observerCallback: ObserverCallback | null;
  let clearRect: ReturnType<typeof vi.fn>;
  let dom: ReturnType<typeof createDom>;
  let media: ReturnType<typeof createMatchMediaMock>;

  const drawnFrames = () => clearRect.mock.calls.length;
  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  const renderBand = () =>
    renderHook(() =>
      useVenueBand({
        frameRef: { current: dom.frame },
        cell: 14,
      }),
    );

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    });
    observerCallback = null;
    clearRect = vi.fn();
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
      () =>
        ({
          clearRect,
          fillRect: vi.fn(),
          setTransform: vi.fn(),
          fillStyle: '',
          globalAlpha: 1,
        }) as never,
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
      WIDTH,
    );
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
      HEIGHT,
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
      box(0),
    );
    dom = createDom();
    useStageStore.setState({ page: VENUES_PAGE });
  });

  afterEach(() => {
    dom.frame.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    useStageStore.setState({ page: 0 });
  });

  it('draws at about 30 fps on the venues page and places the label', () => {
    renderBand();
    advance(SECOND_MS);

    expect(drawnFrames()).toBeGreaterThanOrEqual(25);
    expect(drawnFrames()).toBeLessThanOrEqual(32);
    expect(dom.slide.style.getPropertyValue('--venue-label-x')).toMatch(/px$/);
    expect(dom.slide.style.getPropertyValue('--venue-label-opacity')).toBe('1');
  });

  it('draws nothing on other pages and resumes on the venues page', () => {
    useStageStore.setState({ page: VENUES_PAGE - 1 });
    renderBand();
    advance(SECOND_MS);
    expect(drawnFrames()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    act(() => useStageStore.setState({ page: VENUES_PAGE }));
    advance(SECOND_MS);
    expect(drawnFrames()).toBeGreaterThan(0);
  });

  it('pauses while the frame is off screen', () => {
    renderBand();
    act(() => observerCallback?.([{ isIntersecting: false }]));
    const framesOffScreen = drawnFrames();
    advance(SECOND_MS);

    expect(drawnFrames()).toBe(framesOffScreen);
  });

  it('draws only the active slide and reads no box but the frame', () => {
    const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
    const getBox = vi.mocked(Element.prototype.getBoundingClientRect);
    renderBand();
    advance(SECOND_MS);

    expect(getContext.mock.contexts).toEqual([dom.canvas]);
    expect(getBox.mock.contexts.every((element) => element === dom.frame)).toBe(
      true,
    );
  });

  it('resizes the band when the frame resizes', () => {
    let resizeCallback: ((entries: unknown[]) => void) | null = null;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: (entries: unknown[]) => void) {
          resizeCallback = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    renderBand();
    advance(SECOND_MS);
    expect(dom.canvas.width).toBe(WIDTH);

    act(() => resizeCallback?.([{ contentRect: { width: 280, height: 350 } }]));
    advance(SECOND_MS);
    expect(dom.canvas.width).toBe(280);
    expect(dom.canvas.height).toBe(350);
  });

  it('only redraws on change with reduced motion', () => {
    media.setMatches(REDUCED_MOTION_QUERY, true);
    renderBand();
    advance(SECOND_MS);
    expect(drawnFrames()).toBe(1);

    dom.canvas.dataset.text = 'Arcade Bar';
    advance(SECOND_MS);
    expect(drawnFrames()).toBe(2);
  });

  it('stops on unmount', () => {
    const { unmount } = renderBand();
    advance(SECOND_MS);
    unmount();
    const framesAtUnmount = drawnFrames();
    advance(SECOND_MS);

    expect(drawnFrames()).toBe(framesAtUnmount);
    expect(vi.getTimerCount()).toBe(0);
  });
});
