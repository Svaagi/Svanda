import type { ContactSubmitErrorCode } from 'constants/contact';
import { S_PER_MIN } from 'constants/time';

import type { ContactSubmitError } from './contactSubmit';

const ERROR_MESSAGE_KEYS = {
  'contact.invalid': 'contact.status.invalid',
  'contact.rate_limited': 'contact.status.rateLimited',
  'contact.captcha_failed': 'contact.status.captchaFailed',
  'contact.send_failed': 'contact.status.sendFailed',
  'contact.internal_error': 'contact.status.internalError',
  'contact.network_error': 'contact.status.networkError',
} as const satisfies Record<ContactSubmitErrorCode, string>;

export type ContactErrorMessage =
  | { key: (typeof ERROR_MESSAGE_KEYS)[ContactSubmitErrorCode] }
  | { key: 'contact.status.rateLimitedFor'; minutes: number };

// The catalog message for a failed submit; a rate limit says how long to wait when it can.
export function contactErrorMessage({
  code,
  retryAfterSeconds,
}: ContactSubmitError): ContactErrorMessage {
  if (code === 'contact.rate_limited' && retryAfterSeconds) {
    return {
      key: 'contact.status.rateLimitedFor',
      minutes: Math.ceil(retryAfterSeconds / S_PER_MIN),
    };
  }

  return { key: ERROR_MESSAGE_KEYS[code] };
}
