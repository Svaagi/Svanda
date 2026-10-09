import {
  JUKEBOX_POSTER_HEIGHT_PX,
  JUKEBOX_POSTER_URL,
  JUKEBOX_POSTER_WIDTH_PX,
} from 'constants/jukebox3d';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { childTestId } from 'utils';

import styles from './jukebox3d.module.css';
import { useJukeboxStatus } from './useJukeboxStatus';

// three.js, R3F and drei live in this chunk alone, out of the initial bundle. The module is
// imported directly (no barrel) so the chunk keeps its name.
const JukeboxCanvas = lazy(() =>
  import('./scene/JukeboxCanvas').then(({ JukeboxCanvas: Component }) => ({
    default: Component,
  })),
);

export type JukeboxStageProps = {
  testId?: string;
};

// The 3D jukebox on the stage. A static poster render holds its place in the prerendered
// HTML, while the scene loads, and for good when WebGL is missing or fails.
export function JukeboxStage({ testId = 'jukebox-stage' }: JukeboxStageProps) {
  const { status, handleReady, handleError } = useJukeboxStatus();
  const hasScene = status === 'loading' || status === 'ready';

  return (
    <div
      className={styles.jukeboxStage}
      aria-hidden="true"
      data-state={status}
      data-testid={testId}
    >
      <img
        className={styles.poster}
        src={JUKEBOX_POSTER_URL}
        width={JUKEBOX_POSTER_WIDTH_PX}
        height={JUKEBOX_POSTER_HEIGHT_PX}
        alt=""
        decoding="async"
        data-testid={childTestId(testId, 'poster')}
      />
      {hasScene && (
        <ErrorBoundary fallback={null} onError={handleError}>
          <Suspense fallback={null}>
            <JukeboxCanvas
              onReady={handleReady}
              testId={childTestId(testId, 'canvas')}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
