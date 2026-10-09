import { pino } from 'pino';
import { vi } from 'vitest';

import { type AppDeps, createApp } from '../app.js';
import { createTokenBucketLimiter } from '../rateLimit/index.js';
import { createTestCaptcha } from './captchaTestUtils.js';
import { TEST_ADDRESSES } from './contactRequestFixture.js';

export const TEST_ORIGIN = 'https://svanda.fun';
export const TEST_RATE_LIMIT = 3;
export const TEST_CHALLENGE_RATE_LIMIT = 5;

const testLimiter = (capacity: number, now: () => number) =>
  createTokenBucketLimiter({
    capacity,
    refillIntervalMs: 60_000,
    maxTrackedKeys: 100,
    now,
  });

// The app with fakes: a mail transport that records instead of sending, an adjustable clock,
// a real limiter and captcha, and a logger whose lines the spec can inspect.
export function createTestApp(overrides: Partial<AppDeps> = {}) {
  const clock = { time: Date.now() };
  const now = () => clock.time;
  const logLines: string[] = [];
  const sendMail = vi.fn<(message: unknown) => Promise<unknown>>();
  sendMail.mockResolvedValue({});
  const captcha = createTestCaptcha(now);

  const app = createApp({
    captcha,
    submitRateLimiter: testLimiter(TEST_RATE_LIMIT, now),
    challengeRateLimiter: testLimiter(TEST_CHALLENGE_RATE_LIMIT, now),
    getClientIp: (context) => context.req.header('x-test-ip') ?? 'test-ip',
    mailTransport: { sendMail },
    mailAddresses: TEST_ADDRESSES,
    logger: pino({}, { write: (line: string) => logLines.push(line) }),
    now,
    allowedOrigins: [TEST_ORIGIN],
    ...overrides,
  });

  return { app, captcha, clock, logLines, sendMail };
}
