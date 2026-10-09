import { MAIN_CONTENT_ID } from 'constants/nav';
import { useTranslation } from 'react-i18next';

import styles from './skipLink.module.css';

export type SkipLinkProps = {
  testId?: string;
};

export function SkipLink({ testId = 'skip-link' }: SkipLinkProps) {
  const { t } = useTranslation();

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={styles.skipLink}
      data-testid={testId}
    >
      {t('nav.skipToContent')}
    </a>
  );
}
