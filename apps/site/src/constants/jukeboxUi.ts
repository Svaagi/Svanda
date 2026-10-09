// The jukebox app's two screens: singing (karaoke versions) and listening (normal).
export const JUKEBOX_SECTIONS = ['sing', 'listen'] as const;

export type JukeboxSection = (typeof JUKEBOX_SECTIONS)[number];

export const JUKEBOX_UI_DESIGNS = ['pixel', 'glass'] as const;

export type JukeboxUiDesign = (typeof JUKEBOX_UI_DESIGNS)[number];

// The app screen in design pixels (the CSS mirrors it in --jukebox-ui-*).
export const JUKEBOX_UI_WIDTH_PX = 540;
export const JUKEBOX_UI_HEIGHT_PX = 960;

// Colours are CSS colours (a hex value from the configurator, or a theme token); alphas 0..1.
// Keys match the configurator's attachment payload. The lava lamp background both designs
// share: three blob colours over the base, the blob strength (0..1), whether it moves and
// how fast (a multiplier).
export type LavaLampConfig = {
  base: string;
  blob1: string;
  blob2: string;
  blob3: string;
  blobAlpha: number;
  animate: boolean;
  speed: number;
};

// `pixel` is one background block in design pixels; `glitch` tears rows now and then,
// `scan` lays scanlines and a checker over the background.
export type PixelUiConfig = LavaLampConfig & {
  pixel: number;
  glitch: boolean;
  scan: boolean;
  acc: string;
  accInk: string;
  btnLine: string;
  vip: string;
  now: string;
  txt: string;
  rowLine: string;
  panelA: number;
  rowA: number;
  modalA: number;
};

// `blur` softens the lava lamp, in design pixels.
export type GlassUiConfig = LavaLampConfig & {
  blur: number;
  acc: string;
  vip: string;
  now: string;
  txt: string;
  glassA: number;
  panelA: number;
  rowA: number;
  modalA: number;
};

const token = (name: string) => `var(--color-jukebox-ui-${name})`;

const blobTokens = (prefix: string) => ({
  blob1: token(`${prefix}-blob-1`),
  blob2: token(`${prefix}-blob-2`),
  blob3: token(`${prefix}-blob-3`),
});

const PIXEL_SHARED = {
  panelA: 0.425,
  rowA: 0.62,
  modalA: 0.7,
  blobAlpha: 0.6,
  animate: true,
  speed: 1,
  pixel: 12,
  glitch: true,
  scan: true,
} as const;

export const PIXEL_UI_DEFAULTS: Record<JukeboxSection, PixelUiConfig> = {
  sing: {
    base: token('pixel-sing-base'),
    acc: token('pixel-sing-acc'),
    accInk: token('pixel-acc-ink'),
    btnLine: token('pixel-sing-btn-line'),
    vip: token('pixel-vip'),
    now: token('pixel-sing-now'),
    txt: token('text'),
    rowLine: token('pixel-row-line'),
    ...blobTokens('pixel-sing'),
    ...PIXEL_SHARED,
  },
  listen: {
    base: token('pixel-listen-base'),
    acc: token('pixel-listen-acc'),
    accInk: token('pixel-acc-ink'),
    btnLine: token('pixel-listen-btn-line'),
    vip: token('pixel-vip'),
    now: token('pixel-listen-now'),
    txt: token('text'),
    rowLine: token('pixel-row-line'),
    ...blobTokens('pixel-listen'),
    ...PIXEL_SHARED,
  },
};

const GLASS_SHARED = {
  glassA: 0.16,
  panelA: 0.11,
  rowA: 0.12,
  modalA: 1,
  blobAlpha: 0.7,
  animate: true,
  speed: 1,
  blur: 10,
} as const;

export const GLASS_UI_DEFAULTS: Record<JukeboxSection, GlassUiConfig> = {
  sing: {
    base: token('glass-sing-base'),
    acc: token('glass-sing-acc'),
    vip: token('glass-vip'),
    now: token('glass-sing-now'),
    txt: token('text'),
    ...blobTokens('glass-sing'),
    ...GLASS_SHARED,
  },
  listen: {
    base: token('glass-listen-base'),
    acc: token('glass-listen-acc'),
    vip: token('glass-vip'),
    now: token('glass-listen-now'),
    txt: token('text'),
    ...blobTokens('glass-listen'),
    ...GLASS_SHARED,
  },
};

// What the preview shows: the guest's credit per section and the two song prices, in CZK.
export const JUKEBOX_UI_CREDIT_CZK: Record<JukeboxSection, number> = {
  sing: 120,
  listen: 40,
};
export const JUKEBOX_UI_SONG_PRICE_CZK = 10;
export const JUKEBOX_UI_VIP_PRICE_CZK = 20;
export const JUKEBOX_UI_CURRENCY = 'CZK';

// Display compare: where the split between the pixel (left) and glass (right) designs sits,
// in percent of the screen width, and how far an arrow key (with Shift: a big step) moves it.
export const DISPLAY_SPLIT_MIN_PERCENT = 0;
export const DISPLAY_SPLIT_MAX_PERCENT = 100;
export const DISPLAY_SPLIT_DEFAULT_PERCENT = 50;
export const DISPLAY_SPLIT_KEY_STEP_PERCENT = 5;
export const DISPLAY_SPLIT_KEY_BIG_STEP_PERCENT = 20;
