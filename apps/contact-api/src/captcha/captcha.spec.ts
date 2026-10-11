import { describe, expect, it } from 'vitest';

import {
  createTestCaptcha,
  encodePayload,
  solveToPayload,
} from '../testing/captchaTestUtils.js';

const TEN_MINUTES_MS = 10 * 60 * 1000;

describe('createCaptcha', () => {
  it('issues a signed, expiring challenge carrying its issue time', async () => {
    const now = Date.now();
    const challenge = await createTestCaptcha(() => now).createChallenge();

    expect(challenge.signature).toEqual(expect.any(String));
    expect(challenge.parameters.data).toEqual({ issuedAt: now });
    expect(challenge.parameters.expiresAt).toBe(
      Math.floor((now + TEN_MINUTES_MS) / 1000),
    );
  });

  it('accepts a solved challenge once and reports when it was issued', async () => {
    const issuedAt = Date.now();
    const captcha = createTestCaptcha(() => issuedAt);
    const payload = await solveToPayload(await captcha.createChallenge());

    expect(await captcha.verify(payload)).toEqual({ issuedAt });
    expect(await captcha.verify(payload)).toBeNull();
  });

  it('rejects a challenge whose issue time was moved back', async () => {
    const captcha = createTestCaptcha();
    const challenge = await captcha.createChallenge();
    const payload = await solveToPayload({
      ...challenge,
      parameters: { ...challenge.parameters, data: { issuedAt: 1 } },
    });

    expect(await captcha.verify(payload)).toBeNull();
  });

  it('rejects a challenge signed with another key', async () => {
    const foreign = await createTestCaptcha().createChallenge();
    const payload = await solveToPayload({
      ...foreign,
      signature: 'f'.repeat(64),
    });

    expect(await createTestCaptcha().verify(payload)).toBeNull();
  });

  it('rejects a wrong solution', async () => {
    const challenge = await createTestCaptcha().createChallenge();

    expect(
      await createTestCaptcha().verify(
        encodePayload({
          challenge,
          solution: { counter: 0, derivedKey: '00' },
        }),
      ),
    ).toBeNull();
  });

  it('rejects an expired challenge', async () => {
    const longAgo = Date.now() - 2 * TEN_MINUTES_MS;
    const captcha = createTestCaptcha(() => longAgo);
    const payload = await solveToPayload(await captcha.createChallenge());

    expect(await captcha.verify(payload)).toBeNull();
  });

  it.each(['', 'not base64 json', encodePayload({ challenge: {} })])(
    'rejects the malformed payload %j',
    async (payload) => {
      expect(await createTestCaptcha().verify(payload)).toBeNull();
    },
  );
});
