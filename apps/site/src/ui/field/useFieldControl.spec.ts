import { describe, expect, it } from 'vitest';

import { joinIds } from './useFieldControl';

describe('joinIds', () => {
  it('joins the present ids with spaces', () => {
    expect(joinIds('a', undefined, false, 'b')).toBe('a b');
  });

  it('is undefined when no id is present', () => {
    expect(joinIds(undefined, false)).toBeUndefined();
  });
});
