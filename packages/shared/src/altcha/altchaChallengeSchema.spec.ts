import { describe, expect, it } from 'vitest';

import { altchaChallengeSchema } from './altchaChallengeSchema.js';

const challenge = {
  parameters: {
    algorithm: 'PBKDF2/SHA-256',
    nonce: 'ab',
    salt: 'cd',
    cost: 2000,
    keyLength: 32,
    keyPrefix: '00',
    expiresAt: 1_700_000_600,
    data: { issuedAt: 1_700_000_000_000 },
    futureParameter: 'kept',
  },
  signature: 'ef',
};

describe('altchaChallengeSchema', () => {
  it('keeps every parameter, known or not, for the signature check', () => {
    expect(altchaChallengeSchema.parse(challenge)).toEqual(challenge);
  });

  it.each([
    ['missing parameters', {}],
    [
      'a non numeric cost',
      { parameters: { ...challenge.parameters, cost: '1' } },
    ],
    [
      'a nested data value',
      { parameters: { ...challenge.parameters, data: { a: {} } } },
    ],
  ])('rejects %s', (_label, value) => {
    expect(altchaChallengeSchema.safeParse(value).success).toBe(false);
  });
});
