import type { JukeboxConfig } from './jukeboxConfigSchema.js';

const PIXEL_COMMON = {
  blobAlpha: 0.6,
  animate: true,
  speed: 1,
  pixel: 12,
  glitch: true,
  scan: true,
  accInk: '#050507',
  vip: '#ffd800',
  txt: '#ffffff',
  panelA: 0.425,
  rowA: 0.62,
  rowLine: '#34373e',
  modalA: 0.7,
} as const;

const GLASS_COMMON = {
  blobAlpha: 0.7,
  animate: true,
  speed: 1,
  blur: 10,
  vip: '#ffd36e',
  txt: '#ffffff',
  glassA: 0.16,
  panelA: 0.11,
  rowA: 0.12,
  modalA: 1,
} as const;

// The configuration a visitor starts from and returns to on reset. The site keeps the same
// colours as theme tokens for the previews that are not configurable.
export const JUKEBOX_CONFIG_DEFAULTS: JukeboxConfig = {
  pixel: {
    sing: {
      ...PIXEL_COMMON,
      base: '#05252d',
      blob1: '#3ee6ff',
      blob2: '#5ff5e0',
      blob3: '#2bc4dc',
      acc: '#2fcaca',
      btnLine: '#ffffff',
      now: '#3ee6ff',
    },
    listen: {
      ...PIXEL_COMMON,
      base: '#12012a',
      blob1: '#ff4fd8',
      blob2: '#7a5cff',
      blob3: '#c04fe8',
      acc: '#b6ff4d',
      btnLine: '#b6ff4d',
      now: '#ff4fd8',
    },
  },
  glass: {
    sing: {
      ...GLASS_COMMON,
      base: '#063d49',
      blob1: '#d4b307',
      blob2: '#d47b19',
      blob3: '#c36400',
      acc: '#ffd700',
      now: '#ffd809',
    },
    listen: {
      ...GLASS_COMMON,
      base: '#12012a',
      blob1: '#af54fe',
      blob2: '#b200e4',
      blob3: '#d466a0',
      acc: '#ff85c8',
      now: '#e068b2',
    },
  },
};

// Quick picks offered next to the accent and now-playing colours.
export const JUKEBOX_CONFIG_SWATCHES: readonly string[] = [
  '#b6ff4d',
  '#3ee6ff',
  '#ff9a3c',
  '#ff4fd8',
  '#7a5cff',
  '#5ff5e0',
  '#2fcaca',
  '#ffd800',
  '#ffffff',
  '#050507',
];
