import type { JukeboxSection } from '@svanda/shared';
import {
  PROJECTED_PRODUCTS_VP_RANGE,
  type ProjectedVpRange,
} from 'constants/jukebox3d';
import { useStageStore } from 'features/stage';
import { type ReactNode, useRef } from 'react';

import {
  isProjectedInteractive,
  projectedMode,
  projectedVisibility,
} from './projectedDisplay';
import styles from './projectedScreen.module.css';
import { useProjectedPlacement } from './useProjectedPlacement';

export type ProjectedScreenState = {
  mode: JukeboxSection;
  // Hidden content should stop its own animation while this is set.
  isPaused: boolean;
};

export type ProjectedScreenProps = {
  // Where on the stage the screen shows; the product pages by default.
  vpRange?: ProjectedVpRange;
  children?: (state: ProjectedScreenState) => ReactNode;
  testId?: string;
};

// A 540x960 DOM screen laid exactly over the 3D jukebox display while `vp` is in its range.
// Hidden (and inert) when the display is away; it takes input only once it is nearly fully
// shown.
export function ProjectedScreen({
  vpRange = PROJECTED_PRODUCTS_VP_RANGE,
  children,
  testId = 'projected-screen',
}: ProjectedScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  useProjectedPlacement(screenRef, vpRange);
  const mode = useStageStore((state) => projectedMode(state.vp));
  const isPaused = useStageStore(
    (state) => projectedVisibility(state.vp, state.screenQuad, vpRange) === 0,
  );
  const isInteractive = useStageStore((state) =>
    isProjectedInteractive(
      projectedVisibility(state.vp, state.screenQuad, vpRange),
    ),
  );

  return (
    <div
      ref={screenRef}
      className={styles.projectedScreen}
      data-mode={mode}
      data-paused={isPaused}
      data-interactive={isInteractive}
      inert={!isInteractive}
      data-testid={testId}
    >
      {children?.({ mode, isPaused })}
    </div>
  );
}
