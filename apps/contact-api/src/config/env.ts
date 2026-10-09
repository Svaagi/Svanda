import { z } from 'zod';

const MIN_HMAC_KEY_LENGTH = 32;
const MAX_PORT = 65_535;

const requiredText = z.string().trim().min(1);

// CORS compares exact origins, so each entry is reduced to scheme, host and port; an entry
// with a path, query or fragment is a typo, not an origin.
const origin = z.url().transform((value, context) => {
  const url = new URL(value);

  if (url.pathname !== '/' || url.search || url.hash || url.origin === 'null') {
    context.addIssue({ code: 'custom', message: 'Expected a bare origin' });

    return z.NEVER;
  }

  return url.origin;
});

const originList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(origin));

const envSchema = z.object({
  SMTP_HOST: requiredText,
  SMTP_PORT: z.coerce.number().int().min(1).max(MAX_PORT),
  SMTP_USER: requiredText,
  SMTP_PASS: requiredText,
  MAIL_FROM: z.email(),
  MAIL_TO: z.email(),
  ALTCHA_HMAC_KEY: z.string().min(MIN_HMAC_KEY_LENGTH),
  ALLOWED_ORIGINS: originList,
});

export type Env = z.infer<typeof envSchema>;

// Fails fast at startup. The message names the broken keys only, never their values (secrets).
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const keys = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
    ];

    throw new Error(`Invalid contact-api environment: ${keys.join(', ')}`);
  }

  return result.data;
}
