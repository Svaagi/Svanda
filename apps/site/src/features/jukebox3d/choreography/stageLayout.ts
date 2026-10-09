import {
  CUSTOM_FIT_LANDSCAPE,
  CUSTOM_FIT_PORTRAIT,
  CUSTOM_MAX_SCALE,
  HERO_TEXT_MIN_TOP_PX,
  MODEL_BELOW_NAV_OFFSET_PX,
  MODEL_BOUNDS,
  MODEL_DEPTH_PAD,
  MODEL_DISPLAY_RECT,
  NAV_HEIGHT_PX,
  PAGE_SCALE_LANDSCAPE,
  PAGE_SCALE_PORTRAIT,
  PRODUCT_DISPLAY_HEIGHT_RATIO,
  PRODUCT_DISPLAY_WIDTH_RATIO,
  PRODUCT_SCALE_BOOST,
  PRODUCT_SLOT_MIN_HEIGHT_PX,
  PRODUCT_X_VIEW_RATIO,
  PRODUCT_Y_PORTRAIT,
  VENUES_Y_LANDSCAPE,
  VENUES_Y_PORTRAIT,
} from 'constants/jukebox3d';
import {
  CUSTOM_PAGE,
  HERO_PAGE,
  JUKEBOX_PAGE,
  KARAOKE_PAGE,
  STAGE_PAGE_COUNT,
  VENUES_PAGE,
} from 'constants/stage';
import type { ModelAnchors, ModelSlot } from 'features/stage';

import {
  isPortraitSize,
  type SceneSize,
  worldUnitsPerPx,
} from '../sceneLayout';

// Model position (world units at the origin plane) and scale on each stage page.
export type StageLayout = {
  x: readonly number[];
  y: readonly number[];
  scale: readonly number[];
};

type ViewFrame = {
  isPortrait: boolean;
  // World units per stage px, and the visible height and width in world units.
  unitsPerPx: number;
  visibleHeight: number;
  visibleWidth: number;
};

const HALF = 0.5;
const MODEL_HEIGHT = MODEL_BOUNDS.maxY - MODEL_BOUNDS.minY;
const MODEL_CENTRE_Y = (MODEL_BOUNDS.maxY + MODEL_BOUNDS.minY) * HALF;
const DISPLAY_HEIGHT = MODEL_DISPLAY_RECT.maxY - MODEL_DISPLAY_RECT.minY;
const DISPLAY_WIDTH = MODEL_DISPLAY_RECT.maxX - MODEL_DISPLAY_RECT.minX;
const DISPLAY_CENTRE_Y =
  (MODEL_DISPLAY_RECT.maxY + MODEL_DISPLAY_RECT.minY) * HALF;

function viewFrame(size: SceneSize): ViewFrame {
  const unitsPerPx = worldUnitsPerPx(size);
  return {
    isPortrait: isPortraitSize(size),
    unitsPerPx,
    visibleHeight: unitsPerPx * size.height,
    visibleWidth: unitsPerPx * size.width,
  };
}

// World y that puts the model centre on a stage px row.
function modelYAtRow(frame: ViewFrame, rowPx: number, scale: number) {
  return (
    frame.visibleHeight * HALF -
    rowPx * frame.unitsPerPx -
    MODEL_CENTRE_Y * scale * MODEL_DEPTH_PAD
  );
}

// Custom: the whole model fits with room above the display for the configurator switches.
function fitCustom(frame: ViewFrame) {
  const { unitsPerPx: k, visibleHeight } = frame;
  const margins = frame.isPortrait ? CUSTOM_FIT_PORTRAIT : CUSTOM_FIT_LANDSCAPE;
  const { minY: bottom, maxY: top } = MODEL_BOUNDS;
  const displayTop = MODEL_DISPLAY_RECT.maxY;
  const scale = Math.min(
    CUSTOM_MAX_SCALE,
    (visibleHeight - margins.model * k) / (MODEL_HEIGHT * MODEL_DEPTH_PAD),
    (visibleHeight - margins.display * k) /
      ((displayTop - bottom) * MODEL_DEPTH_PAD),
  );
  const half = visibleHeight * HALF;
  const lowest = -half + margins.bottom * k - bottom * scale * MODEL_DEPTH_PAD;
  const highest = Math.min(
    half - margins.top * k - top * scale * MODEL_DEPTH_PAD,
    half - margins.displayTop * k - displayTop * scale * MODEL_DEPTH_PAD,
  );
  return { scale, y: (lowest + highest) * HALF };
}

// Landscape karaoke and jukebox: the display fills its half of the page, the cabinet runs
// off the bottom.
function fitProductLandscape(frame: ViewFrame) {
  const { unitsPerPx: k, visibleHeight, visibleWidth } = frame;
  const displayScale = Math.min(
    ((visibleHeight - NAV_HEIGHT_PX * k) * PRODUCT_DISPLAY_HEIGHT_RATIO) /
      (DISPLAY_HEIGHT * MODEL_DEPTH_PAD),
    (visibleWidth * PRODUCT_DISPLAY_WIDTH_RATIO) /
      (DISPLAY_WIDTH * MODEL_DEPTH_PAD),
  );
  const scale = displayScale * PRODUCT_SCALE_BOOST;
  return {
    scale,
    x: visibleWidth * PRODUCT_X_VIEW_RATIO,
    y:
      -MODEL_BELOW_NAV_OFFSET_PX * k -
      DISPLAY_CENTRE_Y * scale * MODEL_DEPTH_PAD,
  };
}

// Hero: centred in the area below the header; in portrait between the header and the hero
// text once it is measured.
function heroY(frame: ViewFrame, scale: number, heroTextTop: number | null) {
  if (
    frame.isPortrait &&
    heroTextTop !== null &&
    heroTextTop > HERO_TEXT_MIN_TOP_PX
  ) {
    return modelYAtRow(frame, (NAV_HEIGHT_PX + heroTextTop) * HALF, scale);
  }
  return -MODEL_CENTRE_Y * scale - MODEL_BELOW_NAV_OFFSET_PX * frame.unitsPerPx;
}

// Portrait karaoke and jukebox: centred between the page heading and its body copy.
function productSlotY(frame: ViewFrame, scale: number, slot: ModelSlot | null) {
  if (!slot || slot.bottom - slot.top <= PRODUCT_SLOT_MIN_HEIGHT_PX) {
    return PRODUCT_Y_PORTRAIT;
  }
  return modelYAtRow(frame, (slot.top + slot.bottom) * HALF, scale);
}

function landscapeLayout(frame: ViewFrame): StageLayout {
  const custom = fitCustom(frame);
  const product = fitProductLandscape(frame);
  const scale = [...PAGE_SCALE_LANDSCAPE];
  scale[KARAOKE_PAGE] = product.scale;
  scale[JUKEBOX_PAGE] = product.scale;
  scale[CUSTOM_PAGE] = custom.scale;
  const x = new Array<number>(STAGE_PAGE_COUNT).fill(0);
  x[KARAOKE_PAGE] = product.x;
  x[JUKEBOX_PAGE] = -product.x;
  const y = new Array<number>(STAGE_PAGE_COUNT).fill(0);
  y[KARAOKE_PAGE] = product.y;
  y[JUKEBOX_PAGE] = product.y;
  y[CUSTOM_PAGE] = custom.y;
  y[VENUES_PAGE] = VENUES_Y_LANDSCAPE;
  return { x, y, scale };
}

function portraitLayout(frame: ViewFrame, anchors: ModelAnchors): StageLayout {
  const custom = fitCustom(frame);
  const scale = [...PAGE_SCALE_PORTRAIT];
  scale[CUSTOM_PAGE] = custom.scale;
  const y = new Array<number>(STAGE_PAGE_COUNT).fill(0);
  y[KARAOKE_PAGE] = productSlotY(
    frame,
    scale[KARAOKE_PAGE] ?? 1,
    anchors.karaoke,
  );
  y[JUKEBOX_PAGE] = productSlotY(
    frame,
    scale[JUKEBOX_PAGE] ?? 1,
    anchors.jukebox,
  );
  y[CUSTOM_PAGE] = custom.y;
  y[VENUES_PAGE] = VENUES_Y_PORTRAIT;
  return { x: new Array<number>(STAGE_PAGE_COUNT).fill(0), y, scale };
}

// Where the model stands on each page for a stage size, fitted around the measured copy.
export function createStageLayout(
  size: SceneSize,
  anchors: ModelAnchors,
): StageLayout {
  const frame = viewFrame(size);
  const layout = frame.isPortrait
    ? portraitLayout(frame, anchors)
    : landscapeLayout(frame);
  const y = [...layout.y];
  y[HERO_PAGE] = heroY(
    frame,
    layout.scale[HERO_PAGE] ?? 1,
    anchors.heroTextTop,
  );
  return { ...layout, y };
}
