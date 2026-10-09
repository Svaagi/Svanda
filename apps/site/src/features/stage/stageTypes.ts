import type { Point, Quad } from 'lib/geometry';

// The intro timeline drives this; without an intro the stage starts in its final state.
export type IntroPhase = 'pixels' | 'swarm' | 'reveal' | 'done';

// Pointer position over the stage, normalised to -1..1 on both axes (y up).
export type StagePointer = {
  x: number;
  y: number;
  isActive: boolean;
};

// The background cell grid in stage px: features snap onto it (venues frame, band).
export type StageGrid = {
  cell: number;
  originX: number;
  originY: number;
};

export type ScreenPoint = Point;

// The jukebox base footprint on the floor, plus its copy pushed away from the light, in
// stage px. The hero background fills the cells inside its convex hull as a pixel shadow.
export type FloorShadow = {
  points: readonly ScreenPoint[];
  // 0..1, follows the model rising into place.
  alpha: number;
};

// A free vertical band in stage px (top < bottom) the 3D model centres in on portrait pages.
export type ModelSlot = {
  top: number;
  bottom: number;
};

// Page copy measured by the page layers, so the 3D model can fit around it in portrait:
// the hero text top and the gap between each product page's heading and body, in stage px.
export type ModelAnchors = {
  heroTextTop: number | null;
  karaoke: ModelSlot | null;
  jukebox: ModelSlot | null;
};

// The jukebox display corners in stage px (the stage viewport is the origin), clockwise from
// the top left. Published by the 3D scene, null while no model stands on the stage.
export type ScreenQuad = Quad;

export type StageViewport = {
  width: number;
  height: number;
  isMobile: boolean;
  isPortrait: boolean;
};

// Where the header logo rests (top left in client px, header fully slid in) and its cell size:
// the intro swarm lands exactly there.
export type NavLogoSlot = {
  x: number;
  y: number;
  cellPx: number;
};
