import { describe, expect, it } from 'vitest';

import { formatRangeNumber } from './rangeFormat';

describe('formatRangeNumber', () => {
  it('shows a share as whole percent', () => {
    expect(formatRangeNumber(0.425, 'percent', 'en')).toBe('43');
    expect(formatRangeNumber(0.62, 'percent', 'cs')).toBe('62');
  });

  it('shows a multiplier with one decimal in the locale', () => {
    expect(formatRangeNumber(1, 'multiplier', 'en')).toBe('1.0');
    expect(formatRangeNumber(1.5, 'multiplier', 'cs')).toBe('1,5');
    expect(formatRangeNumber(0.2, 'multiplier', 'sk')).toBe('0,2');
  });

  it('shows pixels as a whole number', () => {
    expect(formatRangeNumber(12, 'px', 'en')).toBe('12');
  });
});
