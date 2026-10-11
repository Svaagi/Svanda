import { useFrame } from '@react-three/fiber';
import { useStageStore } from 'features/stage';
import { useMemo } from 'react';

import { createScreenPainter, type ScreenSurfaces } from './screenPainter';

type ScreenDrawingInput = ScreenSurfaces & {
  isReducedMotion: boolean;
};

// Paints the screen textures on every scene frame. With reduced motion the screen clock
// stands still: the S keeps one set of colours and the VU meter one level.
export function useScreenDrawing({
  display,
  chin,
  palette,
  isReducedMotion,
}: ScreenDrawingInput) {
  const paint = useMemo(
    () => createScreenPainter({ display, chin, palette }),
    [display, chin, palette],
  );

  useFrame(({ clock }) =>
    paint(useStageStore.getState().vp, isReducedMotion ? 0 : clock.elapsedTime),
  );
}
