import { PROJECTED_CUSTOM_VP_RANGE } from 'constants/jukebox3d';
import { JUKEBOX_UI_HEIGHT_PX, JUKEBOX_UI_WIDTH_PX } from 'constants/jukeboxUi';
import { useStageStore } from 'features/stage';
import { type CSSProperties, useRef } from 'react';
import { childTestId } from 'utils';

import { ConfiguratorScreen } from './ConfiguratorScreen';
import styles from './flatConfiguratorScreen.module.css';
import { isOutsideVpRange } from './flatScreen';
import { useFitScale } from './useFitScale';

const SCREEN_SIZE = {
  width: JUKEBOX_UI_WIDTH_PX,
  height: JUKEBOX_UI_HEIGHT_PX,
};

export type FlatConfiguratorScreenProps = {
  // Where the screen sits: the middle column, or above the bottom sheet.
  layout: 'columns' | 'sheet';
  testId?: string;
};

// Without a 3D display to project onto (no WebGL, or the model is still loading) the live
// screen stands flat in the space the model would fill, scaled to fit.
export function FlatConfiguratorScreen({
  layout,
  testId = 'configurator-flat-screen',
}: FlatConfiguratorScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDisplay = useStageStore((state) => state.screenQuad !== null);
  const isPaused = useStageStore((state) =>
    isOutsideVpRange(state.vp, PROJECTED_CUSTOM_VP_RANGE),
  );
  const scale = useFitScale(containerRef, SCREEN_SIZE);

  if (hasDisplay) return null;

  return (
    <div
      ref={containerRef}
      className={styles.flatScreen}
      data-layout={layout}
      data-testid={testId}
    >
      <div
        className={styles.screen}
        style={{ '--flat-screen-scale': scale } as CSSProperties}
      >
        <ConfiguratorScreen
          isPaused={isPaused}
          testId={childTestId(testId, 'screen')}
        />
      </div>
    </div>
  );
}
