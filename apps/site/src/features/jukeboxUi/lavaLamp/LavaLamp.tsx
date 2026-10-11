import type { CSSProperties, RefObject } from 'react';
import { childTestId, classNames } from 'utils';

import styles from './lavaLamp.module.css';
import type { LavaLampSettings } from './lavaSettings';

export type LavaLampProps = {
  settings: LavaLampSettings;
  // The canvas `useLavaLamps` draws on.
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isPaused?: boolean;
  testId?: string;
};

// The background behind a jukebox app design. Decorative: the app screen around it carries
// the label.
export function LavaLamp({
  settings,
  canvasRef,
  isPaused = false,
  testId = 'lava-lamp',
}: LavaLampProps) {
  const { design, blur, hasScanlines } = settings;

  return (
    <div
      className={classNames(styles.lavaLamp, styles[design])}
      style={{ '--lava-blur': blur } as CSSProperties}
      aria-hidden="true"
      data-design={design}
      data-paused={isPaused}
      data-testid={testId}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        data-testid={childTestId(testId, 'canvas')}
      />
      {hasScanlines && (
        <div
          className={styles.scanlines}
          data-testid={childTestId(testId, 'scanlines')}
        />
      )}
    </div>
  );
}
