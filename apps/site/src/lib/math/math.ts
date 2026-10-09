export const HALF = 0.5;
const PI_PER_FULL_TURN = 2;
export const FULL_TURN_RAD = Math.PI * PI_PER_FULL_TURN;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const DECIMAL_BASE = 10;

export function roundTo(value: number, decimals: number): number {
  const factor = DECIMAL_BASE ** decimals;
  return Math.round(value * factor) / factor;
}

export function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

// Standard easeInOutQuad over a 0..1 progress.
/* eslint-disable @typescript-eslint/no-magic-numbers -- textbook easing formula */
export function easeInOut(progress: number): number {
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - (-2 * progress + 2) ** 2 / 2;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

/* eslint-disable @typescript-eslint/no-magic-numbers -- textbook easing formulas */
// Cubic ease out: fast start, gentle landing.
export function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

// Ease out that overshoots the end by an amount set by `overshoot`, then settles back.
export function easeOutBack(progress: number, overshoot: number): number {
  const cubic = overshoot + 1;
  return 1 + cubic * (progress - 1) ** 3 + overshoot * (progress - 1) ** 2;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
