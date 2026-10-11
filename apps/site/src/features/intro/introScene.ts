import type { NavLogoSlot } from 'features/stage';
import { bindCanvasSize } from 'lib/canvas';

import { drawIntroFrame } from './introFrame';
import { createIntroLayout, type IntroLayout } from './introLayout';
import { readIntroPalette } from './introPalette';

export type IntroScene = {
  draw: (t: number, navLogoSlot: NavLogoSlot | null) => void;
  dispose: () => void;
};

// Owns the canvas: sizes it for the device pixel ratio, lays the grid out again on resize,
// and draws frames on demand. Null when the browser has no 2D canvas.
export function createIntroScene(canvas: HTMLCanvasElement): IntroScene | null {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const palette = readIntroPalette(document.documentElement);
  let layout: IntroLayout = createIntroLayout(0, 0);
  let origin = { x: 0, y: 0 };

  const unbindSize = bindCanvasSize(canvas, context, (width, height) => {
    layout = createIntroLayout(width, height);
    const rect = canvas.getBoundingClientRect();
    origin = { x: rect.left, y: rect.top };
  });

  return {
    draw: (t, navLogoSlot) => {
      const target = navLogoSlot && {
        x: navLogoSlot.x - origin.x,
        y: navLogoSlot.y - origin.y,
        cellPx: navLogoSlot.cellPx,
      };
      drawIntroFrame(context, { layout, palette, target }, t);
    },
    dispose: unbindSize,
  };
}
