// Fills a square grid cell shrunk by `insetPx` on every side, so neighbouring cells read as
// separate pixels. Colour and alpha are whatever the context currently holds.
export function fillInsetCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  insetPx: number,
) {
  const insetSize = size - insetPx - insetPx;
  context.fillRect(x + insetPx, y + insetPx, insetSize, insetSize);
}
