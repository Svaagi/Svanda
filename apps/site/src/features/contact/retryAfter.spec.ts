import { describe, expect, it } from 'vitest';

import { readRetryAfterSeconds } from './retryAfter';

const withRetryAfter = (value?: string) =>
  new Response(null, {
    headers: value === undefined ? {} : { 'Retry-After': value },
  });

describe('readRetryAfterSeconds', () => {
  it('reads whole seconds', () => {
    expect(readRetryAfterSeconds(withRetryAfter('600'))).toBe(600);
  });

  it.each([undefined, '0', '1.5', 'Wed, 21 Oct 2026 07:28:00 GMT'])(
    'ignores %s',
    (value) => {
      expect(readRetryAfterSeconds(withRetryAfter(value))).toBeUndefined();
    },
  );
});
