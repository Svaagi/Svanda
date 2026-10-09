import {
  CONTACT_ERROR_CODES,
  type ContactErrorCode,
  type ContactRequest,
  isRecord,
} from '@svanda/shared';
import { CONTACT_ENDPOINT } from 'constants/contact';

import type { AltchaFailure } from './altcha';
import { readRetryAfterSeconds } from './retryAfter';

// `network_error` is the site's own: the request never got an answer.
export type ContactSubmitErrorCode = ContactErrorCode | 'contact.network_error';

export type ContactSubmitError = {
  code: ContactSubmitErrorCode;
  // Set when a rate limited request says when to try again.
  retryAfterSeconds?: number;
};

export type ContactSubmitResult =
  { isSent: true } | { isSent: false; error: ContactSubmitError };

const isContactErrorCode = (value: unknown): value is ContactErrorCode =>
  CONTACT_ERROR_CODES.some((code) => code === value);

async function readErrorCode(response: Response): Promise<ContactErrorCode> {
  try {
    const body: unknown = await response.json();
    const code = isRecord(body) && isRecord(body.error) && body.error.code;
    return isContactErrorCode(code) ? code : 'contact.internal_error';
  } catch {
    return 'contact.internal_error';
  }
}

export async function submitContactRequest(
  request: ContactRequest,
): Promise<ContactSubmitResult> {
  let response: Response;
  try {
    response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    return { isSent: false, error: { code: 'contact.network_error' } };
  }

  if (response.ok) return { isSent: true };

  return {
    isSent: false,
    error: {
      code: await readErrorCode(response),
      retryAfterSeconds: readRetryAfterSeconds(response),
    },
  };
}

// A proof of work that could not be made fails the submit before anything is sent.
export function altchaSubmitError(failure: AltchaFailure): ContactSubmitError {
  switch (failure.reason) {
    case 'network':
      return { code: 'contact.network_error' };
    case 'rate_limited':
      return {
        code: 'contact.rate_limited',
        retryAfterSeconds: failure.retryAfterSeconds,
      };
    default:
      return { code: 'contact.captcha_failed' };
  }
}
