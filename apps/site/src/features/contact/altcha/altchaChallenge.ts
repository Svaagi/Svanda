import {
  altchaChallengeSchema,
  CONTACT_MIN_FILL_TIME_MS,
} from '@svanda/shared';
import type { Challenge } from 'altcha-lib';
import {
  ALTCHA_EXPIRY_MARGIN_MS,
  CONTACT_CHALLENGE_ENDPOINT,
  CONTACT_FILL_TIME_MARGIN_MS,
  HTTP_TOO_MANY_REQUESTS,
} from 'constants/contact';
import { MS_PER_S } from 'constants/time';

import { readRetryAfterSeconds } from '../retryAfter';
import { AltchaError } from './altchaError';

export type IssuedChallenge = {
  challenge: Challenge;
  // Local clock times: the server's clock may differ, so only its durations are used.
  receivedAtMs: number;
  replaceAtMs: number;
};

// How long the server keeps the challenge valid, from its own issue and expiry times.
function challengeLifetimeMs({ parameters }: Challenge): number {
  const issuedAtMs = parameters.data?.issuedAt;
  if (parameters.expiresAt === undefined || typeof issuedAtMs !== 'number') {
    return Number.POSITIVE_INFINITY;
  }

  return parameters.expiresAt * MS_PER_S - issuedAtMs;
}

async function requestChallenge(): Promise<Response> {
  try {
    return await fetch(CONTACT_CHALLENGE_ENDPOINT, { cache: 'no-store' });
  } catch {
    throw new AltchaError({ reason: 'network' });
  }
}

async function readChallenge(response: Response): Promise<Challenge> {
  if (response.status === HTTP_TOO_MANY_REQUESTS) {
    throw new AltchaError({
      reason: 'rate_limited',
      retryAfterSeconds: readRetryAfterSeconds(response),
    });
  }
  const parsed = response.ok
    ? altchaChallengeSchema.safeParse(await response.json().catch(() => null))
    : null;
  if (!parsed?.success) throw new AltchaError({ reason: 'not_solved' });

  return parsed.data;
}

// Rejects with an AltchaError saying why no challenge came.
export async function fetchChallenge(
  nowMs: () => number = Date.now,
): Promise<IssuedChallenge> {
  const challenge = await readChallenge(await requestChallenge());
  const receivedAtMs = nowMs();

  return {
    challenge,
    receivedAtMs,
    replaceAtMs:
      receivedAtMs + challengeLifetimeMs(challenge) - ALTCHA_EXPIRY_MARGIN_MS,
  };
}

export const isChallengeFresh = (issued: IssuedChallenge, nowMs: number) =>
  nowMs < issued.replaceAtMs;

// The API turns down a submit that comes sooner than the minimum fill time after it issued
// the challenge; this is how long to hold the submit back so it never does.
export const fillTimeRemainingMs = (issued: IssuedChallenge, nowMs: number) =>
  Math.max(
    0,
    issued.receivedAtMs +
      CONTACT_MIN_FILL_TIME_MS +
      CONTACT_FILL_TIME_MARGIN_MS -
      nowMs,
  );
