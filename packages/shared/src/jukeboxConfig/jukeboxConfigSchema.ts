import { z } from 'zod';

import {
  type ConfigRange,
  GLASS_UI_RANGES,
  LAVA_LAMP_RANGES,
  PIXEL_UI_RANGES,
} from './jukeboxConfigRanges.js';

// The jukebox app's two screens: singing (karaoke versions) and listening (normal).
export const JUKEBOX_SECTIONS = ['sing', 'listen'] as const;

export type JukeboxSection = (typeof JUKEBOX_SECTIONS)[number];

export const JUKEBOX_UI_DESIGNS = ['pixel', 'glass'] as const;

export type JukeboxUiDesign = (typeof JUKEBOX_UI_DESIGNS)[number];

const HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;

const hexColor = z.string().regex(HEX_COLOR_PATTERN);

const inRange = ({ min, max }: ConfigRange) => z.number().min(min).max(max);

// The lava lamp background both designs share: three blob colours over the base, the blob
// strength, whether it moves and how fast (a multiplier).
const lavaLampShape = {
  base: hexColor,
  blob1: hexColor,
  blob2: hexColor,
  blob3: hexColor,
  blobAlpha: inRange(LAVA_LAMP_RANGES.blobAlpha),
  animate: z.boolean(),
  speed: inRange(LAVA_LAMP_RANGES.speed),
};

export const lavaLampConfigSchema = z.strictObject(lavaLampShape);

// `pixel` is one background block in design pixels; `glitch` tears rows now and then,
// `scan` lays scanlines and a checker over the background.
export const pixelUiConfigSchema = z.strictObject({
  ...lavaLampShape,
  pixel: inRange(PIXEL_UI_RANGES.pixel),
  glitch: z.boolean(),
  scan: z.boolean(),
  acc: hexColor,
  accInk: hexColor,
  btnLine: hexColor,
  vip: hexColor,
  now: hexColor,
  txt: hexColor,
  panelA: inRange(PIXEL_UI_RANGES.panelA),
  rowA: inRange(PIXEL_UI_RANGES.rowA),
  rowLine: hexColor,
  modalA: inRange(PIXEL_UI_RANGES.modalA),
});

// `blur` softens the lava lamp, in design pixels.
export const glassUiConfigSchema = z.strictObject({
  ...lavaLampShape,
  blur: inRange(GLASS_UI_RANGES.blur),
  acc: hexColor,
  vip: hexColor,
  now: hexColor,
  txt: hexColor,
  glassA: inRange(GLASS_UI_RANGES.glassA),
  panelA: inRange(GLASS_UI_RANGES.panelA),
  rowA: inRange(GLASS_UI_RANGES.rowA),
  modalA: inRange(GLASS_UI_RANGES.modalA),
});

const bySection = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.strictObject({ sing: schema, listen: schema });

// The whole configuration as the configurator exports it and the contact form attaches it.
export const jukeboxConfigSchema = z.strictObject({
  pixel: bySection(pixelUiConfigSchema),
  glass: bySection(glassUiConfigSchema),
});

const partialBySection = <TSchema extends z.ZodObject>(schema: TSchema) =>
  z
    .strictObject({ sing: schema.partial(), listen: schema.partial() })
    .partial();

// Any subset of the configuration (an import may carry only some designs, sections or
// settings); every value that is present must be valid.
export const jukeboxConfigPatchSchema = z
  .strictObject({
    pixel: partialBySection(pixelUiConfigSchema),
    glass: partialBySection(glassUiConfigSchema),
  })
  .partial();

export type LavaLampConfig = z.infer<typeof lavaLampConfigSchema>;
export type PixelUiConfig = z.infer<typeof pixelUiConfigSchema>;
export type GlassUiConfig = z.infer<typeof glassUiConfigSchema>;
export type JukeboxConfig = z.infer<typeof jukeboxConfigSchema>;
