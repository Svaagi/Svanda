import { CONTACT_LIMITS } from '@svanda/shared';
import { describe, expect, it } from 'vitest';

import { contactFormSchema, contactIssueMessage } from './contactFormSchema';

const validValues = {
  name: 'Jana',
  venue: 'Bar U Lipy, Brno',
  email: 'jana@example.com',
  message: '',
  honeypot: '',
};

function errorKeys(values: object) {
  const result = contactFormSchema.safeParse(
    { ...validValues, ...values },
    { error: contactIssueMessage },
  );

  return Object.fromEntries(
    (result.error?.issues ?? []).map(({ path, message }) => [
      path.join('.'),
      message,
    ]),
  );
}

describe('contactFormSchema', () => {
  it('accepts the filled in fields with an empty message', () => {
    expect(errorKeys({})).toEqual({});
  });

  it.each([
    ['an empty name', { name: '' }, 'name', 'contact.errors.required'],
    ['a blank venue', { venue: '   ' }, 'venue', 'contact.errors.required'],
    ['an empty e-mail', { email: '' }, 'email', 'contact.errors.required'],
    ['an invalid e-mail', { email: 'jana@' }, 'email', 'contact.errors.email'],
    [
      'a too long message',
      { message: 'x'.repeat(CONTACT_LIMITS.message + 1) },
      'message',
      'contact.errors.tooLong',
    ],
    [
      'a line break in the name',
      { name: 'Ja\nna' },
      'name',
      'contact.errors.invalid',
    ],
  ])('names the catalog key for %s', (_label, values, field, key) => {
    expect(errorKeys(values)).toEqual({ [field]: key });
  });
});
