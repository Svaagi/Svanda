import { useRef } from 'react';
import { childTestId } from 'utils';

import styles from './heroBackground.module.css';
import { useHeroBackground } from './useHeroBackground';

export type HeroBackgroundProps = {
  testId?: string;
};

// Decorative pixel grid behind every stage page: twinkle, ghost wordmark, pointer torch and
// the jukebox floor shadow. The hero overlay carries the real heading.
export function HeroBackground({
  testId = 'hero-background',
}: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHeroBackground(canvasRef);

  return (
    <div
      className={styles.heroBackground}
      aria-hidden="true"
      data-testid={testId}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        data-testid={childTestId(testId, 'canvas')}
      />
    </div>
  );
}
