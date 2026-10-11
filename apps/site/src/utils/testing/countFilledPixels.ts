// Filled cells (`#`) in a pixel bitmap, for asserting rendered rect counts.
export function countFilledPixels(bitmap: readonly string[]): number {
  return bitmap.join('').replaceAll('.', '').length;
}
