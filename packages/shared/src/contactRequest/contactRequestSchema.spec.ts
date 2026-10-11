import { describe, expect, it } from 'vitest';

import { JUKEBOX_CONFIG_DEFAULTS } from '../jukeboxConfig/jukeboxConfigDefaults.js';
import {
  CONTACT_LIMITS,
  contactRequestSchema,
} from './contactRequestSchema.js';

const validRequest = {
  name: 'Jana Novakova',
  venue: 'Bar U Lipy, Brno',
  email: 'jana@example.com',
  message: 'Hello',
  locale: 'cs',
  honeypot: '',
  altcha: 'payload',
};

describe('contactRequestSchema', () => {
  it('accepts a complete request with an attached configuration', () => {
    const result = contactRequestSchema.safeParse({
      ...validRequest,
      config: JUKEBOX_CONFIG_DEFAULTS,
    });

    expect(result.success).toBe(true);
  });

  it('accepts a request without message and configuration', () => {
    const { message: _message, ...withoutMessage } = validRequest;

    expect(contactRequestSchema.safeParse(withoutMessage).success).toBe(true);
  });

  it('trims the text fields', () => {
    const parsed = contactRequestSchema.parse({
      ...validRequest,
      name: '  Jana  ',
    });

    expect(parsed.name).toBe('Jana');
  });

  it.each([
    ['an unknown field', { extra: true }],
    ['an empty name', { name: '   ' }],
    ['a line break in the name', { name: 'Jana\nBcc: x@example.com' }],
    ['a line break in the venue', { venue: 'Bar\r\nBrno' }],
    ['a too long venue', { venue: 'x'.repeat(CONTACT_LIMITS.venue + 1) }],
    ['an invalid e-mail', { email: 'not-an-email' }],
    ['a too long message', { message: 'x'.repeat(CONTACT_LIMITS.message + 1) }],
    ['an unsupported locale', { locale: 'de' }],
    ['an invalid configuration', { config: { pixel: {} } }],
    ['a missing honeypot', { honeypot: undefined }],
    ['a client supplied start time', { startedAt: 1_700_000_000_000 }],
    ['an empty altcha payload', { altcha: '' }],
  ])('rejects %s', (_label, override) => {
    expect(
      contactRequestSchema.safeParse({ ...validRequest, ...override }).success,
    ).toBe(false);
  });
});
