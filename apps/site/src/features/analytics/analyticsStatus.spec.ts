import { describe, expect, it } from 'vitest';

import { analyticsStatusFor } from './analyticsStatus';

describe('analyticsStatusFor', () => {
  it('waits until the consent manager has read the choice', () => {
    expect(analyticsStatusFor([])).toBe('pending');
  });

  it('follows the analytics category', () => {
    expect(analyticsStatusFor(['necessary', 'analytics'])).toBe('on');
    expect(analyticsStatusFor(['necessary'])).toBe('off');
    expect(analyticsStatusFor(['necessary', 'marketing'])).toBe('off');
  });
});
