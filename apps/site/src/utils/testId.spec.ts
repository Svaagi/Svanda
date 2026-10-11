import { describe, expect, it } from 'vitest';

import { childTestId } from './testId';

describe('childTestId', () => {
  it('prefixes the suffix with the parent test id', () => {
    expect(childTestId('contact-form', 'submit')).toBe('contact-form-submit');
  });

  it('keeps a compound suffix intact', () => {
    expect(childTestId('venue-card', 'photo-3')).toBe('venue-card-photo-3');
  });
});
