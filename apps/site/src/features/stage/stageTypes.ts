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

export type ScreenPoint = {
  x: number;
  y: number;
};

// The jukebox base footprint on the floor, plus its copy pushed away from the light, in
// stage px. The hero background fills the cells inside its convex hull as a pixel shadow.
export type FloorShadow = {
  points: readonly ScreenPoint[];
  // 0..1, follows the model rising into place.
  alpha: number;
};

// The jukebox display corners in client px, clockwise from the top left.
export type ScreenQuad = {
  topLeft: ScreenPoint;
  topRight: ScreenPoint;
  bottomRight: ScreenPoint;
  bottomLeft: ScreenPoint;
};

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
