import { CONTACT_LIMITS } from '@svanda/shared';
import type { FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  type ContactFormField,
  type ContactFormValues,
  isContactFieldErrorKey,
} from './contactFormSchema';

export function useFieldError(errors: FieldErrors<ContactFormValues>) {
  const { t } = useTranslation();

  return (field: ContactFormField) => {
    const message = errors[field]?.message;
    if (!message) return undefined;

    return t(
      isContactFieldErrorKey(message) ? message : 'contact.errors.invalid',
      {
        max: CONTACT_LIMITS[field],
      },
    );
  };
}
