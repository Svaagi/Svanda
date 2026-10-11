import { describe, expect, it } from 'vitest';

import {
  czkSymbol,
  formatCzk,
  formatDuration,
  songInitials,
} from './appFormat';

// Intl separates amount and currency with a no-break space.
const normalizeSpaces = (text: string) => text.replace(/\s/g, ' ');

describe('formatDuration', () => {
  it('writes minutes and two-digit seconds', () => {
    expect(formatDuration(355)).toBe('5:55');
    expect(formatDuration(42)).toBe('0:42');
    expect(formatDuration(185)).toBe('3:05');
  });

  it('clamps negative times to zero', () => {
    expect(formatDuration(-3)).toBe('0:00');
  });
});

describe('songInitials', () => {
  it('takes the first letters of the first two words', () => {
    expect(songInitials('Bon Jovi')).toBe('BJ');
    expect(songInitials('Queen')).toBe('Q');
    expect(songInitials('  the weeknd ')).toBe('TW');
    expect(songInitials('Earth Wind Fire')).toBe('EW');
  });
});

describe('formatCzk', () => {
  it('formats whole crowns in the locale', () => {
    expect(normalizeSpaces(formatCzk(120, 'cs'))).toBe('120 Kč');
    expect(normalizeSpaces(formatCzk(10, 'en'))).toBe('CZK 10');
    expect(normalizeSpaces(formatCzk(20, 'sk'))).toBe('20 CZK');
  });
});

describe('czkSymbol', () => {
  it('is the currency label the locale uses', () => {
    expect(czkSymbol('cs')).toBe('Kč');
    expect(czkSymbol('en')).toBe('CZK');
  });
});
