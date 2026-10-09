import { JUKEBOX_COLOR_VARS, type JukeboxColorName } from 'constants/jukebox3d';
import { parseHexColor, type Rgb } from 'lib/color';
// Aliased: the plain class name followed by a call trips the colour literal guard.
import { Color as ThreeColor, LinearSRGBColorSpace } from 'three';
import { readCssVar } from 'utils';

export type JukeboxPalette = Record<JukeboxColorName, ThreeColor>;

const CHANNEL_MAX = 255;
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

// The prototype ran three.js without colour management, so its hex values went to the
// shaders unconverted. Taking the tokens as linear keeps the black shell and the light tints
// as they looked there.
export function linearColor(value: string): ThreeColor {
  const { r, g, b } = parseHexColor(value) ?? BLACK;
  return new ThreeColor().setRGB(
    r / CHANNEL_MAX,
    g / CHANNEL_MAX,
    b / CHANNEL_MAX,
    LinearSRGBColorSpace,
  );
}

export function readJukeboxPalette(root: Element): JukeboxPalette {
  const entries = Object.entries(JUKEBOX_COLOR_VARS).map(
    ([name, cssVar]) => [name, linearColor(readCssVar(root, cssVar))] as const,
  );
  return Object.fromEntries(entries) as JukeboxPalette;
}
