import { type MouseEventHandler } from 'react';
import { PixelChevron } from 'ui';
import { childTestId } from 'utils';

import styles from './venueFrame.module.css';

export type VenueChevronButtonProps = {
  direction: 'up' | 'down';
  label: string;
  cellPx: number;
  onClick: MouseEventHandler<HTMLButtonElement>;
  testId: string;
};

export function VenueChevronButton({
  direction,
  label,
  cellPx,
  onClick,
  testId,
}: VenueChevronButtonProps) {
  return (
    <button
      type="button"
      className={styles.chevron}
      data-direction={direction}
      aria-label={label}
      onClick={onClick}
      data-testid={testId}
    >
      <PixelChevron
        direction={direction}
        cellSize={cellPx}
        testId={childTestId(testId, 'pixels')}
      />
    </button>
  );
}
