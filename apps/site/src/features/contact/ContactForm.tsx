import { CONTACT_LIMITS } from '@svanda/shared';
import { useIsHydrated } from 'hooks';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field, Input, Textarea } from 'ui';
import { childTestId } from 'utils';

import { ConfigAttachment } from './configAttachment';
import styles from './contactForm.module.css';
import { ContactSent } from './contactSent';
import { ContactStatus } from './contactStatus';
import { PrivacyNotice } from './privacyNotice';
import { useContactForm } from './useContactForm';
import { useFieldError } from './useFieldError';

const MESSAGE_ROWS = 4;

export type ContactFormProps = {
  testId?: string;
};

export function ContactForm({ testId = 'contact-form' }: ContactFormProps) {
  const { t } = useTranslation();
  const honeypotId = useId();
  const { form, status, handleSubmit, handleFocus } = useContactForm();
  const { register, formState } = form;
  const fieldError = useFieldError(formState.errors);
  const isSubmitting = status.state === 'submitting';
  // Until hydration a click would submit the HTML form natively, putting the fields in the URL.
  const isHydrated = useIsHydrated();

  if (status.state === 'sent') {
    return <ContactSent testId={childTestId(testId, 'sent')} />;
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      onFocus={handleFocus}
      data-testid={testId}
    >
      <Field
        label={t('contact.form.name')}
        error={fieldError('name')}
        testId={childTestId(testId, 'name')}
      >
        <Input
          {...register('name')}
          autoComplete="name"
          required
          maxLength={CONTACT_LIMITS.name}
          testId={childTestId(testId, 'name-input')}
        />
      </Field>
      <Field
        label={t('contact.form.venue')}
        error={fieldError('venue')}
        testId={childTestId(testId, 'venue')}
      >
        <Input
          {...register('venue')}
          autoComplete="organization"
          required
          maxLength={CONTACT_LIMITS.venue}
          testId={childTestId(testId, 'venue-input')}
        />
      </Field>
      <div className={styles.fullRow}>
        <Field
          label={t('contact.form.email')}
          error={fieldError('email')}
          testId={childTestId(testId, 'email')}
        >
          <Input
            {...register('email')}
            type="email"
            autoComplete="email"
            required
            maxLength={CONTACT_LIMITS.email}
            testId={childTestId(testId, 'email-input')}
          />
        </Field>
      </div>
      <div className={styles.fullRow}>
        <Field
          label={t('contact.form.message')}
          hint={t('contact.form.optional')}
          error={fieldError('message')}
          testId={childTestId(testId, 'message')}
        >
          <Textarea
            {...register('message')}
            rows={MESSAGE_ROWS}
            maxLength={CONTACT_LIMITS.message}
            testId={childTestId(testId, 'message-input')}
          />
        </Field>
      </div>
      {/* Hidden from people; a bot that fills it in is turned down by the API. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={honeypotId}>{t('contact.form.honeypot')}</label>
        <input
          {...register('honeypot')}
          id={honeypotId}
          tabIndex={-1}
          autoComplete="off"
          data-testid={childTestId(testId, 'honeypot')}
        />
      </div>
      <div className={styles.fullRow}>
        <ConfigAttachment testId={childTestId(testId, 'config')} />
      </div>
      <div className={styles.actions}>
        <Button
          type="submit"
          disabled={isSubmitting || !isHydrated}
          testId={childTestId(testId, 'submit')}
        >
          {t(isSubmitting ? 'contact.form.submitting' : 'contact.form.submit')}
        </Button>
        <div className={styles.privacySlot}>
          <PrivacyNotice testId={childTestId(testId, 'privacy')} />
        </div>
      </div>
      <div className={styles.fullRow}>
        <ContactStatus status={status} testId={childTestId(testId, 'status')} />
      </div>
    </form>
  );
}
