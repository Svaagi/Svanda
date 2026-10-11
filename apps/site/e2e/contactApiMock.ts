import type { BrowserContext, Route } from '@playwright/test';
import {
  type Challenge,
  createChallenge,
  type Solution,
  verifySolution,
} from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';

// The preview build has no contact API, so the specs answer for it. Challenges are real but
// cheap: the page solves them in its workers, and the mock checks the solution like the API.
const HMAC_KEY = 'e2e-hmac-key-that-is-long-enough';
const CHALLENGE_COST = 1;
const CHALLENGE_COUNTER = 25;
const CHALLENGE_TTL_MS = 10 * 60 * 1000;

export const CONTACT_ROUTE = '**/api/contact';
const CHALLENGE_ROUTE = '**/api/contact/challenge';

async function fulfillChallenge(route: Route) {
  const now = Date.now();
  const challenge = await createChallenge({
    algorithm: 'PBKDF2/SHA-256',
    cost: CHALLENGE_COST,
    counter: CHALLENGE_COUNTER,
    deriveKey,
    data: { issuedAt: now },
    expiresAt: new Date(now + CHALLENGE_TTL_MS),
    hmacSignatureSecret: HMAC_KEY,
  });
  await route.fulfill({ json: challenge });
}

export async function mockContactChallenge(context: BrowserContext) {
  await context.route(CHALLENGE_ROUTE, fulfillChallenge);
}

type AltchaPayload = { challenge: Challenge; solution: Solution };

// Whether a submitted `altcha` value is a solution of a challenge this mock issued.
export async function isSolvedAltcha(encoded: unknown): Promise<boolean> {
  if (typeof encoded !== 'string') return false;
  // The mock trusts the shape: a malformed payload makes verification throw, failing the spec.
  const { challenge, solution } = JSON.parse(
    Buffer.from(encoded, 'base64').toString('utf8'),
  ) as AltchaPayload;

  const { verified } = await verifySolution({
    challenge,
    solution,
    deriveKey,
    hmacSignatureSecret: HMAC_KEY,
  });
  return verified;
}
