import { describe, expect, it } from 'vitest';

import { parseEnv } from './env.js';

const validSource = {
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '465',
  SMTP_USER: 'mailer@example.com',
  SMTP_PASS: 'not-a-real-password',
  MAIL_FROM: 'web@example.com',
  MAIL_TO: 'business@example.com',
  ALTCHA_HMAC_KEY: 'k'.repeat(32),
  ALLOWED_ORIGINS: 'https://svanda.fun, http://localhost:5174',
};

describe('parseEnv', () => {
  it('parses a valid environment', () => {
    const env = parseEnv(validSource);

    expect(env.SMTP_PORT).toBe(465);
    expect(env.ALLOWED_ORIGINS).toEqual([
      'https://svanda.fun',
      'http://localhost:5174',
    ]);
  });

  it('reduces origins to scheme, host and port', () => {
    expect(
      parseEnv({
        ...validSource,
        ALLOWED_ORIGINS: 'HTTPS://Svanda.fun/, https://svanda.fun:443',
      }).ALLOWED_ORIGINS,
    ).toEqual(['https://svanda.fun', 'https://svanda.fun']);
  });

  it('allows no extra origins', () => {
    expect(
      parseEnv({ ...validSource, ALLOWED_ORIGINS: undefined }).ALLOWED_ORIGINS,
    ).toEqual([]);
  });

  it.each([
    ['SMTP_HOST', { SMTP_HOST: '' }],
    ['SMTP_PORT', { SMTP_PORT: 'abc' }],
    ['SMTP_PORT', { SMTP_PORT: '70000' }],
    ['SMTP_PASS', { SMTP_PASS: undefined }],
    ['MAIL_FROM', { MAIL_FROM: 'nope' }],
    ['MAIL_TO', { MAIL_TO: undefined }],
    ['ALTCHA_HMAC_KEY', { ALTCHA_HMAC_KEY: 'short' }],
    ['ALLOWED_ORIGINS', { ALLOWED_ORIGINS: 'not a url' }],
    ['ALLOWED_ORIGINS', { ALLOWED_ORIGINS: 'https://svanda.fun/path' }],
    ['ALLOWED_ORIGINS', { ALLOWED_ORIGINS: 'https://svanda.fun?x=1' }],
    ['ALLOWED_ORIGINS', { ALLOWED_ORIGINS: 'mailto:a@example.com' }],
  ])('rejects an invalid %s', (key, override) => {
    expect(() => parseEnv({ ...validSource, ...override })).toThrow(key);
  });

  it('never puts secret values in the error', () => {
    let message = '';

    try {
      parseEnv({ ...validSource, ALTCHA_HMAC_KEY: 'leaky-secret' });
    } catch (error) {
      message = error instanceof Error ? error.message : '';
    }

    expect(message).toContain('ALTCHA_HMAC_KEY');
    expect(message).not.toContain('leaky-secret');
  });
});
