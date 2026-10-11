import {
  type GlassUiConfig,
  JUKEBOX_CONFIG_DEFAULTS,
  type JukeboxSection,
  type PixelUiConfig,
} from '@svanda/shared';

// The app screen in design pixels (the CSS mirrors it in --jukebox-ui-*).
export const JUKEBOX_UI_WIDTH_PX = 540;
export const JUKEBOX_UI_HEIGHT_PX = 960;

const token = (name: string) => `var(--color-jukebox-ui-${name})`;

const blobTokens = (prefix: string) => ({
  blob1: token(`${prefix}-blob-1`),
  blob2: token(`${prefix}-blob-2`),
  blob3: token(`${prefix}-blob-3`),
});

// The configurator's defaults with every colour swapped for its theme token, for the
// previews that show the stock design.
export const PIXEL_UI_DEFAULTS: Record<JukeboxSection, PixelUiConfig> = {
  sing: {
    ...JUKEBOX_CONFIG_DEFAULTS.pixel.sing,
    base: token('pixel-sing-base'),
    acc: token('pixel-sing-acc'),
    accInk: token('pixel-acc-ink'),
    btnLine: token('pixel-sing-btn-line'),
    vip: token('pixel-vip'),
    now: token('pixel-sing-now'),
    txt: token('text'),
    rowLine: token('pixel-row-line'),
    ...blobTokens('pixel-sing'),
  },
  listen: {
    ...JUKEBOX_CONFIG_DEFAULTS.pixel.listen,
    base: token('pixel-listen-base'),
    acc: token('pixel-listen-acc'),
    accInk: token('pixel-acc-ink'),
    btnLine: token('pixel-listen-btn-line'),
    vip: token('pixel-vip'),
    now: token('pixel-listen-now'),
    txt: token('text'),
    rowLine: token('pixel-row-line'),
    ...blobTokens('pixel-listen'),
  },
};

export const GLASS_UI_DEFAULTS: Record<JukeboxSection, GlassUiConfig> = {
  sing: {
    ...JUKEBOX_CONFIG_DEFAULTS.glass.sing,
    base: token('glass-sing-base'),
    acc: token('glass-sing-acc'),
    vip: token('glass-vip'),
    now: token('glass-sing-now'),
    txt: token('text'),
    ...blobTokens('glass-sing'),
  },
  listen: {
    ...JUKEBOX_CONFIG_DEFAULTS.glass.listen,
    base: token('glass-listen-base'),
    acc: token('glass-listen-acc'),
    vip: token('glass-vip'),
    now: token('glass-listen-now'),
    txt: token('text'),
    ...blobTokens('glass-listen'),
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
