import { contactRequestSchema } from '@svanda/shared';
import type { z } from 'zod';

// The fields the visitor fills in; locale, configuration and proof of work join at submit.
export const contactFormSchema = contactRequestSchema.pick({
  name: true,
  venue: true,
  email: true,
  message: true,
  honeypot: true,
});

export type ContactFormValues = z.input<typeof contactFormSchema>;
export type ContactFormData = z.output<typeof contactFormSchema>;
export type ContactFormField = keyof ContactFormValues;

export const CONTACT_FIELD_ERROR_KEYS = [
  'contact.errors.required',
  'contact.errors.email',
  'contact.errors.tooLong',
  'contact.errors.invalid',
] as const;

export type ContactFieldErrorKey = (typeof CONTACT_FIELD_ERROR_KEYS)[number];

export const isContactFieldErrorKey = (
  value: unknown,
): value is ContactFieldErrorKey =>
  CONTACT_FIELD_ERROR_KEYS.some((key) => key === value);

const isEmptyInput = (input: unknown) =>
  typeof input === 'string' && !input.trim();

// Turns a validation issue of the shared schema into a catalog key, so the field errors are
// translated without restating the schema's rules here.
export function contactIssueMessage(
  issue: z.core.$ZodRawIssue,
): ContactFieldErrorKey {
  if (isEmptyInput(issue.input)) return 'contact.errors.required';

  switch (issue.code) {
    case 'too_big':
      return 'contact.errors.tooLong';
    case 'invalid_format':
      return issue.format === 'email'
        ? 'contact.errors.email'
        : 'contact.errors.invalid';
    default:
      return 'contact.errors.invalid';
  }
}
