import { describe, expect, it } from 'vitest';

import { resolveClientIp } from './clientIp.js';

describe('resolveClientIp', () => {
  it('takes the address the proxy appended, not the spoofable first entry', () => {
    expect(resolveClientIp('1.1.1.1, 203.0.113.7', '10.0.0.2')).toBe(
      '203.0.113.7',
    );
  });

  it('falls back to the socket address without a proxy header', () => {
    expect(resolveClientIp(undefined, '10.0.0.2')).toBe('10.0.0.2');
    expect(resolveClientIp(' ', '10.0.0.2')).toBe('10.0.0.2');
  });

  it('groups clients with no address under one key', () => {
    expect(resolveClientIp(undefined, undefined)).toBe('unknown');
  });
});
