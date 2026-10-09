import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCanvasSize } from './canvasSize';

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'clientWidth', { value: width });
  Object.defineProperty(canvas, 'clientHeight', { value: height });
  const context = {
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return { canvas, context };
}

describe('bindCanvasSize', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sizes the backing store for the capped device pixel ratio', () => {
    vi.stubGlobal('devicePixelRatio', 3);
    const { canvas, context } = createCanvas(400.6, 300);
    const handleResize = vi.fn();

    const unbind = bindCanvasSize(canvas, context, handleResize);

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(handleResize).toHaveBeenCalledWith(400, 300);
    unbind();
  });

  it('resizes on window resize until unbound', () => {
    const { canvas, context } = createCanvas(100, 100);
    const handleResize = vi.fn();

    const unbind = bindCanvasSize(canvas, context, handleResize);
    window.dispatchEvent(new Event('resize'));
    unbind();
    window.dispatchEvent(new Event('resize'));

    expect(handleResize).toHaveBeenCalledTimes(2);
  });
});
