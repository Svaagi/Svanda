import {
  DISPLAY_SPLIT_KEY_BIG_STEP_PERCENT,
  DISPLAY_SPLIT_KEY_STEP_PERCENT,
  DISPLAY_SPLIT_MAX_PERCENT,
  DISPLAY_SPLIT_MIN_PERCENT,
} from 'constants/jukeboxUi';
import { clamp } from 'lib/math';

const PERCENT = 100;

export function clampSplit(percent: number): number {
  return clamp(percent, DISPLAY_SPLIT_MIN_PERCENT, DISPLAY_SPLIT_MAX_PERCENT);
}

// The split under a pointer `offsetPx` from the left edge of a `widthPx` wide surface; null
// while the surface has no width to measure against.
export function splitFromOffset(
  offsetPx: number,
  widthPx: number,
): number | null {
  if (widthPx <= 0) return null;
  return clampSplit((offsetPx / widthPx) * PERCENT);
}

type SplitKey = { key: string; shiftKey: boolean };

// The split after a key press, or null for keys that do not move it. Up and Down stay with
// the stage, which pages on them.
export function splitAfterKey(
  percent: number,
  { key, shiftKey }: SplitKey,
): number | null {
  const step = shiftKey
    ? DISPLAY_SPLIT_KEY_BIG_STEP_PERCENT
    : DISPLAY_SPLIT_KEY_STEP_PERCENT;
  switch (key) {
    case 'ArrowLeft':
      return clampSplit(percent - step);
    case 'ArrowRight':
      return clampSplit(percent + step);
    case 'Home':
      return DISPLAY_SPLIT_MIN_PERCENT;
    case 'End':
      return DISPLAY_SPLIT_MAX_PERCENT;
    default:
      return null;
  }
}
