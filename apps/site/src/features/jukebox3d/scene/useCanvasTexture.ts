import { useEffect, useState } from 'react';
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

export type CanvasSurface = {
  // Null where the browser offers no 2D context; the texture then stays blank.
  context: CanvasRenderingContext2D | null;
  texture: CanvasTexture;
};

// The canvas is drawn at its final size and only ever shown stretched onto a plane, so
// mipmaps would be wasted uploads.
function createCanvasSurface(widthPx: number, heightPx: number): CanvasSurface {
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return { context: canvas.getContext('2d'), texture };
}

// An offscreen canvas and the texture showing it. Only ever used inside the client-only
// scene, so creating the canvas on first render is safe.
export function useCanvasTexture(
  widthPx: number,
  heightPx: number,
): CanvasSurface {
  const [surface] = useState(() => createCanvasSurface(widthPx, heightPx));

  useEffect(() => () => surface.texture.dispose(), [surface]);

  return surface;
}
