import type { GlassUiConfig, PixelUiConfig } from '@svanda/shared';
import { useMemo, useRef } from 'react';

import { glassLavaSettings, pixelLavaSettings } from './lavaSettings';
import type { LavaLampSlot } from './useLavaLamps';

export type DesignUiConfig =
  | { design: 'pixel'; config: PixelUiConfig }
  | { design: 'glass'; config: GlassUiConfig };

// The lava lamp behind one app design: its canvas ref and settings as a memoized slot for
// `useLavaLamps`, which draws every lamp of a scene on one loop.
export function useDesignLamp(
  { design, config }: DesignUiConfig,
  isHidden = false,
): LavaLampSlot {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = useMemo(
    () =>
      design === 'pixel'
        ? pixelLavaSettings(config)
        : glassLavaSettings(config),
    [design, config],
  );

  return useMemo(
    () => ({ canvasRef, settings, isHidden }),
    [settings, isHidden],
  );
}
