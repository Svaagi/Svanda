import type { Challenge, Solution } from 'altcha-lib';
import { z } from 'zod';

// Loose objects keep every challenge parameter as sent: the signature covers all of them.
const altchaPayloadSchema = z.object({
  challenge: z.looseObject({
    parameters: z.looseObject({
      algorithm: z.string(),
      nonce: z.string(),
      salt: z.string(),
      cost: z.number(),
      keyLength: z.number(),
      keyPrefix: z.string(),
      keySignature: z.string().optional(),
      memoryCost: z.number().optional(),
      parallelism: z.number().optional(),
      expiresAt: z.number().optional(),
      data: z
        .record(
          z.string(),
          z.union([z.string(), z.number(), z.boolean(), z.null()]),
        )
        .optional(),
    }),
    signature: z.string().optional(),
  }),
  solution: z.looseObject({
    counter: z.number(),
    derivedKey: z.string(),
    time: z.number().optional(),
  }),
});

export type AltchaPayload = {
  challenge: Challenge;
  solution: Solution;
};

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// The ALTCHA widget submits its result as base64 encoded JSON.
export function decodeAltchaPayload(encoded: string): AltchaPayload | null {
  const result = altchaPayloadSchema.safeParse(
    parseJson(Buffer.from(encoded, 'base64').toString('utf8')),
  );

  return result.success ? result.data : null;
}
