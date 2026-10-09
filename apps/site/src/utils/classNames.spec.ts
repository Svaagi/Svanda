import { describe, expect, it } from 'vitest';

import { classNames } from './classNames';

describe('classNames', () => {
  it('joins the names that are set', () => {
    expect(classNames('a', undefined, 'b', false, null, '', 'c')).toBe('a b c');
  });

  it('is empty when nothing is set', () => {
    expect(classNames(undefined, false)).toBe('');
  });
});
