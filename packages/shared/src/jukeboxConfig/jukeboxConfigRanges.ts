export type ConfigRange = {
  min: number;
  max: number;
  step: number;
};

const ALPHA: ConfigRange = { min: 0, max: 1, step: 0.05 };
const SPEED: ConfigRange = { min: 0.2, max: 3, step: 0.1 };
const MODAL_ALPHA: ConfigRange = { min: 0.3, max: 1, step: 0.05 };
const GLASS_ALPHA: ConfigRange = { min: 0, max: 0.5, step: 0.01 };

// Bounds of every numeric setting: the schema rejects values outside them and the
// configurator's sliders use them with their step. Sizes are in design pixels.
export const LAVA_LAMP_RANGES = {
  blobAlpha: ALPHA,
  speed: SPEED,
} satisfies Record<string, ConfigRange>;

export const PIXEL_UI_RANGES = {
  ...LAVA_LAMP_RANGES,
  pixel: { min: 6, max: 30, step: 1 },
  panelA: { min: 0, max: 1, step: 0.025 },
  rowA: { min: 0, max: 1, step: 0.01 },
  modalA: MODAL_ALPHA,
} satisfies Record<string, ConfigRange>;

export const GLASS_UI_RANGES = {
  ...LAVA_LAMP_RANGES,
  blur: { min: 0, max: 30, step: 1 },
  glassA: GLASS_ALPHA,
  panelA: GLASS_ALPHA,
  rowA: GLASS_ALPHA,
  modalA: MODAL_ALPHA,
} satisfies Record<string, ConfigRange>;
