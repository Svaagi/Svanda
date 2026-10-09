import { useMemo } from 'react';

import { creditDigits } from '../creditDigits';
import styles from './pixelJukeboxUi.module.css';

export type CreditDigitsProps = {
  value: number;
  testId: string;
};

// The credit counter in the app's 4 x 5 pixel digits, one grid cell per pixel.
export function CreditDigits({ value, testId }: CreditDigitsProps) {
  const digits = useMemo(() => creditDigits(value), [value]);

  return (
    <span className={styles.digits} data-value={value} data-testid={testId}>
      {digits.map(({ digit, cells }, digitIndex) => (
        // Positions are the identity here: a digit never moves within the number.
        <span key={`${digitIndex}:${digit}`} className={styles.digit}>
          {cells.map((isLit, cellIndex) => (
            <span
              key={cellIndex}
              className={styles.digitCell}
              data-lit={isLit}
            />
          ))}
        </span>
      ))}
    </span>
  );
}
