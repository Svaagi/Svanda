import { z } from 'zod';

import { jukeboxConfigSchema } from '../jukeboxConfig/jukeboxConfigSchema.js';

export const CONTACT_LOCALES = ['cs', 'en', 'sk'] as const;

export type ContactLocale = (typeof CONTACT_LOCALES)[number];

export const CONTACT_LIMITS = {
  name: 100,
  venue: 160,
  email: 254,
  message: 4000,
  honeypot: 200,
  altcha: 4096,
} as const;

// A person needs a few seconds to fill the form; a quicker submit is a script. The API measures
// it from when it issued the ALTCHA challenge, and the site waits it out before submitting.
export const CONTACT_MIN_FILL_TIME_MS = 3000;

// Name and venue end up in mail headers (the subject), so they never carry control characters.
const NO_CONTROL_CHARS_PATTERN = /^[^\p{Cc}]*$/u;

const singleLineText = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).regex(NO_CONTROL_CHARS_PATTERN);

// What the visitor sends from the contact form. `honeypot` is a field hidden from people, so
// any value means a bot; `altcha` is the solved proof of work payload, which also carries the
// signed time its challenge was issued (the server's clock, never the client's).
export const contactRequestSchema = z.strictObject({
  name: singleLineText(CONTACT_LIMITS.name),
  venue: singleLineText(CONTACT_LIMITS.venue),
  email: z.email().max(CONTACT_LIMITS.email),
  message: z.string().trim().max(CONTACT_LIMITS.message).optional(),
  locale: z.enum(CONTACT_LOCALES),
  config: jukeboxConfigSchema.optional(),
  honeypot: z.string().max(CONTACT_LIMITS.honeypot),
  altcha: z.string().min(1).max(CONTACT_LIMITS.altcha),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
