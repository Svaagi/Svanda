import { describe, expect, it } from 'vitest';

import { formatHex, parseHexInput } from './hexInput';

describe('parseHexInput', () => {
  it('accepts six hex digits with or without the hash, in any case', () => {
    expect(parseHexInput('#B6FF4D')).toBe('#b6ff4d');
    expect(parseHexInput('b6ff4d')).toBe('#b6ff4d');
    expect(parseHexInput('  #3ee6ff ')).toBe('#3ee6ff');
  });

  it('rejects anything else', () => {
    [
      '',
      '#fff',
      'fff',
      '#b6ff4',
      '#b6ff4dd',
      '#gggggg',
      '##b6ff4d',
      'red',
    ].forEach((text) => expect(parseHexInput(text)).toBeNull());
  });
});

describe('formatHex', () => {
  it('shows colours in upper case', () => {
    expect(formatHex('#b6ff4d')).toBe('#B6FF4D');
  });
});
