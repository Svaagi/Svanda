import { type StageState, useStageStore } from 'features/stage';

// The stage values the scene draws from. Pointer moves alone do not redraw it.
const SCENE_INPUTS = ['vp', 'viewport', 'introPhase'] as const;

const hasSceneInputChanged = (state: StageState, previous: StageState) =>
  SCENE_INPUTS.some((key) => state[key] !== previous[key]);

// With `frameloop="demand"` the scene renders only when invalidated: this asks for a frame
// whenever a stage value it draws from changes.
export function subscribeStageInvalidation(invalidate: () => void): () => void {
  return useStageStore.subscribe((state, previous) => {
    if (hasSceneInputChanged(state, previous)) invalidate();
  });
}
