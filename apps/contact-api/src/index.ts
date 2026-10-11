import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { pino } from 'pino';

import { createApp } from './app.js';
import { createCaptcha } from './captcha/index.js';
import { parseEnv } from './config/index.js';
import {
  CAPTCHA,
  CHALLENGE_RATE_LIMIT,
  DEFAULT_PORT,
  SUBMIT_RATE_LIMIT,
} from './constants/index.js';
import { createSmtpTransport } from './mail/index.js';
import {
  createTokenBucketLimiter,
  resolveClientIp,
} from './rateLimit/index.js';

const env = parseEnv(process.env);
const now = () => Date.now();

const app = createApp({
  captcha: createCaptcha({ ...CAPTCHA, hmacKey: env.ALTCHA_HMAC_KEY, now }),
  submitRateLimiter: createTokenBucketLimiter({ ...SUBMIT_RATE_LIMIT, now }),
  challengeRateLimiter: createTokenBucketLimiter({
    ...CHALLENGE_RATE_LIMIT,
    now,
  }),
  getClientIp: (context) =>
    resolveClientIp(
      context.req.header('x-forwarded-for'),
      getConnInfo(context).remote.address,
    ),
  mailTransport: createSmtpTransport(env),
  mailAddresses: { from: env.MAIL_FROM, to: env.MAIL_TO },
  logger: pino(),
  now,
  allowedOrigins: env.ALLOWED_ORIGINS,
});

serve({ fetch: app.fetch, port: DEFAULT_PORT });
