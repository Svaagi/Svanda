import type { JukeboxSection } from '@svanda/shared';
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
  children?: (state: ProjectedScreenState) => ReactNode;
  testId?: string;
};

// A 540x960 DOM screen laid exactly over the 3D jukebox display on the product pages. Hidden
// (and inert) when the display is away; it takes input only once it is nearly fully shown.
export function ProjectedScreen({
  children,
  testId = 'projected-screen',
}: ProjectedScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  useProjectedPlacement(screenRef);
  const mode = useStageStore((state) => projectedMode(state.vp));
  const isPaused = useStageStore(
    (state) => projectedVisibility(state.vp, state.screenQuad) === 0,
  );
  const isInteractive = useStageStore((state) =>
    isProjectedInteractive(projectedVisibility(state.vp, state.screenQuad)),
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
