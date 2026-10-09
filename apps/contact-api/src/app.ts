import { Hono } from 'hono';

import { healthRoute } from './routes/index.js';

export function createApp() {
  return new Hono().route('/health', healthRoute);
}
