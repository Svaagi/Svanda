import { CANVAS_MAX_DPR } from 'constants/canvas';

// Sizes the backing store for the device pixel ratio (capped) on bind and on every window
// resize, so drawing code works in CSS px. Returns the unbind function.
export function bindCanvasSize(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  onResize: (width: number, height: number) => void,
): () => void {
  const resize = () => {
    const width = Math.floor(canvas.clientWidth);
    const height = Math.floor(canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, CANVAS_MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize(width, height);
  };

  resize();
  window.addEventListener('resize', resize);
  return () => window.removeEventListener('resize', resize);
}
