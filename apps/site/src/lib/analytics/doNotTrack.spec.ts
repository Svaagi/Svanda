import { describe, expect, it } from 'vitest';

import { isDoNotTrack } from './doNotTrack';

describe('isDoNotTrack', () => {
  it('is on for the values browsers send', () => {
    expect(isDoNotTrack({ doNotTrack: '1' })).toBe(true);
    expect(isDoNotTrack({ doNotTrack: 'yes' })).toBe(true);
  });

  it('is off when unset or declined', () => {
    expect(isDoNotTrack({ doNotTrack: null })).toBe(false);
    expect(isDoNotTrack({ doNotTrack: '0' })).toBe(false);
    expect(isDoNotTrack({ doNotTrack: 'unspecified' })).toBe(false);
  });
});
