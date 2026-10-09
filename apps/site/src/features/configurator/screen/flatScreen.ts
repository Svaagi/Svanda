import type { ProjectedVpRange } from 'constants/jukebox3d';

type BoxSize = { width: number; height: number };

// The scale that fits a `screen` box whole inside `container`; 0 while the container has no
// size yet.
export function fitScale(container: BoxSize, screen: BoxSize): number {
  if (container.width <= 0 || container.height <= 0) return 0;
  return Math.min(
    container.width / screen.width,
    container.height / screen.height,
  );
}

// The flat screen shows (and animates) over the same stretch of the page as the projected
// one would.
export const isOutsideVpRange = (
  vp: number,
  { fromVp, toVp }: ProjectedVpRange,
): boolean => vp <= fromVp || vp >= toVp;
