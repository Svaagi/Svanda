import { serve } from '@hono/node-server';

import { createApp } from './app.js';
import { DEFAULT_PORT } from './config/index.js';

serve({ fetch: createApp().fetch, port: DEFAULT_PORT });
