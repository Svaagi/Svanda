import type { GlassUiConfig, PixelUiConfig } from '@svanda/shared';
import {
  DISPLAY_SPLIT_MAX_PERCENT,
  DISPLAY_SPLIT_MIN_PERCENT,
} from 'constants/jukeboxUi';
import { type RefObject, useMemo } from 'react';

import { useDesignLamp, useLavaLamps } from '../lavaLamp';

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
  const pixelLamp = useDesignLamp(
    { design: 'pixel', config: pixelConfig },
    splitPercent <= DISPLAY_SPLIT_MIN_PERCENT,
  );
  const glassLamp = useDesignLamp(
    { design: 'glass', config: glassConfig },
    splitPercent >= DISPLAY_SPLIT_MAX_PERCENT,
  );
  const lamps = useMemo(() => [pixelLamp, glassLamp], [pixelLamp, glassLamp]);
  useLavaLamps(rootRef, lamps, isPaused);

  return { pixelLamp, glassLamp };
}
