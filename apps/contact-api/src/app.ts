import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';

import type { AppEnv } from './appEnv.js';
import { respondWithError } from './errors/index.js';
import { requestLogger } from './logging/index.js';
import {
  type ContactRouteDeps,
  createContactRoute,
  healthRoute,
} from './routes/index.js';

export type AppDeps = ContactRouteDeps & {
  allowedOrigins: string[];
};

export function createApp(deps: AppDeps) {
  return new Hono<AppEnv>()
    .use(requestId())
    .use(requestLogger(deps.logger, deps.now))
    .use(
      '/api/*',
      cors({
        origin: deps.allowedOrigins,
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type'],
      }),
    )
    .route('/health', healthRoute)
    .route('/api/contact', createContactRoute(deps))
    .onError((error, context) => {
      // Only the error's name: its message or stack could quote request data.
      deps.logger.error(
        { requestId: context.get('requestId'), errorName: error.name },
        'unhandled error',
      );

      return respondWithError(context, 'contact.internal_error');
    });
}
