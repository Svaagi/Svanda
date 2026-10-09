export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
