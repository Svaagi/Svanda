import {
  TORCH_DITHER_BASE,
  TORCH_DITHER_SALT,
  TORCH_FALLOFF_EXPONENT,
  TORCH_LEVELS,
  TORCH_RADIUS_PX,
} from 'constants/pixelEffects';
import { hash3 } from 'lib/random';

// Torch brightness at a distance from the pointer, quantised to TORCH_LEVELS steps:
// 1 at the centre, 0 at and beyond the radius.
export function torchLevel(distancePx: number): number {
  if (distancePx >= TORCH_RADIUS_PX) return 0;
  const falloff = (1 - distancePx / TORCH_RADIUS_PX) ** TORCH_FALLOFF_EXPONENT;
  return Math.ceil(falloff * TORCH_LEVELS) / TORCH_LEVELS;
}

// Hashed dither: towards the rim fewer cells light, so the steps break up into pixels.
export function isTorchCellLit(col: number, row: number, level: number) {
  return (
    level > 0 && hash3(col, row, TORCH_DITHER_SALT) <= TORCH_DITHER_BASE + level
  );
}
