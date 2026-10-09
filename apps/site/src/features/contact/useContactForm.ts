import { zodResolver } from '@hookform/resolvers/zod';
import { useConfiguratorStore } from 'features/configurator';
import { useLocale } from 'i18n';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { toAltchaFailure, useAltcha } from './altcha';
import {
  type ContactFormData,
  contactFormSchema,
  type ContactFormValues,
  contactIssueMessage,
} from './contactFormSchema';
import {
  altchaSubmitError,
  type ContactSubmitError,
  submitContactRequest,
} from './contactSubmit';

export type ContactFormStatus =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'sent' }
  | { state: 'error'; error: ContactSubmitError };

const resolver = zodResolver(contactFormSchema, { error: contactIssueMessage });

export function useContactForm() {
  const locale = useLocale();
  const { prepare, takePayload } = useAltcha();
  const [status, setStatus] = useState<ContactFormStatus>({ state: 'idle' });
  // No default values: the fields start empty in the HTML, and anything typed before
  // hydration is read from them instead of being reset.
  const form = useForm<ContactFormValues, unknown, ContactFormData>({
    resolver,
  });

  const submitValid = async ({ message, ...fields }: ContactFormData) => {
    setStatus({ state: 'submitting' });

    let altcha: string;
    try {
      altcha = await takePayload();
    } catch (error) {
      setStatus({
        state: 'error',
        error: altchaSubmitError(toAltchaFailure(error)),
      });
      return;
    }

    const result = await submitContactRequest({
      ...fields,
      message: message || undefined,
      locale,
      config: useConfiguratorStore.getState().toAttachment() ?? undefined,
      altcha,
    });
    setStatus(
      result.isSent
        ? { state: 'sent' }
        : { state: 'error', error: result.error },
    );
  };

  return {
    form,
    status,
    handleSubmit: form.handleSubmit(submitValid),
    handleFocus: prepare,
  };
}
