import { z } from 'zod';

// An ALTCHA challenge as the API issues it. Loose objects keep every parameter as sent: the
// HMAC signature covers all of them, so dropping an unknown one would break verification.
export const altchaChallengeSchema = z.looseObject({
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
});

export type AltchaChallenge = z.infer<typeof altchaChallengeSchema>;
