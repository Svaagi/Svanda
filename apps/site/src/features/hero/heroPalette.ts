import {
  HERO_COLOR_VARS,
  MARK_GRADIENT_STEPS,
  MARK_LIT_STEPS,
  TWINKLE_SHADE_STEPS,
} from 'constants/hero';
import { mixRgb, parseHexColor, type Rgb, toHexColor } from 'lib/color';
import { readCssVar } from 'utils';

export type HeroPalette = {
  // Twinkle cell greys, dim to bright.
  cellShades: readonly string[];
  // Wordmark greys by [gradient step][lit step].
  markShades: readonly (readonly string[])[];
  // Torch and floor shadow colour, with their theme-dependent strength.
  light: string;
  torchAlpha: number;
  shadowAlpha: number;
};

const BLACK: Rgb = { r: 0, g: 0, b: 0 };

const ramp = (from: Rgb, to: Rgb, steps: number) =>
  Array.from({ length: steps }, (_, i) => mixRgb(from, to, i / (steps - 1)));

// Picks one of `steps` evenly spaced entries for a 0..1 ratio.
export function shadeIndex(ratio: number, steps: number): number {
  return Math.min(steps - 1, Math.max(0, Math.round(ratio * (steps - 1))));
}

// Canvas needs real colour values: the theme tokens are resolved and the grey ramps built
// once per theme, so a frame only picks precomputed strings.
export function readHeroPalette(root: Element): HeroPalette {
  const readRgb = (name: string) =>
    parseHexColor(readCssVar(root, name)) ?? BLACK;
  const readNumber = (name: string) =>
    Number.parseFloat(readCssVar(root, name)) || 0;

  const markStarts = ramp(
    readRgb(HERO_COLOR_VARS.markStart),
    readRgb(HERO_COLOR_VARS.markEnd),
    MARK_GRADIENT_STEPS,
  );
  const markLitStarts = ramp(
    readRgb(HERO_COLOR_VARS.markLitStart),
    readRgb(HERO_COLOR_VARS.markLitEnd),
    MARK_GRADIENT_STEPS,
  );

  return {
    cellShades: ramp(
      readRgb(HERO_COLOR_VARS.cellDim),
      readRgb(HERO_COLOR_VARS.cellBright),
      TWINKLE_SHADE_STEPS,
    ).map(toHexColor),
    markShades: markStarts.map((base, i) =>
      ramp(base, markLitStarts[i] ?? base, MARK_LIT_STEPS).map(toHexColor),
    ),
    light: readCssVar(root, HERO_COLOR_VARS.light),
    torchAlpha: readNumber(HERO_COLOR_VARS.torchAlpha),
    shadowAlpha: readNumber(HERO_COLOR_VARS.shadowAlpha),
  };
}
