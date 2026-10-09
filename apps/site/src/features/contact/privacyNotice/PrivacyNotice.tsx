import { LEGAL_PATHS } from 'constants/legal';
import { useLocale } from 'i18n';
import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';

import styles from './privacyNotice.module.css';

type PrivacyLinkProps = {
  children?: ReactNode;
};

export type PrivacyNoticeProps = {
  testId: string;
};

function PrivacyLink({ children }: PrivacyLinkProps) {
  const locale = useLocale();

  return (
    <Link to={LEGAL_PATHS.privacy[locale]} className={styles.link}>
      {children}
    </Link>
  );
}

export function PrivacyNotice({ testId }: PrivacyNoticeProps) {
  return (
    <p className={styles.privacy} data-testid={testId}>
      <Trans
        i18nKey="contact.form.privacy"
        components={{ privacyLink: <PrivacyLink /> }}
      />
    </p>
  );
}
