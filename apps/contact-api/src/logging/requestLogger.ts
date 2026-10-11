import { createMiddleware } from 'hono/factory';
import type { Logger } from 'pino';

import type { AppEnv } from '../appEnv.js';

// One line per request with no personal data: no body, no headers, no query, no IP.
export const requestLogger = (logger: Logger, now: () => number) =>
  createMiddleware<AppEnv>(async (context, next) => {
    const startedAt = now();

    await next();

    logger.info(
      {
        requestId: context.get('requestId'),
        method: context.req.method,
        path: context.req.path,
        status: context.res.status,
        durationMs: now() - startedAt,
        errorCode: context.get('errorCode'),
      },
      'request',
    );
  });
