import {
  CONTACT_ERROR_CODES,
  type ContactErrorCode,
  JUKEBOX_CONFIG_DEFAULTS,
} from '@svanda/shared';
import { describe, expect, it } from 'vitest';

import { BODY_LIMIT_BYTES, MIN_FILL_TIME_MS } from '../constants/index.js';
import { solveToPayload } from '../testing/captchaTestUtils.js';
import {
  contactRequestFixture,
  TEST_ADDRESSES,
} from '../testing/contactRequestFixture.js';
import {
  createTestApp,
  TEST_CHALLENGE_RATE_LIMIT,
  TEST_ORIGIN,
  TEST_RATE_LIMIT,
} from '../testing/createTestApp.js';

type TestApp = ReturnType<typeof createTestApp>;

const coveredCodes = new Set<ContactErrorCode>();

// A request whose challenge was issued `fillTimeMs` before it is posted.
async function validBody(
  { captcha, clock }: TestApp,
  fillTimeMs = MIN_FILL_TIME_MS,
) {
  const challenge = await captcha.createChallenge();
  clock.time += fillTimeMs;

  return {
    ...contactRequestFixture,
    altcha: await solveToPayload(challenge),
  };
}

const post = (
  { app }: TestApp,
  body: unknown,
  headers: Record<string, string> = {},
) =>
  app.request('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

async function expectError(
  response: Response,
  status: number,
  code: ContactErrorCode,
) {
  coveredCodes.add(code);
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ error: { code } });
}

describe('GET /api/contact/challenge', () => {
  it('returns a fresh, uncached signed challenge', async () => {
    const testApp = createTestApp();

    const response = await testApp.app.request('/api/contact/challenge');

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({
      parameters: { algorithm: 'PBKDF2/SHA-256' },
      signature: expect.any(String),
    });
  });
});

describe('GET /api/contact/challenge rate limit', () => {
  it('limits challenge requests separately and more loosely than submits', async () => {
    const { app } = createTestApp();
    const fetchChallenge = () => app.request('/api/contact/challenge');

    for (let i = 0; i < TEST_CHALLENGE_RATE_LIMIT; i++) {
      expect((await fetchChallenge()).status).toBe(200);
    }

    await expectError(await fetchChallenge(), 429, 'contact.rate_limited');
  });
});

describe('POST /api/contact', () => {
  it('sends the internal mail and the confirmation for a valid request', async () => {
    const testApp = createTestApp();
    const body = {
      ...(await validBody(testApp)),
      config: JUKEBOX_CONFIG_DEFAULTS,
    };

    const response = await post(testApp, body);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'sent' });
    expect(testApp.sendMail).toHaveBeenCalledTimes(2);
    expect(testApp.sendMail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: TEST_ADDRESSES.to,
        replyTo: expect.objectContaining({ address: body.email }),
        attachments: [expect.objectContaining({ filename: 'config.json' })],
      }),
    );
    expect(testApp.sendMail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ to: body.email }),
    );
  });

  it('answers sent when only the confirmation fails', async () => {
    const testApp = createTestApp();
    testApp.sendMail
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('mailbox full'));

    const response = await post(testApp, await validBody(testApp));

    expect(response.status).toBe(200);
  });

  it.each([
    ['malformed JSON', '{"name":'],
    ['a missing field', { name: 'Jana' }],
    ['an unknown field', { ...contactRequestFixture, admin: true }],
    ['an invalid e-mail', { ...contactRequestFixture, email: 'nope' }],
  ])('rejects %s as invalid', async (_label, body) => {
    await expectError(
      await post(createTestApp(), body),
      400,
      'contact.invalid',
    );
  });

  it('rejects a body over 32 KB', async () => {
    const testApp = createTestApp();
    const body = {
      ...contactRequestFixture,
      message: 'x'.repeat(BODY_LIMIT_BYTES),
    };

    await expectError(await post(testApp, body), 413, 'contact.invalid');
    expect(testApp.sendMail).not.toHaveBeenCalled();
  });

  it('rejects a filled honeypot as a bot', async () => {
    const testApp = createTestApp();
    const body = { ...(await validBody(testApp)), honeypot: 'http://spam' };

    await expectError(await post(testApp, body), 403, 'contact.captcha_failed');
    expect(testApp.sendMail).not.toHaveBeenCalled();
  });

  it('rejects a form sent faster than a person can fill it', async () => {
    const testApp = createTestApp();
    const body = await validBody(testApp, MIN_FILL_TIME_MS - 1);

    await expectError(await post(testApp, body), 403, 'contact.captcha_failed');
  });

  it('rejects a bad captcha payload', async () => {
    const testApp = createTestApp();
    const body = {
      ...(await validBody(testApp)),
      altcha: 'bm90IGEgcGF5bG9hZA==',
    };

    await expectError(await post(testApp, body), 403, 'contact.captcha_failed');
  });

  it('rejects a replayed captcha payload', async () => {
    const testApp = createTestApp();
    const body = await validBody(testApp);
    await post(testApp, body);

    await expectError(await post(testApp, body), 403, 'contact.captcha_failed');
    expect(testApp.sendMail).toHaveBeenCalledTimes(2);
  });

  it('rate limits a flood from one IPv6 /64 with Retry-After, others unaffected', async () => {
    const testApp = createTestApp();
    const limitedBody = await validBody(testApp);
    const otherBody = await validBody(testApp);

    for (let i = 0; i < TEST_RATE_LIMIT; i++) {
      await post(testApp, { name: 'flood' }, { 'x-test-ip': `2001:db8::${i}` });
    }
    const limited = await post(testApp, limitedBody, {
      'x-test-ip': '2001:db8::ffff',
    });

    expect(limited.headers.get('retry-after')).toBe('60');
    await expectError(limited, 429, 'contact.rate_limited');

    const other = await post(testApp, otherBody, {
      'x-test-ip': '2001:db8:0:1::1',
    });
    expect(other.status).toBe(200);
  });

  it('reports a failed internal mail without leaking the SMTP error', async () => {
    const testApp = createTestApp();
    testApp.sendMail.mockRejectedValue(
      Object.assign(new Error('535 auth failed for jana@example.com'), {
        code: 'EAUTH',
      }),
    );

    const response = await post(testApp, await validBody(testApp));

    await expectError(response, 502, 'contact.send_failed');
    expect(testApp.logLines.join('')).toContain('EAUTH');
  });

  it('logs requests without personal data', async () => {
    const testApp = createTestApp();
    testApp.sendMail
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('rejected jana@example.com'));
    const body = await validBody(testApp);

    await post(testApp, body, { 'x-test-ip': '203.0.113.7' });
    await post(testApp, { ...body, honeypot: 'x' });

    const log = testApp.logLines.join('');
    expect(testApp.logLines.length).toBeGreaterThanOrEqual(3);
    expect(log).toContain('"path":"/api/contact"');
    expect(log).toContain('"errorCode":"contact.captcha_failed"');
    for (const personal of [
      body.name,
      body.email,
      body.venue,
      'second line',
      '203.0.113.7',
    ]) {
      expect(log).not.toContain(personal);
    }
  });

  it('allows the configured origin only', async () => {
    const { app } = createTestApp();
    const preflight = (origin: string) =>
      app.request('/api/contact', {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'POST',
        },
      });

    expect(
      (await preflight(TEST_ORIGIN)).headers.get('access-control-allow-origin'),
    ).toBe(TEST_ORIGIN);
    expect(
      (await preflight('https://evil.example')).headers.get(
        'access-control-allow-origin',
      ),
    ).toBeNull();
  });
});

describe('unhandled errors', () => {
  it('answers internal_error and logs only the error name', async () => {
    const testApp = createTestApp({
      captcha: {
        createChallenge: () =>
          Promise.reject(new TypeError('secret detail jana@example.com')),
        verify: () => Promise.resolve(null),
      },
    });

    const response = await testApp.app.request('/api/contact/challenge');

    await expectError(response, 500, 'contact.internal_error');
    const log = testApp.logLines.join('');
    expect(log).toContain('"errorName":"TypeError"');
    expect(log).toContain('"errorCode":"contact.internal_error"');
    expect(log).not.toContain('secret detail');
    expect(log).not.toContain('jana@example.com');
  });
});

describe('error codes', () => {
  it('covers every stable error code', () => {
    expect([...coveredCodes].sort()).toEqual([...CONTACT_ERROR_CODES].sort());
  });
});
