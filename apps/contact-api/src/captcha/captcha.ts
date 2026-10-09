import { createHmac } from 'node:crypto';

import {
  CappedMap,
  type Challenge,
  createChallenge,
  randomInt,
  verifySolution,
} from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';

import { decodeAltchaPayload } from './altchaPayload.js';

export type CaptchaVerification = {
  // When the server issued the solved challenge (epoch ms, covered by the HMAC signature).
  issuedAt: number;
};

export type Captcha = {
  createChallenge: () => Promise<Challenge>;
  // Null when the payload is malformed, tampered with, expired, wrong or already redeemed.
  verify: (encodedPayload: string) => Promise<CaptchaVerification | null>;
};

export type CaptchaOptions = {
  hmacKey: string;
  now: () => number;
  algorithm: string;
  cost: number;
  counterMin: number;
  counterMax: number;
  ttlMs: number;
  maxRememberedSolutions: number;
};

// The derived key signature uses its own secret, derived so only one key lives in the env.
const deriveKeySignatureSecret = (hmacKey: string) =>
  createHmac('sha256', hmacKey).update('altcha-key-signature').digest('hex');

export function createCaptcha(options: CaptchaOptions): Captcha {
  const { hmacKey, now } = options;
  const hmacKeySignatureSecret = deriveKeySignatureSecret(hmacKey);
  // Each challenge can be redeemed once, so a solved payload cannot be replayed.
  const redeemedNonces = new CappedMap<string, true>({
    maxSize: options.maxRememberedSolutions,
  });

  return {
    createChallenge: () =>
      createChallenge({
        algorithm: options.algorithm,
        cost: options.cost,
        counter: randomInt(options.counterMin, options.counterMax),
        deriveKey,
        data: { issuedAt: now() },
        expiresAt: new Date(now() + options.ttlMs),
        hmacSignatureSecret: hmacKey,
        hmacKeySignatureSecret,
      }),

    async verify(encodedPayload) {
      const payload = decodeAltchaPayload(encodedPayload);

      if (!payload) return null;

      const { nonce, data } = payload.challenge.parameters;
      const issuedAt = data?.issuedAt;

      if (typeof issuedAt !== 'number') return null;

      try {
        const result = await verifySolution({
          ...payload,
          deriveKey,
          hmacSignatureSecret: hmacKey,
          hmacKeySignatureSecret,
        });

        return result.verified && redeemedNonces.setIfAbsent(nonce, true)
          ? { issuedAt }
          : null;
      } catch {
        return null;
      }
    },
  };
}
