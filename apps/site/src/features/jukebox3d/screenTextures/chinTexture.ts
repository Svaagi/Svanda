import {
  CHIN_TEXTURE_HEIGHT_PX,
  CHIN_TEXTURE_WIDTH_PX,
  VU_BAR_COUNT,
  VU_BAR_HEIGHT_PX,
  VU_BAR_LEFT_PX,
  VU_BAR_PITCH_PX,
  VU_BAR_TOP_PX,
  VU_BAR_WIDTH_PX,
  VU_LEVEL_BASE,
  VU_LEVEL_WAVES,
} from 'constants/jukebox3d';
import { clamp } from 'lib/math';

import type { ScreenPalette } from './screenPalette';

// How many bars the VU meter lights at this time; fractional bars light partly.
export function vuLevel(timeS: number): number {
  return VU_LEVEL_WAVES.reduce(
    (level, { amplitude, rate }) => level + amplitude * Math.sin(timeS * rate),
    VU_LEVEL_BASE,
  );
}

export function vuBarLight(level: number, barIndex: number): number {
  return clamp(level - barIndex, 0, 1);
}

// The chin panel: a row of dark bars, the lit ones painted over in the palette colours.
export function drawChin(
  context: CanvasRenderingContext2D,
  level: number,
  palette: ScreenPalette,
) {
  context.globalAlpha = 1;
  context.fillStyle = palette.background;
  context.fillRect(0, 0, CHIN_TEXTURE_WIDTH_PX, CHIN_TEXTURE_HEIGHT_PX);
  for (let i = 0; i < VU_BAR_COUNT; i++) {
    const left = VU_BAR_LEFT_PX + i * VU_BAR_PITCH_PX;
    context.fillStyle = palette.vuOff;
    context.fillRect(left, VU_BAR_TOP_PX, VU_BAR_WIDTH_PX, VU_BAR_HEIGHT_PX);
    const light = vuBarLight(level, i);
    if (light <= 0) continue;
    context.globalAlpha = light;
    context.fillStyle = palette.vu[i % palette.vu.length] ?? palette.vuOff;
    context.fillRect(left, VU_BAR_TOP_PX, VU_BAR_WIDTH_PX, VU_BAR_HEIGHT_PX);
    context.globalAlpha = 1;
  }
}
