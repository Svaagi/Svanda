import {
  createDisplayFrame,
  drawChin,
  drawDisplay,
  type ScreenPalette,
  updateDisplayFrame,
  vuLevel,
} from '../screenTextures';
import type { CanvasSurface } from './useCanvasTexture';

export type ScreenSurfaces = {
  display: CanvasSurface;
  chin: CanvasSurface;
  palette: ScreenPalette;
};

// Redraws a screen texture only when its content changed, so the GPU upload is skipped on
// frames where nothing on it moved.
export function createScreenPainter({
  display,
  chin,
  palette,
}: ScreenSurfaces): (vp: number, timeS: number) => void {
  const frame = createDisplayFrame();
  let lastLevel: number | null = null;

  return (vp, timeS) => {
    if (
      display.context &&
      updateDisplayFrame(frame, vp, timeS, palette.logo.length)
    ) {
      drawDisplay(display.context, frame, palette);
      display.texture.needsUpdate = true;
    }
    const level = vuLevel(timeS);
    if (chin.context && level !== lastLevel) {
      drawChin(chin.context, level, palette);
      chin.texture.needsUpdate = true;
      lastLevel = level;
    }
  };
}
