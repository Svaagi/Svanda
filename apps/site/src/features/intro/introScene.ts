import { INTRO_MAX_DPR } from 'constants/intro';
import type { NavLogoSlot } from 'features/stage';

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

  const resize = () => {
    const width = Math.floor(canvas.clientWidth);
    const height = Math.floor(canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, INTRO_MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout = createIntroLayout(width, height);
    const rect = canvas.getBoundingClientRect();
    origin = { x: rect.left, y: rect.top };
  };

  resize();
  window.addEventListener('resize', resize);

  return {
    draw: (t, navLogoSlot) => {
      const target = navLogoSlot && {
        x: navLogoSlot.x - origin.x,
        y: navLogoSlot.y - origin.y,
        cellPx: navLogoSlot.cellPx,
      };
      drawIntroFrame(context, { layout, palette, target }, t);
    },
    dispose: () => window.removeEventListener('resize', resize),
  };
}
