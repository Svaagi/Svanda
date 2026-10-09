import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './contactSent.module.css';

export type ContactSentProps = {
  testId: string;
};

// Replaces the form once it is sent and takes the focus the submit button had.
export function ContactSent({ testId }: ContactSentProps) {
  const { t } = useTranslation();
  const sentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    sentRef.current?.focus();
  }, []);

  return (
    <p ref={sentRef} className={styles.sent} tabIndex={-1} data-testid={testId}>
      {t('contact.sent')}
    </p>
  );
}
