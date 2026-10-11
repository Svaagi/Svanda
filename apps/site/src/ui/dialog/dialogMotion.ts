import {
  BOTTOM_SHEET_DURATION_S,
  DIALOG_DURATION_S,
  DIALOG_OFFSET_PX,
} from 'constants/motion';

interface PresenceMotion {
  initial: { opacity: number; y?: number | string };
  animate: { opacity: number; y?: number | string };
  exit: { opacity: number; y?: number | string };
  transition: { duration: number };
}

const HIDDEN = 0;
const SHOWN = 1;
// A bottom sheet starts and ends fully below the viewport edge.
const BELOW_EDGE = '100%';

export function getOverlayMotion(isReducedMotion: boolean): PresenceMotion {
  return {
    initial: { opacity: HIDDEN },
    animate: { opacity: SHOWN },
    exit: { opacity: HIDDEN },
    transition: { duration: isReducedMotion ? 0 : DIALOG_DURATION_S },
  };
}

export function getContentMotion(
  isReducedMotion: boolean,
  isBottomSheet = false,
): PresenceMotion {
  if (isReducedMotion) return getOverlayMotion(true);
  if (isBottomSheet) {
    return {
      initial: { opacity: SHOWN, y: BELOW_EDGE },
      animate: { opacity: SHOWN, y: 0 },
      exit: { opacity: SHOWN, y: BELOW_EDGE },
      transition: { duration: BOTTOM_SHEET_DURATION_S },
    };
  }

  return {
    initial: { opacity: HIDDEN, y: DIALOG_OFFSET_PX },
    animate: { opacity: SHOWN, y: 0 },
    exit: { opacity: HIDDEN, y: DIALOG_OFFSET_PX },
    transition: { duration: DIALOG_DURATION_S },
  };
}
