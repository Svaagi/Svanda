import { describe, expect, it } from 'vitest';

import { createTestApp } from './testing/createTestApp.js';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;

describe('createApp', () => {
  it('answers GET /health with ok', async () => {
    const response = await createTestApp().app.request('/health');

    expect(response.status).toBe(HTTP_OK);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('tags every response with a request id', async () => {
    const response = await createTestApp().app.request('/health');

    expect(response.headers.get('x-request-id')).toEqual(expect.any(String));
  });

  it('answers unknown routes with 404', async () => {
    const response = await createTestApp().app.request('/api/unknown');

    expect(response.status).toBe(HTTP_NOT_FOUND);
  });
});
