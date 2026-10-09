import { LEGAL_LINKS } from 'constants/legal';
import { useLocale } from 'i18n';
import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import styles from './privacyNotice.module.css';

type PrivacyLinkProps = {
  children?: ReactNode;
};

export type PrivacyNoticeProps = {
  testId: string;
};

const privacyPaths = LEGAL_LINKS.find(({ id }) => id === 'privacy')?.paths;

function PrivacyLink({ children }: PrivacyLinkProps) {
  const locale = useLocale();

  return (
    <a href={privacyPaths?.[locale]} className={styles.link}>
      {children}
    </a>
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
