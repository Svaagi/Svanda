import {
  INTRO_LOGO_LAND_S,
  INTRO_PIXELS_END_S,
  INTRO_REMNANT_S,
} from 'constants/intro';

import type { IntroLayout } from './introLayout';
import { type IntroPalette, letterColor } from './introPalette';
import { drawIntroPixels, fillCell } from './introPixels';
import { coverAlphaAt } from './introTimeline';
import { swarmSprites, type SwarmTarget } from './swarmPath';

export type IntroFrame = {
  layout: IntroLayout;
  palette: IntroPalette;
  // Unknown until the header has measured its logo; the swarm waits for it.
  target: SwarmTarget | null;
};

function drawSwarm(
  context: CanvasRenderingContext2D,
  { layout, palette }: IntroFrame,
  target: SwarmTarget,
  t: number,
) {
  for (const cell of layout.logoCells) {
    const color = letterColor(palette, cell.logo?.letterIndex ?? 0);
    for (const sprite of swarmSprites(cell, layout.cellPx, target, t)) {
      fillCell(
        context,
        sprite.x,
        sprite.y,
        sprite.size,
        color,
        sprite.alpha,
        sprite.insetPx,
      );
    }
  }
}

export function drawIntroFrame(
  context: CanvasRenderingContext2D,
  frame: IntroFrame,
  t: number,
) {
  const { layout, palette, target } = frame;
  context.clearRect(0, 0, layout.width, layout.height);
  const coverAlpha = coverAlphaAt(t);
  if (coverAlpha > 0) {
    context.globalAlpha = coverAlpha;
    context.fillStyle = palette.background;
    context.fillRect(0, 0, layout.width, layout.height);
    context.globalAlpha = 1;
  }

  if (t < INTRO_PIXELS_END_S) {
    drawIntroPixels(context, layout, palette, t, false);
    return;
  }
  if (t < INTRO_PIXELS_END_S + INTRO_REMNANT_S) {
    drawIntroPixels(context, layout, palette, INTRO_PIXELS_END_S, true);
  }
  if (t < INTRO_LOGO_LAND_S && target) drawSwarm(context, frame, target, t);
}
