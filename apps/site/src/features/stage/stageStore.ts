import { create } from 'zustand';

import type {
  FloorShadow,
  IntroPhase,
  ModelAnchors,
  NavLogoSlot,
  ScreenQuad,
  StageGrid,
  StagePointer,
  StageViewport,
} from './stageTypes';

type StageValues = {
  // Continuous page position 0..4 that layers and the 3D scene animate from.
  vp: number;
  // Discrete page from the scroll position, 0..5 where 5 is the contact section.
  page: number;
  introPhase: IntroPhase;
  // Paging input is blocked until the intro hands over.
  isReady: boolean;
  pointer: StagePointer;
  grid: StageGrid;
  screenQuad: ScreenQuad | null;
  // Published by the 3D scene; null while no model stands on the stage.
  floorShadow: FloorShadow | null;
  viewport: StageViewport;
  modelAnchors: ModelAnchors;
  navLogoSlot: NavLogoSlot | null;
};

type StageActions = {
  setVp: (vp: number) => void;
  setPage: (page: number) => void;
  setIntroPhase: (introPhase: IntroPhase) => void;
  setIsReady: (isReady: boolean) => void;
  setPointer: (pointer: StagePointer) => void;
  setGrid: (grid: StageGrid) => void;
  setScreenQuad: (screenQuad: ScreenQuad | null) => void;
  setFloorShadow: (floorShadow: FloorShadow | null) => void;
  setViewport: (viewport: StageViewport) => void;
  setModelAnchors: (anchors: Partial<ModelAnchors>) => void;
  setNavLogoSlot: (navLogoSlot: NavLogoSlot | null) => void;
};

export type StageState = StageValues & StageActions;

// Ready by default: with no intro running, paging must work from the first frame. The intro
// resets this to false while it plays.
export function createInitialStageValues(): StageValues {
  return {
    vp: 0,
    page: 0,
    introPhase: 'done',
    isReady: true,
    pointer: { x: 0, y: 0, isActive: false },
    grid: { cell: 0, originX: 0, originY: 0 },
    screenQuad: null,
    floorShadow: null,
    viewport: { width: 0, height: 0, isMobile: false, isPortrait: false },
    modelAnchors: { heroTextTop: null, karaoke: null, jukebox: null },
    navLogoSlot: null,
  };
}

export const useStageStore = create<StageState>()((set) => ({
  ...createInitialStageValues(),
  setVp: (vp) => set({ vp }),
  setPage: (page) => set({ page }),
  setIntroPhase: (introPhase) => set({ introPhase }),
  setIsReady: (isReady) => set({ isReady }),
  setPointer: (pointer) => set({ pointer }),
  setGrid: (grid) => set({ grid }),
  setScreenQuad: (screenQuad) => set({ screenQuad }),
  setFloorShadow: (floorShadow) => set({ floorShadow }),
  setViewport: (viewport) => set({ viewport }),
  setModelAnchors: (anchors) =>
    set(({ modelAnchors }) => ({
      modelAnchors: { ...modelAnchors, ...anchors },
    })),
  setNavLogoSlot: (navLogoSlot) => set({ navLogoSlot }),
}));
