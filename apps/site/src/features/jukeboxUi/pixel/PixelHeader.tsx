import { childTestId } from 'utils';

import { AppIcon } from '../appIcon';
import { CreditDigits } from './CreditDigits';
import styles from './pixelJukeboxUi.module.css';

export type PixelHeaderProps = {
  credit: number;
  currencySymbol: string;
  testId: string;
};

export function PixelHeader({
  credit,
  currencySymbol,
  testId,
}: PixelHeaderProps) {
  return (
    <div className={styles.head}>
      <AppIcon name="logo" className={styles.logo} />
      <div
        className={styles.credit}
        data-testid={childTestId(testId, 'credit')}
      >
        <CreditDigits
          value={credit}
          testId={childTestId(testId, 'credit-digits')}
        />
        <span className={styles.currency}>{currencySymbol}</span>
      </div>
      <span
        className={styles.iconButton}
        data-testid={childTestId(testId, 'queue')}
      >
        <AppIcon name="queue" className={styles.queueIcon} />
      </span>
    </div>
  );
}
