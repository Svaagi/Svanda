import { hexToRgba, mixHexColors } from './hexColor.js';
import type {
  GlassUiConfig,
  JukeboxConfig,
  JukeboxSection,
  JukeboxUiDesign,
  PixelUiConfig,
} from './jukeboxConfigSchema.js';

const WHITE = '#ffffff';
const BLACK = '#000000';

// Shades the jukebox app derives from the accent and VIP colours.
const ACC_HI_RATIO = 0.55;
const ACC_LO_RATIO = 0.4;
const ACC_MID_RATIO = 0.55;
const ACC_TINT_ALPHA = 0.18;
const VIP_HI_RATIO = 0.5;
const VIP_LO_RATIO = 0.35;

type CssVars = Record<`--${string}`, string | number>;

const flag = (isOn: boolean) => (isOn ? 1 : 0);

const sharedVars = (config: PixelUiConfig | GlassUiConfig): CssVars => ({
  '--base': config.base,
  '--acc': config.acc,
  '--now': config.now,
  '--vip': config.vip,
  '--text': config.txt,
});

const lavaVars = (config: PixelUiConfig | GlassUiConfig): CssVars => ({
  '--lava-1': config.blob1,
  '--lava-2': config.blob2,
  '--lava-3': config.blob3,
  '--lava-alpha': config.blobAlpha,
});

const pixelVars = (config: PixelUiConfig): CssVars => ({
  ...sharedVars(config),
  '--acc-hi': mixHexColors(config.acc, WHITE, ACC_HI_RATIO),
  '--acc-lo': mixHexColors(config.acc, BLACK, ACC_LO_RATIO),
  '--acc-mid': mixHexColors(config.acc, BLACK, ACC_MID_RATIO),
  '--acc-tint': hexToRgba(config.acc, ACC_TINT_ALPHA),
  '--acc-ink': config.accInk,
  '--acc-border': config.btnLine,
  '--vip-hi': mixHexColors(config.vip, WHITE, VIP_HI_RATIO),
  '--vip-lo': mixHexColors(config.vip, BLACK, VIP_LO_RATIO),
  '--row-line': config.rowLine,
  '--list-alpha': config.panelA,
  '--row-alpha': config.rowA,
  '--modal-alpha': config.modalA,
  ...lavaVars(config),
  '--lava-pixel': `${config.pixel}px`,
  '--lava-speed': config.speed,
  '--lava-glitch': flag(config.glitch),
  '--scanlines': flag(config.scan),
  '--lava-animate': flag(config.animate),
});

const glassVars = (config: GlassUiConfig): CssVars => ({
  ...sharedVars(config),
  '--glass-alpha': config.glassA,
  '--panel-alpha': config.panelA,
  '--row-alpha': config.rowA,
  '--modal-alpha': config.modalA,
  ...lavaVars(config),
  '--lava-blur': `${config.blur}px`,
  '--lava-speed': config.speed,
  '--lava-animate': flag(config.animate),
});

// The listening screen is the app's default (`:root`); singing switches with `.mode-sing`.
const SECTION_SELECTORS: Record<JukeboxSection, string> = {
  listen: ':root',
  sing: '.mode-sing',
};
const EXPORT_ORDER: readonly JukeboxSection[] = ['listen', 'sing'];

// Translated names for the comment above each block.
export type JukeboxCssLabels = {
  design: string;
  sections: Record<JukeboxSection, string>;
};

const sectionVars = (
  config: JukeboxConfig,
  design: JukeboxUiDesign,
  section: JukeboxSection,
) =>
  design === 'pixel'
    ? pixelVars(config.pixel[section])
    : glassVars(config.glass[section]);

// Both sections of one design as the jukebox app's CSS variables.
export function jukeboxConfigToCss(
  config: JukeboxConfig,
  design: JukeboxUiDesign,
  labels: JukeboxCssLabels,
): string {
  return EXPORT_ORDER.flatMap((section) => [
    `/* ${labels.design} · ${labels.sections[section]} */`,
    `${SECTION_SELECTORS[section]} {`,
    ...Object.entries(sectionVars(config, design, section)).map(
      ([name, value]) => `  ${name}: ${value};`,
    ),
    '}',
    '',
  ]).join('\n');
}
