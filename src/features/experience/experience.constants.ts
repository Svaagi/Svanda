/** Total scroll height of the experience section in vh */
export const SCROLL_HEIGHT_VH = 300;

/**
 * Panel [start, end] ranges in scroll progress (0→1).
 * Consecutive panels OVERLAP by 0.04 so there is always a crossfade
 * — never a blank frame between panels.
 *
 * Step between panel starts = 0.16
 * Each panel span          = 0.20
 * Overlap                  = 0.04  (one panel fades in while the previous fades out)
 */
export const PANEL_RANGES: [number, number][] = [
  [0.00, 0.20],
  [0.16, 0.36],
  [0.32, 0.52],
  [0.48, 0.68],
  [0.64, 0.84],
  [0.80, 1.00],
];

/** Fraction of a panel's span used for the fade-IN animation (0→1 opacity) */
export const PANEL_ENTER_RATIO = 0.20;
/** Fraction of a panel's span used for the fade-OUT animation (1→0 opacity) */
export const PANEL_EXIT_RATIO  = 0.20;

/** Horizontal travel distance (px) for slide-in / slide-out transforms */
export const ANIM_SLIDE_PX  = 220;
export const ANIM_SLIDE_OUT = 160;

/** Vertical travel distance (px) for rise/drop transforms */
export const ANIM_DRIFT_PX  = 60;
export const ANIM_DRIFT_OUT = 40;

/** Central box Y drift — starts at 0 (center), drifts to +120 (below center) */
export const BOX_DRIFT_TOP    = 0;
export const BOX_DRIFT_BOTTOM = 120;

/** Box Y-axis rotation keyframes driven by scroll */
export const BOX_ROTATE_KEYS:   number[] = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const BOX_ROTATE_VALUES: number[] = [-18, 14, -11, 16, -9, 12];
