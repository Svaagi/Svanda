import { CANVAS_MAX_DPR } from 'constants/canvas';
import { MS_PER_S } from 'constants/time';
import {
  VENUE_BAND_COLOR_VARS,
  VENUE_BAND_FRAME_MS,
  VENUE_BAND_FRAME_TOLERANCE_MS,
  VENUE_BAND_REDUCED_MOTION_TIME_S,
  VENUE_LABEL_VARS,
} from 'constants/venues';
import { stagePointerToPx, useStageStore } from 'features/stage';
import type { Point } from 'lib/geometry';
import { readCssVar, resolveCssValue } from 'utils';

import { drawVenueBand, type VenueBandPalette } from './venueBandDraw';
import { layoutVenueBand, type VenueBandLayout } from './venueBandLayout';

// Band canvases mark themselves with this attribute and carry the shown name and the venue
// colour (a CSS value) as data attributes. Only the active slide's band is drawn: the others
// are out of the frame, or sliding out of it with their last frame.
const ACTIVE_BAND_SELECTOR = "[data-active='true'] > canvas[data-venue-band]";

type BandCanvas = {
  context: CanvasRenderingContext2D;
  layout: VenueBandLayout | null;
  // Size, cell and text the layout was made for.
  layoutKey: string;
  labelKey: string;
  color: string;
  // What was last drawn, under reduced motion (nothing animates, so equal frames are skipped).
  drawnKey: string;
};

type VenueBandSceneOptions = {
  frame: HTMLElement;
  cell: number;
  isReducedMotion: boolean;
};

type VenueBandScene = {
  draw: (nowMs: number) => void;
  // The frame's size, from a ResizeObserver: every band canvas fills the frame.
  resize: (width: number, height: number) => void;
};

// The band tokens and venue colours are global, so they are read from the root: reading
// them from inside the frame (a size container) would force a layout first.
function readVenueBandPalette(root: Element): VenueBandPalette {
  const read = (name: string) => readCssVar(root, name);
  return {
    text: read(VENUE_BAND_COLOR_VARS.text),
    textMuted: read(VENUE_BAND_COLOR_VARS.textMuted),
    sparkLight: read(VENUE_BAND_COLOR_VARS.sparkLight),
    sparkDark: read(VENUE_BAND_COLOR_VARS.sparkDark),
    torch: read(VENUE_BAND_COLOR_VARS.torch),
    torchOnText: read(VENUE_BAND_COLOR_VARS.torchOnText),
  };
}

// Backing store sized for the (capped) device pixel ratio, so drawing works in CSS px.
function sizeCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, CANVAS_MAX_DPR);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// The note and place label follows the name. Its slide's custom properties are written
// only when its place changes (a scramble step relays the name but rarely moves the label).
function placeLabel(
  canvas: HTMLCanvasElement,
  band: BandCanvas,
  { label }: VenueBandLayout,
) {
  const slide = canvas.parentElement;
  const labelKey = [label.x, label.y, label.isVisible].join();
  if (!slide || labelKey === band.labelKey) return;
  band.labelKey = labelKey;
  slide.style.setProperty(VENUE_LABEL_VARS.x, `${label.x}px`);
  slide.style.setProperty(VENUE_LABEL_VARS.y, `${label.y}px`);
  slide.style.setProperty(
    VENUE_LABEL_VARS.opacity,
    label.isVisible ? '1' : '0',
  );
}

// Draws the active venue band at 30 fps: the band in the venue colour with its twinkle, the
// (scrambling) name and the pointer torch. Layout work happens only when the frame resizes or
// the text changes; per frame the only layout read is the frame's box. The stage viewport is
// stuck to the top left of the window while a stage page shows, so client px are stage px.
export function createVenueBandScene({
  frame,
  cell,
  isReducedMotion,
}: VenueBandSceneOptions): VenueBandScene {
  const root = frame.ownerDocument.documentElement;
  const palette = readVenueBandPalette(root);
  const canvases = new WeakMap<HTMLCanvasElement, BandCanvas>();
  let lastDrawMs = Number.NEGATIVE_INFINITY;
  let frameWidth = frame.clientWidth;
  let frameHeight = frame.clientHeight;

  const prepare = (canvas: HTMLCanvasElement): BandCanvas | null => {
    const known = canvases.get(canvas);
    if (known) return known;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const band = {
      context,
      layout: null,
      layoutKey: '',
      labelKey: '',
      color: resolveCssValue(root, canvas.dataset.color ?? ''),
      drawnKey: '',
    };
    canvases.set(canvas, band);
    return band;
  };

  const drawCanvas = (
    canvas: HTMLCanvasElement,
    origin: Point,
    torch: Point | null,
    t: number,
  ) => {
    const band = prepare(canvas);
    if (!band) return;
    const width = frameWidth;
    const height = frameHeight;
    const text = canvas.dataset.text ?? '';
    const layoutKey = [width, height, cell, text].join();
    if (!band.layout || band.layoutKey !== layoutKey) {
      if (band.layout?.width !== width || band.layout.height !== height) {
        sizeCanvas(canvas, band.context, width, height);
      }
      band.layout = layoutVenueBand({ width, height }, cell, text);
      band.layoutKey = layoutKey;
      band.drawnKey = '';
      placeLabel(canvas, band, band.layout);
    }
    if (isReducedMotion) {
      const key = [origin.x, origin.y, torch?.x, torch?.y, text].join();
      if (key === band.drawnKey) return;
      band.drawnKey = key;
    }
    drawVenueBand(band.context, {
      layout: band.layout,
      palette,
      color: band.color,
      origin,
      torch,
      t,
    });
  };

  return {
    draw: (nowMs) => {
      if (
        nowMs - lastDrawMs <
        VENUE_BAND_FRAME_MS - VENUE_BAND_FRAME_TOLERANCE_MS
      ) {
        return;
      }
      const canvas =
        frame.querySelector<HTMLCanvasElement>(ACTIVE_BAND_SELECTOR);
      if (!canvas || !frameWidth || !frameHeight) return;
      lastDrawMs = nowMs;
      const frameBox = frame.getBoundingClientRect();
      const { pointer, viewport } = useStageStore.getState();
      const torch = pointer.isActive
        ? stagePointerToPx(pointer, viewport.width, viewport.height)
        : null;
      const t = isReducedMotion
        ? VENUE_BAND_REDUCED_MOTION_TIME_S
        : nowMs / MS_PER_S;
      drawCanvas(canvas, { x: frameBox.left, y: frameBox.top }, torch, t);
    },
    resize: (width, height) => {
      frameWidth = Math.round(width);
      frameHeight = Math.round(height);
    },
  };
}
