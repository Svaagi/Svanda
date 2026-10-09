// Twinkle shared by the pixel grids (hero background, venue band): a share of the cells blink
// on their own random period with a quick attack and a decay.
export const TWINKLE_CELL_SHARE = 0.34;
export const TWINKLE_PERIOD_MIN_S = 2.5;
export const TWINKLE_PERIOD_SPREAD_S = 5;
export const TWINKLE_ATTACK_S = 0.08;
export const TWINKLE_DECAY_S = 1.02;
// The hero decays quadratically, the venue band linearly.
export const TWINKLE_DECAY_EXPONENT = 2;

// Hash salts keep the independent per-cell decisions uncorrelated.
export const TWINKLE_SHARE_SALT = 1;
export const TWINKLE_PERIOD_SALT = 2;
export const TWINKLE_PHASE_SALT = 3;
export const TORCH_DITHER_SALT = 21;

// Pixel torch around the pointer: stepped intensities, dithered towards the rim.
export const TORCH_RADIUS_PX = 240;
export const TORCH_FALLOFF_EXPONENT = 1.6;
export const TORCH_LEVELS = 4;
export const TORCH_DITHER_BASE = 0.35;
