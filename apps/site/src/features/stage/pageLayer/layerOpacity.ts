import { clamp } from 'lib/math';

// Mirrors the CSS opacity of a layer: full on its page, fading out within 1 / fadeRate pages.
export function layerOpacity(
  vp: number,
  pageIndex: number,
  fadeRate: number,
): number {
  return clamp(1 - Math.abs(vp - pageIndex) * fadeRate, 0, 1);
}
