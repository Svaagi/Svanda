import { describe, expect, it } from 'vitest';

import { contactErrorMessage } from './contactErrorMessage';

describe('contactErrorMessage', () => {
  it.each([
    ['contact.invalid', 'contact.status.invalid'],
    ['contact.rate_limited', 'contact.status.rateLimited'],
    ['contact.captcha_failed', 'contact.status.captchaFailed'],
    ['contact.send_failed', 'contact.status.sendFailed'],
    ['contact.internal_error', 'contact.status.internalError'],
    ['contact.network_error', 'contact.status.networkError'],
  ] as const)('maps %s to its catalog key', (code, key) => {
    expect(contactErrorMessage({ code })).toEqual({ key });
  });

  it('says in whole minutes how long a rate limit lasts', () => {
    expect(
      contactErrorMessage({
        code: 'contact.rate_limited',
        retryAfterSeconds: 61,
      }),
    ).toEqual({ key: 'contact.status.rateLimitedFor', minutes: 2 });
  });
});
