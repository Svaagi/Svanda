// Stable codes the contact API answers with as `{ error: { code } }`; the site translates them.
export const CONTACT_ERROR_CODES = [
  'contact.invalid',
  'contact.rate_limited',
  'contact.captcha_failed',
  'contact.send_failed',
  'contact.internal_error',
] as const;

export type ContactErrorCode = (typeof CONTACT_ERROR_CODES)[number];
