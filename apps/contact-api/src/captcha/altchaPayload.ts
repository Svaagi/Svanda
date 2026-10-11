import { altchaChallengeSchema } from '@svanda/shared';
import type { Challenge, Solution } from 'altcha-lib';
import { z } from 'zod';

const altchaPayloadSchema = z.object({
  challenge: altchaChallengeSchema,
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
