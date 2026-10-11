import type { Challenge } from 'altcha-lib';
import { describe, expect, it } from 'vitest';

import { encodeAltchaPayload } from './altchaPayload';

const challenge: Challenge = {
  parameters: {
    algorithm: 'PBKDF2/SHA-256',
    nonce: 'ab',
    salt: 'cd',
    cost: 1,
    keyLength: 32,
    keyPrefix: '00',
    data: { issuedAt: 1 },
  },
  signature: 'ef',
};

describe('encodeAltchaPayload', () => {
  it('encodes the challenge and its solution as base64 JSON', () => {
    const solution = { counter: 7, derivedKey: '00ff', time: 3 };

    const decoded: unknown = JSON.parse(
      atob(encodeAltchaPayload(challenge, solution)),
    );

    expect(decoded).toEqual({ challenge, solution });
  });
});
