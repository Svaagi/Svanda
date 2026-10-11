import { VP_CSS_DECIMALS, VP_TWEEN_DURATION_MS } from 'constants/stage';
import { clamp, easeInOut, lerp } from 'lib/math';

export function tweenVp(from: number, to: number, elapsedMs: number): number {
  const progress = clamp(elapsedMs / VP_TWEEN_DURATION_MS, 0, 1);
  return lerp(from, to, easeInOut(progress));
}

export function formatVp(vp: number): string {
  return vp.toFixed(VP_CSS_DECIMALS);
}
