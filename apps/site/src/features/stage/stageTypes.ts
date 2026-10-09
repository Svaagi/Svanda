// The intro timeline drives this; until it runs the stage starts in its final state.
export type IntroPhase = 'pixels' | 'swarm' | 'reveal' | 'done';

// Pointer position over the stage, normalised to -1..1 on both axes (y up).
export type StagePointer = {
  x: number;
  y: number;
  isActive: boolean;
};

export type StageGrid = {
  cell: number;
  originX: number;
  originY: number;
};

export type ScreenPoint = {
  x: number;
  y: number;
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
