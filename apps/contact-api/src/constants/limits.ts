import { CONTACT_MIN_FILL_TIME_MS } from '@svanda/shared';

export const DEFAULT_PORT = 8787;

export const BODY_LIMIT_BYTES = 32 * 1024;

// Measured on the server from when the ALTCHA challenge was issued.
export const MIN_FILL_TIME_MS = CONTACT_MIN_FILL_TIME_MS;

// Per client (IPv4 address or IPv6 /64): a burst of 5 submits, then one more every
// 12 minutes (5 per hour).
export const SUBMIT_RATE_LIMIT = {
  capacity: 5,
  refillIntervalMs: 12 * 60 * 1000,
  maxTrackedKeys: 10_000,
} as const;

// Challenges are cheap to issue but still cost an HMAC, and a page reload fetches a new one.
export const CHALLENGE_RATE_LIMIT = {
  capacity: 20,
  refillIntervalMs: 30 * 1000,
  maxTrackedKeys: 10_000,
} as const;

// PBKDF2 cost times the secret counter sets the proof of work: about 2M PBKDF2 rounds on
// average, roughly a second of single-threaded desktop work (the widget spreads it over
// workers). The library's example values take over 15 seconds, too slow for a phone.
export const CAPTCHA = {
  algorithm: 'PBKDF2/SHA-256',
  cost: 2000,
  counterMin: 500,
  counterMax: 1500,
  ttlMs: 10 * 60 * 1000,
  maxRememberedSolutions: 10_000,
} as const;

export const SMTPS_PORT = 465;
