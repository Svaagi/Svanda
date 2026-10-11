import { CONTACT_MIN_FILL_TIME_MS } from '@svanda/shared';
import {
  ALTCHA_EXPIRY_MARGIN_MS,
  CONTACT_CHALLENGE_ENDPOINT,
  CONTACT_FILL_TIME_MARGIN_MS,
} from 'constants/contact';
import { MS_PER_S } from 'constants/time';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  fetchChallenge,
  fillTimeRemainingMs,
  isChallengeFresh,
} from './altchaChallenge';
import { AltchaError } from './altchaError';

const SERVER_ISSUED_AT_MS = 1_000_000;
const LIFETIME_MS = 600_000;
const RECEIVED_AT_MS = 5_000;

const challengeBody = {
  parameters: {
    algorithm: 'PBKDF2/SHA-256',
    nonce: 'ab',
    salt: 'cd',
    cost: 2000,
    keyLength: 32,
    keyPrefix: '00',
    keySignature: 'ef',
    expiresAt: (SERVER_ISSUED_AT_MS + LIFETIME_MS) / MS_PER_S,
    data: { issuedAt: SERVER_ISSUED_AT_MS },
  },
  signature: '12',
};

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('fetchChallenge', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps every parameter and plans the replacement on the local clock', async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify(challengeBody)));

    const issued = await fetchChallenge(() => RECEIVED_AT_MS);

    expect(fetchMock).toHaveBeenCalledWith(CONTACT_CHALLENGE_ENDPOINT, {
      cache: 'no-store',
    });
    expect(issued).toEqual({
      challenge: challengeBody,
      receivedAtMs: RECEIVED_AT_MS,
      replaceAtMs: RECEIVED_AT_MS + LIFETIME_MS - ALTCHA_EXPIRY_MARGIN_MS,
    });
  });

  it('never replaces a challenge without an expiry', async () => {
    const { expiresAt: _expiresAt, ...parameters } = challengeBody.parameters;
    stubFetch(new Response(JSON.stringify({ parameters })));

    const issued = await fetchChallenge();

    expect(issued.replaceAtMs).toBe(Number.POSITIVE_INFINITY);
  });

  it('reports a request that got no answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    await expect(fetchChallenge()).rejects.toEqual(
      new AltchaError({ reason: 'network' }),
    );
  });

  it('reports a rate limit and how long it lasts', async () => {
    stubFetch(
      new Response('{}', { status: 429, headers: { 'Retry-After': '90' } }),
    );

    const error: unknown = await fetchChallenge().catch((reason) => reason);

    expect(error).toBeInstanceOf(AltchaError);
    expect((error as AltchaError).failure).toEqual({
      reason: 'rate_limited',
      retryAfterSeconds: 90,
    });
  });

  it.each([
    ['a failed request', new Response('{}', { status: 500 })],
    ['a body that is not JSON', new Response('<html>')],
    ['a malformed challenge', new Response(JSON.stringify({ parameters: {} }))],
  ])('reports %s as not solvable', async (_label, response) => {
    stubFetch(response);

    const error: unknown = await fetchChallenge().catch((reason) => reason);

    expect((error as AltchaError).failure).toEqual({ reason: 'not_solved' });
  });
});

describe('challenge timing', () => {
  const issued = {
    challenge: challengeBody,
    receivedAtMs: RECEIVED_AT_MS,
    replaceAtMs: RECEIVED_AT_MS + LIFETIME_MS,
  };

  it('is fresh until its replacement time', () => {
    expect(isChallengeFresh(issued, issued.replaceAtMs - 1)).toBe(true);
    expect(isChallengeFresh(issued, issued.replaceAtMs)).toBe(false);
  });

  it('holds a submit back until the minimum fill time passed', () => {
    const fillTimeMs = CONTACT_MIN_FILL_TIME_MS + CONTACT_FILL_TIME_MARGIN_MS;

    expect(fillTimeRemainingMs(issued, RECEIVED_AT_MS)).toBe(fillTimeMs);
    expect(fillTimeRemainingMs(issued, RECEIVED_AT_MS + fillTimeMs)).toBe(0);
    expect(fillTimeRemainingMs(issued, RECEIVED_AT_MS + LIFETIME_MS)).toBe(0);
  });
});
