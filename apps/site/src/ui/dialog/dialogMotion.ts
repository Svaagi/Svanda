import { DIALOG_DURATION_S, DIALOG_OFFSET_PX } from 'constants/motion';

interface PresenceMotion {
  initial: { opacity: number; y?: number };
  animate: { opacity: number; y?: number };
  exit: { opacity: number; y?: number };
  transition: { duration: number };
}

const HIDDEN = 0;
const SHOWN = 1;

export function getOverlayMotion(isReducedMotion: boolean): PresenceMotion {
  return {
    initial: { opacity: HIDDEN },
    animate: { opacity: SHOWN },
    exit: { opacity: HIDDEN },
    transition: { duration: isReducedMotion ? 0 : DIALOG_DURATION_S },
  };
}

export function getContentMotion(isReducedMotion: boolean): PresenceMotion {
  if (isReducedMotion) return getOverlayMotion(true);

  return {
    initial: { opacity: HIDDEN, y: DIALOG_OFFSET_PX },
    animate: { opacity: SHOWN, y: 0 },
    exit: { opacity: HIDDEN, y: DIALOG_OFFSET_PX },
    transition: { duration: DIALOG_DURATION_S },
  };
}
