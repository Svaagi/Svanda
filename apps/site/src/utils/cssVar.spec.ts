import { afterEach, describe, expect, it } from 'vitest';

import { readCssVar } from './cssVar';

describe('readCssVar', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('reads a custom property trimmed', () => {
    document.documentElement.style.setProperty('--test-color', ' red ');

    expect(readCssVar(document.documentElement, '--test-color')).toBe('red');
  });

  it('returns an empty string for an unset property', () => {
    expect(readCssVar(document.documentElement, '--missing')).toBe('');
  });
});
