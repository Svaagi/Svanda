import {
  type ConfigRange,
  GLASS_UI_RANGES,
  type GlassUiConfig,
  type JukeboxUiDesign,
  LAVA_LAMP_RANGES,
  PIXEL_UI_RANGES,
  type PixelUiConfig,
} from '@svanda/shared';
import type { Catalog } from 'i18n/catalogs';

type ControlsCatalog = Catalog['configurator']['controls'];

// Copy for a control lives at `configurator.controls.<copyId>.label` (and `.hint`).
export type ControlCopyId = {
  [Id in keyof ControlsCatalog]: ControlsCatalog[Id] extends { label: string }
    ? Id
    : never;
}[keyof ControlsCatalog];

export type ConfigGroupId = keyof Catalog['configurator']['groups'];

// How a range value reads: 0.42 as 42 %, 1.5 as 1.5x, 12 as 12 px.
export type RangeFormat = 'percent' | 'multiplier' | 'px';

type KeysOfType<TConfig, TValue> = {
  [Key in keyof TConfig]: TConfig[Key] extends TValue ? Key : never;
}[keyof TConfig];

type ControlBase<TKey> = {
  key: TKey;
  copyId: ControlCopyId;
  hasHint: boolean;
};

export type ColorControl<TConfig> = ControlBase<KeysOfType<TConfig, string>> & {
  kind: 'color';
  hasSwatches: boolean;
};

export type RangeControl<TConfig> = ControlBase<KeysOfType<TConfig, number>> & {
  kind: 'range';
  range: ConfigRange;
  format: RangeFormat;
};

export type SwitchControl<TConfig> = ControlBase<
  KeysOfType<TConfig, boolean>
> & {
  kind: 'switch';
};

export type ConfigControl<TConfig> =
  ColorControl<TConfig> | RangeControl<TConfig> | SwitchControl<TConfig>;

export type ConfigGroup<TConfig> = {
  id: ConfigGroupId;
  controls: readonly ConfigControl<TConfig>[];
};

type ControlOptions = {
  copyId?: ControlCopyId;
  hasHint?: boolean;
};

// Every setting's own name is also its copy id unless `copyId` says otherwise.
const controlBase = <TKey extends ControlCopyId>(
  key: TKey,
  { copyId = key, hasHint = false }: ControlOptions,
) => ({ key, copyId, hasHint });

const colorControl = <TKey extends ControlCopyId>(
  key: TKey,
  {
    hasSwatches = false,
    ...options
  }: ControlOptions & {
    hasSwatches?: boolean;
  } = {},
) => ({ kind: 'color' as const, ...controlBase(key, options), hasSwatches });

const rangeControl = <TKey extends ControlCopyId>(
  key: TKey,
  bounds: ConfigRange,
  format: RangeFormat,
  options: ControlOptions = {},
) => ({
  kind: 'range' as const,
  ...controlBase(key, options),
  range: bounds,
  format,
});

const switchControl = <TKey extends ControlCopyId>(
  key: TKey,
  options: ControlOptions = {},
) => ({ kind: 'switch' as const, ...controlBase(key, options) });

// Both designs share the lava lamp background.
const BACKGROUND_GROUP = {
  id: 'background',
  controls: [
    colorControl('base'),
    colorControl('blob1'),
    colorControl('blob2'),
    colorControl('blob3'),
    rangeControl('blobAlpha', LAVA_LAMP_RANGES.blobAlpha, 'percent'),
  ],
} as const;

const PIXEL_GROUPS: readonly ConfigGroup<PixelUiConfig>[] = [
  BACKGROUND_GROUP,
  {
    id: 'effects',
    controls: [
      switchControl('animate'),
      rangeControl('speed', PIXEL_UI_RANGES.speed, 'multiplier'),
      rangeControl('pixel', PIXEL_UI_RANGES.pixel, 'px', { hasHint: true }),
      switchControl('glitch', { hasHint: true }),
      switchControl('scan'),
    ],
  },
  {
    id: 'buttons',
    controls: [
      colorControl('acc', { hasHint: true, hasSwatches: true }),
      colorControl('accInk'),
      colorControl('btnLine'),
      colorControl('vip'),
    ],
  },
  {
    id: 'songList',
    controls: [
      rangeControl('panelA', PIXEL_UI_RANGES.panelA, 'percent'),
      rangeControl('rowA', PIXEL_UI_RANGES.rowA, 'percent'),
      colorControl('rowLine'),
      colorControl('txt'),
      colorControl('now', { hasHint: true, hasSwatches: true }),
      rangeControl('modalA', PIXEL_UI_RANGES.modalA, 'percent', {
        hasHint: true,
      }),
    ],
  },
];

const GLASS_GROUPS: readonly ConfigGroup<GlassUiConfig>[] = [
  BACKGROUND_GROUP,
  {
    id: 'effects',
    controls: [
      switchControl('animate'),
      rangeControl('speed', GLASS_UI_RANGES.speed, 'multiplier'),
      rangeControl('blur', GLASS_UI_RANGES.blur, 'px', { hasHint: true }),
    ],
  },
  {
    id: 'buttons',
    controls: [
      colorControl('acc', {
        copyId: 'glassAcc',
        hasHint: true,
        hasSwatches: true,
      }),
      rangeControl('glassA', GLASS_UI_RANGES.glassA, 'percent', {
        hasHint: true,
      }),
      colorControl('vip'),
    ],
  },
  {
    id: 'songList',
    controls: [
      rangeControl('panelA', GLASS_UI_RANGES.panelA, 'percent', {
        copyId: 'glassPanelA',
      }),
      rangeControl('rowA', GLASS_UI_RANGES.rowA, 'percent', {
        copyId: 'glassRowA',
      }),
      colorControl('txt'),
      colorControl('now', { hasSwatches: true }),
      rangeControl('modalA', GLASS_UI_RANGES.modalA, 'percent'),
    ],
  },
];

// The configurator's controls per design, grouped as the accordions show them.
export const CONFIG_GROUPS: {
  [Design in JukeboxUiDesign]: readonly ConfigGroup<
    Design extends 'pixel' ? PixelUiConfig : GlassUiConfig
  >[];
} = {
  pixel: PIXEL_GROUPS,
  glass: GLASS_GROUPS,
};
