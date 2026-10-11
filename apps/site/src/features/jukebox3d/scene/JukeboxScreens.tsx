import {
  CHIN_TEXTURE_HEIGHT_PX,
  CHIN_TEXTURE_WIDTH_PX,
  MODEL_CHIN_RECT,
  MODEL_DISPLAY_RECT,
  SCREEN_TEXTURE_HEIGHT_PX,
  SCREEN_TEXTURE_WIDTH_PX,
} from 'constants/jukebox3d';
import { useReducedMotion } from 'hooks';
import { useState } from 'react';

import { readScreenPalette } from '../screenTextures';
import { ScreenPlane } from './ScreenPlane';
import { useCanvasTexture } from './useCanvasTexture';
import { useScreenDrawing } from './useScreenDrawing';

// The display and the chin panel on the cabinet, drawn into canvas textures each frame the
// scene renders.
export function JukeboxScreens() {
  const display = useCanvasTexture(
    SCREEN_TEXTURE_WIDTH_PX,
    SCREEN_TEXTURE_HEIGHT_PX,
  );
  const chin = useCanvasTexture(CHIN_TEXTURE_WIDTH_PX, CHIN_TEXTURE_HEIGHT_PX);
  const [palette] = useState(() => readScreenPalette(document.documentElement));
  const isReducedMotion = useReducedMotion();
  useScreenDrawing({ display, chin, palette, isReducedMotion });

  return (
    <>
      <ScreenPlane rect={MODEL_DISPLAY_RECT} texture={display.texture} />
      <ScreenPlane rect={MODEL_CHIN_RECT} texture={chin.texture} />
    </>
  );
}
