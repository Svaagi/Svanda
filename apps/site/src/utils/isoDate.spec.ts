import { describe, expect, it } from 'vitest';

import { formatIsoDate } from './isoDate';

describe('formatIsoDate', () => {
  it('formats an ISO date in each locale', () => {
    expect(formatIsoDate('2026-09-20', 'cs')).toBe('20. 9. 2026');
    expect(formatIsoDate('2026-09-20', 'sk')).toBe('20. 9. 2026');
    expect(formatIsoDate('2026-09-20', 'en')).toBe('Sep 20, 2026');
  });

  it('keeps the calendar day whatever the time zone', () => {
    expect(formatIsoDate('2026-01-01', 'en')).toBe('Jan 1, 2026');
    expect(formatIsoDate('2026-12-31', 'cs')).toBe('31. 12. 2026');
  });
});
