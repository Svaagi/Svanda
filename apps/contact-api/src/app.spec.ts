import { describe, expect, it } from 'vitest';

import { createApp } from './app.js';

const HTTP_OK = 200;

describe('createApp', () => {
  it('answers GET /health with ok', async () => {
    const response = await createApp().request('/health');

    expect(response.status).toBe(HTTP_OK);
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});
