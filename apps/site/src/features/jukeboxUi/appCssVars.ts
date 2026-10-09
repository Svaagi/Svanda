import type { GlassUiConfig, PixelUiConfig } from 'constants/jukeboxUi';
import type { CSSProperties } from 'react';

// Custom properties the app UI stylesheets read. Shades derived from a colour (highlights,
// tints, glows) are mixed in CSS, so a config only carries the colours a person picks.
export type AppCssVars = Record<`--app-${string}`, string | number>;

const sharedCssVars = (config: PixelUiConfig | GlassUiConfig): AppCssVars => ({
  '--app-base': config.base,
  '--app-txt': config.txt,
  '--app-acc': config.acc,
  '--app-vip': config.vip,
  '--app-now': config.now,
  '--app-panel-a': config.panelA,
  '--app-row-a': config.rowA,
  '--app-modal-a': config.modalA,
});

export function pixelCssVars(config: PixelUiConfig): AppCssVars {
  return {
    ...sharedCssVars(config),
    '--app-acc-ink': config.accInk,
    '--app-btn-line': config.btnLine,
    '--app-row-line': config.rowLine,
  };
}

export function glassCssVars(config: GlassUiConfig): AppCssVars {
  return { ...sharedCssVars(config), '--app-glass-a': config.glassA };
}

// React types `style` without custom properties.
export const toStyle = (cssVars: AppCssVars) => cssVars as CSSProperties;
