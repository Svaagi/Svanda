import { useRef } from 'react';
import { childTestId } from 'utils';

import styles from './intro.module.css';
import { useIntroTimeline } from './useIntroTimeline';

export type IntroCanvasProps = {
  testId?: string;
};

// Decorative: the header logo carries the brand name once the swarm lands on it. Hidden
// unless an intro is pending or playing (`data-intro` on <html>).
export function IntroCanvas({ testId = 'intro' }: IntroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useIntroTimeline(canvasRef);

  return (
    <div className={styles.intro} aria-hidden="true" data-testid={testId}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        data-testid={childTestId(testId, 'canvas')}
      />
    </div>
  );
}
