import { act, render, screen } from '@testing-library/react';
import { GLASS_UI_DEFAULTS, PIXEL_UI_DEFAULTS } from 'constants/jukeboxUi';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { useMemo, useRef } from 'react';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LavaLamp } from './LavaLamp';
import { glassLavaSettings, pixelLavaSettings } from './lavaSettings';
import { type LavaLampSlot, useLavaLamps } from './useLavaLamps';

const SECOND_MS = 1000;
const PIXEL = pixelLavaSettings(PIXEL_UI_DEFAULTS.sing);
const GLASS = glassLavaSettings(GLASS_UI_DEFAULTS.sing);

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

type LampsProps = {
  isPaused?: boolean;
  isGlassHidden?: boolean;
  pixel?: typeof PIXEL;
};

function Lamps({
  isPaused = false,
  isGlassHidden = false,
  pixel = PIXEL,
}: LampsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pixelRef = useRef<HTMLCanvasElement>(null);
  const glassRef = useRef<HTMLCanvasElement>(null);
  const lamps = useMemo<LavaLampSlot[]>(
    () => [
      { canvasRef: pixelRef, settings: pixel, isHidden: false },
      { canvasRef: glassRef, settings: GLASS, isHidden: isGlassHidden },
    ],
    [pixel, isGlassHidden],
  );
  useLavaLamps(rootRef, lamps, isPaused);

  return (
    <div ref={rootRef}>
      <LavaLamp settings={pixel} canvasRef={pixelRef} testId="pixel" />
      <LavaLamp settings={GLASS} canvasRef={glassRef} testId="glass" />
    </div>
  );
}

const createFakeContext = (canvas: HTMLCanvasElement) =>
  ({
    canvas,
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    putImageData: vi.fn(),
    getImageData: vi.fn(
      (_x: number, _y: number, width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
      }),
    ),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyle: '',
  }) as unknown as CanvasRenderingContext2D;

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe('useLavaLamps', () => {
  let contexts: CanvasRenderingContext2D[];
  let observers: ObserverCallback[];
  let media: ReturnType<typeof createMatchMediaMock>;

  // Frames drawn on a lamp's canvas: each is one full put at the origin.
  const framesOf = (testId: string) => {
    const canvas = screen.getByTestId(`${testId}-canvas`);
    return contexts
      .filter((context) => context.canvas === canvas)
      .flatMap((context) => vi.mocked(context.putImageData).mock.calls)
      .filter(([, x, y]) => x === 0 && y === 0).length;
  };
  const allFrames = () => framesOf('pixel') + framesOf('glass');

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    });
    contexts = [];
    observers = [];
    media = createMatchMediaMock();
    vi.stubGlobal('matchMedia', media.matchMedia);
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: ObserverCallback) {
          observers.push(callback);
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      function (this: HTMLCanvasElement) {
        const context = createFakeContext(this);
        contexts.push(context);
        return context as never;
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('runs both lamps on one loop, each at its own frame rate', () => {
    render(<Lamps />);

    expect(observers).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(1);
    advance(SECOND_MS);
    expect(framesOf('pixel')).toBeGreaterThanOrEqual(9);
    expect(framesOf('pixel')).toBeLessThanOrEqual(13);
    expect(framesOf('glass')).toBeGreaterThanOrEqual(18);
    expect(framesOf('glass')).toBeLessThanOrEqual(25);
  });

  it('draws at the low resolution of each design', () => {
    render(<Lamps />);

    expect(screen.getByTestId('pixel-canvas')).toHaveAttribute('width', '45');
    expect(screen.getByTestId('glass-canvas')).toHaveAttribute('width', '90');
    expect(screen.getByTestId('pixel-scanlines')).toBeInTheDocument();
    expect(screen.queryByTestId('glass-scanlines')).toBeNull();
  });

  it('skips a hidden lamp', () => {
    render(<Lamps isGlassHidden />);

    advance(SECOND_MS);
    expect(framesOf('pixel')).toBeGreaterThan(0);
    expect(framesOf('glass')).toBe(0);
  });

  it('draws nothing while paused and picks up when resumed', () => {
    const { rerender } = render(<Lamps isPaused />);

    advance(SECOND_MS);
    expect(allFrames()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    rerender(<Lamps />);
    advance(SECOND_MS);
    expect(allFrames()).toBeGreaterThan(0);
  });

  it('draws no frames off screen', () => {
    render(<Lamps />);

    act(() => observers[0]?.([{ isIntersecting: false }]));
    const framesOffScreen = allFrames();
    advance(SECOND_MS);
    expect(allFrames()).toBe(framesOffScreen);
  });

  it('draws one still frame per lamp with reduced motion', () => {
    media.setMatches(REDUCED_MOTION_QUERY, true);
    render(<Lamps />);

    advance(SECOND_MS);
    expect(framesOf('pixel')).toBe(1);
    expect(framesOf('glass')).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps a lamp still when its motion is switched off', () => {
    const pixel = pixelLavaSettings({
      ...PIXEL_UI_DEFAULTS.sing,
      animate: false,
    });
    render(<Lamps pixel={pixel} />);

    advance(SECOND_MS);
    expect(framesOf('pixel')).toBe(1);
    expect(framesOf('glass')).toBeGreaterThan(1);
  });

  it('stops its loop on unmount', () => {
    const { unmount } = render(<Lamps />);
    advance(SECOND_MS);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
