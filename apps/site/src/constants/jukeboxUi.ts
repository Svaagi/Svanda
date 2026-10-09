// The jukebox app's two screens: singing (karaoke versions) and listening (normal).
export const JUKEBOX_SECTIONS = ['sing', 'listen'] as const;

export type JukeboxSection = (typeof JUKEBOX_SECTIONS)[number];

export const JUKEBOX_UI_DESIGNS = ['pixel', 'glass'] as const;

export type JukeboxUiDesign = (typeof JUKEBOX_UI_DESIGNS)[number];

// Colours are CSS colours (a hex value from the configurator, or a theme token); alphas 0..1.
// Keys match the configurator's attachment payload.
export type PixelUiConfig = {
  base: string;
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

export type GlassUiConfig = {
  base: string;
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

const PIXEL_ALPHAS = { panelA: 0.425, rowA: 0.62, modalA: 0.7 } as const;

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
    ...PIXEL_ALPHAS,
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
    ...PIXEL_ALPHAS,
  },
};

const GLASS_ALPHAS = {
  glassA: 0.16,
  panelA: 0.11,
  rowA: 0.12,
  modalA: 1,
} as const;

export const GLASS_UI_DEFAULTS: Record<JukeboxSection, GlassUiConfig> = {
  sing: {
    base: token('glass-sing-base'),
    acc: token('glass-sing-acc'),
    vip: token('glass-vip'),
    now: token('glass-sing-now'),
    txt: token('text'),
    ...GLASS_ALPHAS,
  },
  listen: {
    base: token('glass-listen-base'),
    acc: token('glass-listen-acc'),
    vip: token('glass-vip'),
    now: token('glass-listen-now'),
    txt: token('text'),
    ...GLASS_ALPHAS,
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
