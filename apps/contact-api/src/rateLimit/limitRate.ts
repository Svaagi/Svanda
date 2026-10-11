import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

import type { AppEnv } from '../appEnv.js';
import { respondWithError } from '../errors/index.js';
import { toRateLimitKey } from './rateLimitKey.js';
import type { RateLimiter } from './tokenBucket.js';

export const limitRate = (
  limiter: RateLimiter,
  getClientIp: (context: Context) => string,
) =>
  createMiddleware<AppEnv>(async (context, next) => {
    const decision = limiter.take(toRateLimitKey(getClientIp(context)));

    if (!decision.isAllowed) {
      context.header('Retry-After', String(decision.retryAfterSeconds));

      return respondWithError(context, 'contact.rate_limited');
    }

    return next();
  });
