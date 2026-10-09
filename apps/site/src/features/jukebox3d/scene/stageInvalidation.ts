import { type StageState, useStageStore } from 'features/stage';

import { heroPresence } from '../choreography';

// The stage values the scene draws from.
const SCENE_INPUTS = ['vp', 'viewport', 'introPhase', 'modelAnchors'] as const;

const hasSceneInputChanged = (state: StageState, previous: StageState) =>
  SCENE_INPUTS.some((key) => state[key] !== previous[key]);

// The cursor tilts and lights the model on the hero only; elsewhere pointer moves redraw
// nothing.
const hasPointerMovedOnHero = (state: StageState, previous: StageState) =>
  state.pointer !== previous.pointer && heroPresence(state.vp) > 0;

// With `frameloop="demand"` the scene renders only when invalidated: this asks for a frame
// whenever a stage value it draws from changes.
export function subscribeStageInvalidation(invalidate: () => void): () => void {
  return useStageStore.subscribe((state, previous) => {
    if (
      hasSceneInputChanged(state, previous) ||
      hasPointerMovedOnHero(state, previous)
    ) {
      invalidate();
    }
  });
}
