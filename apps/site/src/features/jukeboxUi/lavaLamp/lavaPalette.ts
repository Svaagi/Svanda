import type { LavaLampConfig } from '@svanda/shared';
import {
  LAVA_EDGE_DARKEN_RATIO,
  LAVA_GRADIENT_STOPS,
  LAVA_TEAR_STRIP_ALPHA,
} from 'constants/lavaLamp';
import { mixRgb, parseHexColor, type Rgb, toHexAlphaColor } from 'lib/color';
import { resolveCssValue } from 'utils';

// Canvas-ready colours, built once per configuration so a frame only picks strings.
export type LavaPalette = {
  base: Rgb;
  // Gradient stop colours per blob colour, in LAVA_GRADIENT_STOPS order.
  blobStops: readonly (readonly string[])[];
  // Glitch strip colour; null when the lamp does not tear.
  strip: string | null;
};

type LavaColors = {
  base: Rgb;
  blobs: readonly Rgb[];
  glitch: Rgb | null;
};

const BLACK: Rgb = { r: 0, g: 0, b: 0 };

export function createLavaPalette({
  base,
  blobs,
  glitch,
}: LavaColors): LavaPalette {
  return {
    base,
    blobStops: blobs.map((core) => {
      const edge = mixRgb(core, BLACK, LAVA_EDGE_DARKEN_RATIO);
      return LAVA_GRADIENT_STOPS.map(({ alpha, isEdge }) =>
        toHexAlphaColor(isEdge ? edge : core, alpha),
      );
    }),
    strip: glitch && toHexAlphaColor(glitch, LAVA_TEAR_STRIP_ALPHA),
  };
}

// Resolves configured colours (hex values or token references) against `element`. A colour
// the canvas cannot read falls back to black rather than breaking the frame.
export function readLavaPalette(
  element: Element,
  lamp: LavaLampConfig,
  glitchColor: string | null,
): LavaPalette {
  const readRgb = (value: string) =>
    parseHexColor(resolveCssValue(element, value)) ?? BLACK;
  return createLavaPalette({
    base: readRgb(lamp.base),
    blobs: [lamp.blob1, lamp.blob2, lamp.blob3].map(readRgb),
    glitch: glitchColor === null ? null : readRgb(glitchColor),
  });
}
