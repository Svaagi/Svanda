// @vitest-environment node
import { readFileSync } from 'node:fs';

import {
  CAMERA_FIT_WIDTH_LANDSCAPE,
  CAMERA_FIT_WIDTH_PORTRAIT,
  CAMERA_MIN_DISTANCE,
  JUKEBOX_POSTER_HEIGHT_PX,
  JUKEBOX_POSTER_WIDTH_PX,
} from 'constants/jukebox3d';
import { describe, expect, it } from 'vitest';

import { cameraDistance, worldUnitsPerPx } from './sceneLayout';

const css = readFileSync(
  new URL('./jukebox3d.module.css', import.meta.url),
  'utf8',
);

const readCssNumbers = (name: string) =>
  Array.from(
    css.matchAll(new RegExp(String.raw`${name}:\s*([\d.]+);`, 'g')),
    (match) => Number(match[1]),
  );

const POSTER_SIZE = {
  width: JUKEBOX_POSTER_WIDTH_PX,
  height: JUKEBOX_POSTER_HEIGHT_PX,
};

describe('poster layout', () => {
  it('is rendered from a stage where the camera rests at its minimum distance', () => {
    expect(cameraDistance(POSTER_SIZE)).toBe(CAMERA_MIN_DISTANCE);
  });

  it('spans the visible height of the camera in the CSS', () => {
    const visibleHeight =
      worldUnitsPerPx(POSTER_SIZE) * JUKEBOX_POSTER_HEIGHT_PX;

    expect(readCssNumbers('--poster-visible-height')).toEqual([
      Number(visibleHeight.toFixed(1)),
    ]);
  });

  it('uses the landscape then portrait visible widths of the camera fit', () => {
    expect(readCssNumbers('--poster-visible-width')).toEqual([
      CAMERA_FIT_WIDTH_LANDSCAPE * 2,
      CAMERA_FIT_WIDTH_PORTRAIT * 2,
    ]);
  });
});
