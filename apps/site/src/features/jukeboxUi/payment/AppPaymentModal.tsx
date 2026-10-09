import type { JukeboxUiDesign } from '@svanda/shared';
import { useTranslation } from 'react-i18next';
import { childTestId, classNames } from 'utils';

import type { AppPayment } from '../appContent';
import { AppIcon } from '../appIcon';
import styles from './appPaymentModal.module.css';

export type AppPaymentModalProps = {
  design: JukeboxUiDesign;
  payment: AppPayment;
  testId: string;
};

// The app's "add this song" window over the list. A picture of it: nothing here is a control.
export function AppPaymentModal({
  design,
  payment,
  testId,
}: AppPaymentModalProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay} data-design={design} data-testid={testId}>
      <div className={styles.modal}>
        <p className={styles.title}>{payment.title}</p>
        <p className={styles.balance}>
          <span className={styles.balanceLabel}>
            {t('jukeboxUi.payment.balance')}
          </span>{' '}
          <b className={styles.balanceValue}>{payment.balance}</b>
        </p>
        <div className={styles.option} data-testid={childTestId(testId, 'add')}>
          {payment.add}
        </div>
        <div
          className={classNames(styles.option, styles.vip)}
          data-testid={childTestId(testId, 'vip')}
        >
          <AppIcon name="star" className={styles.star} />
          <span>{payment.vip}</span>
          <AppIcon name="star" className={styles.star} />
        </div>
      </div>
    </div>
  );
}
