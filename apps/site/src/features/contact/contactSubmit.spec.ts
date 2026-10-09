import { JUKEBOX_CONFIG_DEFAULTS } from '@svanda/shared';
import { CONTACT_ENDPOINT } from 'constants/contact';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { altchaSubmitError, submitContactRequest } from './contactSubmit';

const request = {
  name: 'Jana',
  venue: 'Bar U Lipy, Brno',
  email: 'jana@example.com',
  locale: 'cs',
  honeypot: '',
  altcha: 'payload',
  config: JUKEBOX_CONFIG_DEFAULTS,
} as const;

const jsonResponse = (status: number, body: unknown, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers });

describe('submitContactRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the request as JSON and reports it sent', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { status: 'sent' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitContactRequest(request)).resolves.toEqual({
      isSent: true,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(CONTACT_ENDPOINT);
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(request);
  });

  it.each([
    [400, 'contact.invalid'],
    [403, 'contact.captcha_failed'],
    [502, 'contact.send_failed'],
    [500, 'contact.internal_error'],
  ])('passes on the code of a %i answer', async (status, code) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(status, { error: { code } })),
    );

    await expect(submitContactRequest(request)).resolves.toEqual({
      isSent: false,
      error: { code, retryAfterSeconds: undefined },
    });
  });

  it('reads how long a rate limit lasts', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            429,
            { error: { code: 'contact.rate_limited' } },
            { 'Retry-After': '600' },
          ),
        ),
    );

    await expect(submitContactRequest(request)).resolves.toEqual({
      isSent: false,
      error: { code: 'contact.rate_limited', retryAfterSeconds: 600 },
    });
  });

  it.each([
    ['an unknown code', jsonResponse(500, { error: { code: 'nope' } })],
    ['a body that is not JSON', new Response('<html>', { status: 502 })],
  ])('treats %s as an internal error', async (_label, response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    const result = await submitContactRequest(request);

    expect(result).toEqual({
      isSent: false,
      error: { code: 'contact.internal_error', retryAfterSeconds: undefined },
    });
  });

  it('reports a request that got no answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    await expect(submitContactRequest(request)).resolves.toEqual({
      isSent: false,
      error: { code: 'contact.network_error' },
    });
  });
});

describe('altchaSubmitError', () => {
  it.each([
    [{ reason: 'network' }, { code: 'contact.network_error' }],
    [
      { reason: 'rate_limited', retryAfterSeconds: 30 },
      { code: 'contact.rate_limited', retryAfterSeconds: 30 },
    ],
    [{ reason: 'not_solved' }, { code: 'contact.captcha_failed' }],
  ] as const)('maps %j to %j', (failure, error) => {
    expect(altchaSubmitError(failure)).toEqual(error);
  });
});
