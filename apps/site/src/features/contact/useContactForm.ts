import { zodResolver } from '@hookform/resolvers/zod';
import { useConfiguratorStore } from 'features/configurator';
import { useLocale } from 'i18n';
import { track } from 'lib/analytics';
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

  // Only the error code is reported: nothing the visitor typed leaves through analytics.
  const fail = (error: ContactSubmitError) => {
    setStatus({ state: 'error', error });
    track('contact_submit_error', { code: error.code });
  };

  const submitValid = async ({ message, ...fields }: ContactFormData) => {
    setStatus({ state: 'submitting' });

    let altcha: string;
    try {
      altcha = await takePayload();
    } catch (error) {
      fail(altchaSubmitError(toAltchaFailure(error)));
      return;
    }

    const result = await submitContactRequest({
      ...fields,
      message: message || undefined,
      locale,
      config: useConfiguratorStore.getState().toAttachment() ?? undefined,
      altcha,
    });
    if (!result.isSent) {
      fail(result.error);
      return;
    }
    setStatus({ state: 'sent' });
    track('contact_submit_success');
  };

  return {
    form,
    status,
    handleSubmit: form.handleSubmit(submitValid),
    handleFocus: prepare,
  };
}
