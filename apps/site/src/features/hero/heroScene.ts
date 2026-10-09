import { HERO_NAV_HEIGHT_VAR } from 'constants/hero';
import { useStageStore } from 'features/stage';
import { bindCanvasSize } from 'lib/canvas';
import { readCssVar } from 'utils';

import { drawHeroFrame, type HeroFrameInput } from './heroFrame';
import { createHeroLayout } from './heroLayout';
import type { HeroPalette } from './heroPalette';

export type HeroScene = {
  draw: (input: HeroFrameInput, t: number) => void;
  dispose: () => void;
};

const readNavHeightPx = () =>
  Number.parseFloat(
    readCssVar(document.documentElement, HERO_NAV_HEIGHT_VAR),
  ) || 0;

// Owns the canvas: sizes it for the device pixel ratio, lays the grid out again on resize
// (and publishes it for features that snap onto it), and draws frames on demand. Null when
// the browser has no 2D canvas.
export function createHeroScene(
  canvas: HTMLCanvasElement,
  palette: HeroPalette,
  onResize: () => void,
): HeroScene | null {
  const context = canvas.getContext('2d');
  if (!context) return null;
  let layout = createHeroLayout(0, 0);

  const unbindSize = bindCanvasSize(canvas, context, (width, height) => {
    layout = createHeroLayout(width, height, readNavHeightPx());
    useStageStore
      .getState()
      .setGrid({ cell: layout.cellPx, originX: 0, originY: 0 });
    onResize();
  });

  return {
    draw: (input, t) => drawHeroFrame({ context, layout, palette }, input, t),
    dispose: unbindSize,
  };
}
