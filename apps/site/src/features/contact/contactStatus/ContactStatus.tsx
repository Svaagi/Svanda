import { useTranslation } from 'react-i18next';

import { contactErrorMessage } from '../contactErrorMessage';
import type { ContactFormStatus } from '../useContactForm';
import styles from './contactStatus.module.css';

export type ContactStatusProps = {
  status: ContactFormStatus;
  testId: string;
};

// Always rendered, so the live region exists before a state is announced into it.
export function ContactStatus({ status, testId }: ContactStatusProps) {
  const text = useStatusText(status);

  return (
    <p
      className={styles.status}
      role="status"
      data-state={status.state}
      data-testid={testId}
    >
      {text}
    </p>
  );
}

function useStatusText(status: ContactFormStatus) {
  const { t } = useTranslation();

  if (status.state === 'submitting') return t('contact.status.sending');
  if (status.state !== 'error') return '';

  const message = contactErrorMessage(status.error);
  return t(message.key, message);
}
