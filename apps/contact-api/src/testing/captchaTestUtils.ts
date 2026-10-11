import { type Challenge, solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';

import { createCaptcha } from '../captcha/index.js';
import { CAPTCHA } from '../constants/index.js';

export const TEST_HMAC_KEY = 'test-hmac-key-that-is-long-enough-0123';

// Cheap proof of work so specs solve a real challenge in milliseconds.
export function createTestCaptcha(now: () => number = Date.now) {
  return createCaptcha({
    ...CAPTCHA,
    cost: 1,
    counterMin: 1,
    counterMax: 20,
    hmacKey: TEST_HMAC_KEY,
    now,
  });
}

export const encodePayload = (payload: unknown) =>
  Buffer.from(JSON.stringify(payload)).toString('base64');

export async function solveToPayload(challenge: Challenge) {
  const solution = await solveChallenge({ challenge, deriveKey });

  if (!solution) throw new Error('test challenge was not solved');

  return encodePayload({ challenge, solution });
}
