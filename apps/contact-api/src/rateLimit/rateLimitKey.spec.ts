import { describe, expect, it } from 'vitest';

import { toRateLimitKey } from './rateLimitKey.js';

describe('toRateLimitKey', () => {
  it('keeps an IPv4 address', () => {
    expect(toRateLimitKey('203.0.113.7')).toBe('203.0.113.7');
  });

  it('maps IPv4-mapped IPv6 to IPv4', () => {
    expect(toRateLimitKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
    expect(toRateLimitKey('::FFFF:203.0.113.7')).toBe('203.0.113.7');
  });

  it.each([
    ['2001:db8:1:2:3:4:5:6', '2001:db8:1:2::/64'],
    ['2001:0db8:0001:0002:ffff::1', '2001:db8:1:2::/64'],
    ['2001:db8::1', '2001:db8:0:0::/64'],
    ['::1', '0:0:0:0::/64'],
    ['fe80::1%eth0', 'fe80:0:0:0::/64'],
  ])('groups %s into its /64', (ip, key) => {
    expect(toRateLimitKey(ip)).toBe(key);
  });

  it('gives every address of one /64 the same key', () => {
    expect(toRateLimitKey('2001:db8:1:2::a')).toBe(
      toRateLimitKey('2001:db8:1:2:ffff:ffff:ffff:ffff'),
    );
  });

  it('passes a non address through', () => {
    expect(toRateLimitKey('unknown')).toBe('unknown');
  });
});
