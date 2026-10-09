import { describe, expect, it } from 'vitest';

import { isRecord } from './isRecord.js';

describe('isRecord', () => {
  it('accepts plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ key: 1 })).toBe(true);
  });

  it.each([null, undefined, [], 'text', 1, true])('rejects %j', (value) => {
    expect(isRecord(value)).toBe(false);
  });
});
