export const PANEL_COUNT = 6;
export const PANEL_SIZE  = 1 / PANEL_COUNT;

export const PANEL_ENTER_RATIO = 0.02;
export const PANEL_EXIT_RATIO  = 0.06;

export const ANIM_SLIDE_PX  = 220;
export const ANIM_SLIDE_OUT = 170;
export const ANIM_DRIFT_PX  = 60;
export const ANIM_DRIFT_OUT = 45;

export const BOX_DRIFT_TOP    = -70;
export const BOX_DRIFT_BOTTOM =  70;

export const SCROLL_HEIGHT_VH = 100;

// number[] (not readonly tuple) so useTransform infers MotionValue<number>
export const BOX_ROTATE_KEYS:   number[] = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const BOX_ROTATE_VALUES: number[] = [-18, 14, -11, 16, -9, 12];

// Pre-computed panel boundaries — eliminates magic multipliers in the component
export const PANEL_STARTS: number[] = Array.from(
  { length: PANEL_COUNT },
  (_, idx) => idx * PANEL_SIZE,
);
export const PANEL_ENDS: number[] = [
  ...Array.from({ length: PANEL_COUNT - 1 }, (_, idx) => (idx + 1) * PANEL_SIZE),
  1.0,
];
