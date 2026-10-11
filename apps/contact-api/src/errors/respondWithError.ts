import type { ContactErrorCode } from '@svanda/shared';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import type { AppEnv } from '../appEnv.js';

const ERROR_STATUS: Record<ContactErrorCode, ContentfulStatusCode> = {
  'contact.invalid': 400,
  'contact.rate_limited': 429,
  'contact.captcha_failed': 403,
  'contact.send_failed': 502,
  'contact.internal_error': 500,
};

// The only error shape the API returns: a stable code, never a stack trace or SMTP detail.
export function respondWithError(
  context: Context<AppEnv>,
  code: ContactErrorCode,
  status: ContentfulStatusCode = ERROR_STATUS[code],
) {
  context.set('errorCode', code);

  return context.json({ error: { code } }, status);
}
