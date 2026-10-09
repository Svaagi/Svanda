import type { GlassUiConfig, PixelUiConfig } from '@svanda/shared';
import {
  DISPLAY_SPLIT_MAX_PERCENT,
  DISPLAY_SPLIT_MIN_PERCENT,
} from 'constants/jukeboxUi';
import { type RefObject, useMemo, useRef } from 'react';

import {
  glassLavaSettings,
  type LavaLampSlot,
  pixelLavaSettings,
  useLavaLamps,
} from '../lavaLamp';

type DisplayLampsOptions = {
  rootRef: RefObject<HTMLElement | null>;
  pixelConfig: PixelUiConfig;
  glassConfig: GlassUiConfig;
  splitPercent: number;
  isPaused: boolean;
};

// Both lava lamps of the compare on one loop. The pixel lamp shows left of the split, the
// glass one right of it; a lamp the split has clipped away entirely is not drawn.
export function useDisplayLamps({
  rootRef,
  pixelConfig,
  glassConfig,
  splitPercent,
  isPaused,
}: DisplayLampsOptions) {
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const glassCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPixelHidden = splitPercent <= DISPLAY_SPLIT_MIN_PERCENT;
  const isGlassHidden = splitPercent >= DISPLAY_SPLIT_MAX_PERCENT;
  const pixelLava = useMemo(
    () => pixelLavaSettings(pixelConfig),
    [pixelConfig],
  );
  const glassLava = useMemo(
    () => glassLavaSettings(glassConfig),
    [glassConfig],
  );
  const lamps = useMemo<LavaLampSlot[]>(
    () => [
      {
        canvasRef: pixelCanvasRef,
        settings: pixelLava,
        isHidden: isPixelHidden,
      },
      {
        canvasRef: glassCanvasRef,
        settings: glassLava,
        isHidden: isGlassHidden,
      },
    ],
    [pixelLava, glassLava, isPixelHidden, isGlassHidden],
  );
  useLavaLamps(rootRef, lamps, isPaused);

  return { pixelCanvasRef, glassCanvasRef, pixelLava, glassLava };
}
