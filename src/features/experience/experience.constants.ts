/** Total scroll height — 500 vh gives ~83 vh per panel of comfortable reading */
export const SCROLL_HEIGHT_VH = 500;

/**
 * Off-screen translation distance (px).
 * Larger than any realistic viewport — clipped by overflow:hidden on the stage.
 */
export const OFFSCREEN_PX = 3000;

/** Box Y drift: starts at 0 (viewport center), drifts 120 px down by end */
export const BOX_DRIFT_START =   0;
export const BOX_DRIFT_END   = 120;

/** Box Y-rotation keyframes driven by scroll progress */
export const BOX_ROTATE_KEYS:   number[] = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const BOX_ROTATE_VALUES: number[] = [-18, 14, -11, 16, -9, 12];

/**
 * Per-panel scroll ranges  [enterStart, enterEnd, exitStart, exitEnd]
 * Consecutive panels overlap by 0.02 so a crossfade always exists.
 * Each panel holds at full position for (exitStart - enterEnd) × 500vh of scroll.
 */
export const PANEL_RANGES: [number, number, number, number][] = [
  [0.00, 0.04, 0.14, 0.18],  // panel 0
  [0.16, 0.20, 0.30, 0.34],  // panel 1
  [0.32, 0.36, 0.48, 0.52],  // panel 2
  [0.50, 0.54, 0.66, 0.70],  // panel 3
  [0.68, 0.72, 0.82, 0.86],  // panel 4
  [0.84, 0.88, 0.96, 1.00],  // panel 5
];
