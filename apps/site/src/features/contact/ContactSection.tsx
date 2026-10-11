import { CONTACT_SECTION_ID } from 'constants/stage';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId } from 'utils';

import { ContactForm } from './ContactForm';
import styles from './contactSection.module.css';

export type ContactSectionProps = {
  testId?: string;
};

export function ContactSection({
  testId = 'contact-section',
}: ContactSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section
      id={CONTACT_SECTION_ID}
      className={styles.contactSection}
      aria-labelledby={headingId}
      data-testid={testId}
    >
      <div className={styles.intro}>
        <p className={styles.tag}>{t('contact.tag')}</p>
        <h2
          id={headingId}
          className={styles.title}
          data-testid={childTestId(testId, 'title')}
        >
          {t('contact.title')}
        </h2>
        <p className={styles.body}>{t('contact.body')}</p>
      </div>
      <ContactForm testId={childTestId(testId, 'form')} />
    </section>
  );
}
