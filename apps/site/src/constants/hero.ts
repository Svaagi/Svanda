// Hero background grid. Its cell follows the intro cell (plus a little), bounded below.
export const HERO_CELL_MIN_PX = 6;
export const HERO_CELL_EXTRA_PX = 4;
// The ghost wordmark spans the width minus these margins.
export const HERO_MARGIN_LANDSCAPE_PX = 40;
export const HERO_MARGIN_PORTRAIT_PX = 8;
// Landscape: two grid cells per wordmark module, shrunk if that would not fit the width.
export const HERO_MARK_SCALE_LANDSCAPE = 2;
export const HERO_MARK_SCALE_PORTRAIT = 1;
export const HERO_MARK_EDGE_PX = 16;
export const HERO_CELL_FALLBACK_MIN_PX = 4;
// Landscape: the wordmark sits a little below centre; portrait: on the model, higher up.
export const HERO_MARK_OFFSET_Y_PX = 20;
export const HERO_MARK_PORTRAIT_CENTRE_RATIO = 0.4;
// Cells fully behind the header (this token's height) are not drawn.
export const HERO_NAV_HEIGHT_VAR = '--nav-height';

// Variant A twinkle: a share of the cells blink on their own random period.
export const TWINKLE_CELL_SHARE = 0.34;
export const TWINKLE_PERIOD_MIN_S = 2.5;
export const TWINKLE_PERIOD_SPREAD_S = 5;
export const TWINKLE_ATTACK_S = 0.08;
export const TWINKLE_DECAY_S = 1.02;
export const TWINKLE_DECAY_EXPONENT = 2;
export const TWINKLE_MIN_ALPHA = 0.02;
export const TWINKLE_ALPHA = 0.85;
// Grey steps between the dim and bright cell tokens.
export const TWINKLE_SHADE_STEPS = 16;

// Hash salts keep the independent per-cell decisions uncorrelated.
export const TWINKLE_SHARE_SALT = 1;
export const TWINKLE_PERIOD_SALT = 2;
export const TWINKLE_PHASE_SALT = 3;
export const TWINKLE_SHADE_SALT = 5;
export const TORCH_DITHER_SALT = 21;

// Ghost wordmark: fades out over the first pages of `vp`.
export const MARK_ALPHA = 0.95;
export const MARK_FADE_RATE = 1.6;
// Colour steps along the wordmark gradient and towards its twinkle-lit shade.
export const MARK_GRADIENT_STEPS = 8;
export const MARK_LIT_STEPS = 8;

// Pixel torch around the pointer: stepped intensities, dithered towards the rim.
export const TORCH_RADIUS_PX = 240;
export const TORCH_FALLOFF_EXPONENT = 1.6;
export const TORCH_LEVELS = 4;
export const TORCH_DITHER_BASE = 0.35;

export const FLOOR_SHADOW_MIN_ALPHA = 0.02;
export const FLOOR_SHADOW_MIN_POINTS = 3;

// Idle redraw cap; while the pointer moves or the page turns, every frame draws.
export const HERO_IDLE_FRAME_MS = 50;
// Reduced motion shows the twinkle frozen at this moment.
export const HERO_REDUCED_MOTION_TIME_S = 0;

// Theme tokens the canvas reads.
export const HERO_COLOR_VARS = {
  cellDim: '--color-hero-cell-dim',
  cellBright: '--color-hero-cell-bright',
  markStart: '--color-hero-mark-start',
  markEnd: '--color-hero-mark-end',
  markLitStart: '--color-hero-mark-lit-start',
  markLitEnd: '--color-hero-mark-lit-end',
  light: '--color-fg',
  torchAlpha: '--hero-torch-alpha',
  shadowAlpha: '--hero-shadow-alpha',
} as const;
