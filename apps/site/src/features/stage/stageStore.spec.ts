import { beforeEach, describe, expect, it } from 'vitest';

import { createInitialStageValues, useStageStore } from './stageStore';

describe('stageStore', () => {
  beforeEach(() => {
    useStageStore.setState(createInitialStageValues());
  });

  it('starts on the first page, ready, with the intro finished', () => {
    const state = useStageStore.getState();

    expect(state.vp).toBe(0);
    expect(state.page).toBe(0);
    expect(state.isReady).toBe(true);
    expect(state.introPhase).toBe('done');
    expect(state.introReveal).toBeNull();
    expect(state.screenQuad).toBeNull();
    expect(state.floorShadow).toBeNull();
    expect(state.navLogoSlot).toBeNull();
    expect(state.modelAnchors).toEqual({
      heroTextTop: null,
      karaoke: null,
      jukebox: null,
    });
  });

  it('updates each field through its setter', () => {
    const { getState } = useStageStore;
    const quad = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 10, y: 0 },
      bottomRight: { x: 10, y: 20 },
      bottomLeft: { x: 0, y: 20 },
    };

    getState().setVp(1.5);
    getState().setPage(2);
    getState().setIntroPhase('swarm');
    getState().setIsReady(false);
    getState().setPointer({ x: 0.5, y: -0.5, isActive: true });
    getState().setGrid({ cell: 12, originX: 3, originY: 4 });
    getState().setScreenQuad(quad);
    getState().setFloorShadow({ points: [quad.topLeft], alpha: 0.5 });
    getState().setViewport({
      width: 800,
      height: 900,
      isMobile: true,
      isPortrait: true,
    });
    getState().setNavLogoSlot({ x: 97.5, y: 19.5, cellPx: 4 });

    expect(getState()).toMatchObject({
      vp: 1.5,
      page: 2,
      introPhase: 'swarm',
      isReady: false,
      pointer: { x: 0.5, y: -0.5, isActive: true },
      grid: { cell: 12, originX: 3, originY: 4 },
      screenQuad: quad,
      floorShadow: { points: [{ x: 0, y: 0 }], alpha: 0.5 },
      viewport: { width: 800, height: 900, isMobile: true, isPortrait: true },
      navLogoSlot: { x: 97.5, y: 19.5, cellPx: 4 },
    });
  });

  it('merges model anchors so each page layer publishes only its own', () => {
    const { getState } = useStageStore;

    getState().setModelAnchors({ heroTextTop: 700 });
    getState().setModelAnchors({ karaoke: { top: 200, bottom: 600 } });

    expect(getState().modelAnchors).toEqual({
      heroTextTop: 700,
      karaoke: { top: 200, bottom: 600 },
      jukebox: null,
    });
  });
});
