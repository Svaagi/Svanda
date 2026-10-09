// Intro timeline, in seconds from the moment the intro starts.
export const INTRO_PIXELS_END_S = 3.2;
// After the pixels resolve, the noise remnant lingers this long without the logo cells.
export const INTRO_REMNANT_S = 0.3;
// The last swarm cell lands before this; from here the DOM logo replaces the swarm.
export const INTRO_LOGO_LAND_S = 4.92;
export const INTRO_READY_S = 6.5;

// Each header reveal variable ramps 0 to 1 over its own window.
export const INTRO_NAV_START_S = 3.8;
export const INTRO_NAV_DURATION_S = 0.5;
export const INTRO_MENU_START_S = 4.4;
export const INTRO_MENU_DURATION_S = 0.8;
export const INTRO_HERO_START_S = 5.6;
export const INTRO_HERO_DURATION_S = 0.7;
// The solid cover over the stage fades out over this window.
export const INTRO_COVER_FADE_START_S = 4.6;
export const INTRO_COVER_FADE_DURATION_S = 0.9;
// Reveal variables are written with this precision, and only when they change.
export const INTRO_VAR_DECIMALS = 3;

// Intro grid: the wordmark spans the width minus a margin, within these cell sizes.
export const INTRO_CELL_MIN_PX = 8;
export const INTRO_CELL_MAX_PX = 24;
export const INTRO_GRID_MARGIN_PX = 40;
export const INTRO_SEED = 7;
// Retina canvases are capped: the cells are flat squares, more pixels buy nothing.
export const INTRO_MAX_DPR = 2;

// Each cell stops flickering at a random moment in this window; noise cells a little later.
export const INTRO_LOCK_START_S = 1.35;
export const INTRO_LOCK_SPREAD_S = 1.1;
export const INTRO_NOISE_LOCK_DELAY_S = 0.15;
// A locked logo cell flashes before taking its letter colour; a locked noise cell fades out.
export const INTRO_FLASH_S = 0.12;
export const INTRO_NOISE_FADE_S = 0.25;

// The noise resolves from 3 x 3 blocks to 2 x 2 to single cells.
export const INTRO_BLOCK_STEPS = [
  { untilS: 1.0, sizeCells: 3 },
  { untilS: 1.7, sizeCells: 2 },
] as const;
export const INTRO_FINAL_BLOCK_CELLS = 1;
export const INTRO_COLOR_REROLL_HZ = 7;
// Blocks re-roll out of phase: each one is offset by up to this many re-roll steps.
export const INTRO_REROLL_PHASE_STEPS = 3;
// Share of blocks that show a colour on a given re-roll step.
export const INTRO_NOISE_FILL_RATIO = 0.48;
export const INTRO_DENSITY_DROP_START_S = 1.3;
export const INTRO_DENSITY_DROP_S = 1.4;
export const INTRO_DENSITY_MIN = 0.15;
export const INTRO_DENSITY_SLACK = 0.05;
// Hash salts keep the independent noise decisions uncorrelated.
export const INTRO_NOISE_SALTS_PER_STEP = 3;
export const INTRO_NOISE_FILL_SALT = 1;
export const INTRO_NOISE_COLOR_SALT = 2;
export const INTRO_NOISE_PHASE_SALT = 9;
export const INTRO_NOISE_DENSITY_SALT = 77;
// Noise blocks and flying cells are drawn inset so neighbours read as separate pixels.
export const INTRO_CELL_GAP_PX = 1;

// Swarm: each logo cell leaves after a delay growing left to right, plus a random share.
export const SWARM_COLUMN_DELAY_S = 0.55;
export const SWARM_SEED_DELAY_S = 0.3;
export const SWARM_FLIGHT_S = 0.85;
// The Bezier control point sits above both ends, shifted sideways at random.
export const SWARM_ARC_SPREAD_PX = 320;
export const SWARM_ARC_LIFT_PX = 140;
export const SWARM_ARC_LIFT_RANDOM_PX = 260;
export const SWARM_TRAIL_COUNT = 3;
// Each ghost trails the cell by this much flight progress, at alpha TRAIL_ALPHA / k.
export const SWARM_TRAIL_STEP = 0.04;
export const SWARM_TRAIL_ALPHA = 0.25;

// Intro playback: once per browser session, never with reduced motion.
export const INTRO_SEEN_STORAGE_KEY = 'svanda-intro-seen';
export const INTRO_SEEN_VALUE = '1';
// `pending` is set before first paint by the init script, `playing` once the app runs it.
export const INTRO_ATTRIBUTE = 'data-intro';
export const INTRO_PENDING = 'pending';
export const INTRO_PLAYING = 'playing';
// Served from `public/`; it must stay an external file so the CSP needs no `unsafe-inline`.
export const INTRO_INIT_SCRIPT_SRC = '/intro-init.js';

// Noise palette tokens; the wordmark itself uses LETTER_COLOR_VARS.
export const INTRO_NOISE_COLOR_VARS = [
  '--color-intro-noise-1',
  '--color-intro-noise-2',
  '--color-intro-noise-3',
  '--color-intro-noise-4',
  '--color-intro-noise-5',
  '--color-intro-noise-6',
  '--color-intro-noise-7',
] as const;
export const INTRO_BACKGROUND_VAR = '--color-bg';
export const INTRO_FLASH_VAR = '--color-fg';

// The reveal variables the intro drives on <html>; global.css holds their final values.
export const INTRO_REVEAL_VARS = [
  '--sv-nav',
  '--sv-menu',
  '--sv-logo',
  '--sv-hero',
] as const;
// The timeline advances by at most this per frame: a hidden tab or a long stall resumes the
// intro where it stopped instead of jumping to the end.
export const INTRO_MAX_FRAME_MS = 100;
