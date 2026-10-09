import { afterEach, describe, expect, it } from 'vitest';

import { readCssVar, resolveCssValue } from './cssVar';

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

describe('resolveCssValue', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('reads a token reference from the element', () => {
    document.documentElement.style.setProperty('--test-blob', '#3ee6ff');

    expect(resolveCssValue(document.documentElement, 'var(--test-blob)')).toBe(
      '#3ee6ff',
    );
  });

  it('passes a plain value through', () => {
    expect(resolveCssValue(document.documentElement, ' #ff4fd8 ')).toBe(
      '#ff4fd8',
    );
  });
});
