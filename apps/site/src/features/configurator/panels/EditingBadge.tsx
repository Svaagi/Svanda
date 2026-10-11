import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { useConfiguratorStore } from '../model';
import { useEditingNames } from '../useEditingNames';
import styles from './panels.module.css';

export type EditingBadgeProps = {
  testId?: string;
};

// What the controls edit right now, with a dot in its accent colour.
export function EditingBadge({ testId = 'editing-badge' }: EditingBadgeProps) {
  const { t } = useTranslation();
  const { target } = useEditingNames();
  const accent = useConfiguratorStore(
    (state) => state.config[state.design][state.section].acc,
  );

  return (
    <p className={styles.editingBadge} data-testid={testId}>
      <span
        className={styles.editingDot}
        style={{ '--editing-dot': accent } as CSSProperties}
        aria-hidden="true"
      />
      <span>
        {t('configurator.editing')}{' '}
        <strong className={styles.editingTarget}>{target}</strong>
      </span>
    </p>
  );
}
