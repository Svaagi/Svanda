import { describe, expect, it } from 'vitest';

import { frameKeyAction, tabKeyIndex, wrapIndex } from './venueKeys';

describe('frameKeyAction', () => {
  it('maps left and right to photos and up and down to venues', () => {
    expect(frameKeyAction('ArrowLeft')).toEqual({ target: 'photo', step: -1 });
    expect(frameKeyAction('ArrowRight')).toEqual({ target: 'photo', step: 1 });
    expect(frameKeyAction('ArrowUp')).toEqual({ target: 'venue', step: -1 });
    expect(frameKeyAction('ArrowDown')).toEqual({ target: 'venue', step: 1 });
  });

  it('leaves other keys alone', () => {
    ['Enter', ' ', 'Home', 'PageDown', 'a'].forEach((key) => {
      expect(frameKeyAction(key)).toBeNull();
    });
  });
});

describe('tabKeyIndex', () => {
  it('moves through the tabs with left and right, wrapping at the ends', () => {
    expect(tabKeyIndex('ArrowRight', 2, 6)).toBe(3);
    expect(tabKeyIndex('ArrowLeft', 2, 6)).toBe(1);
    expect(tabKeyIndex('ArrowRight', 5, 6)).toBe(0);
    expect(tabKeyIndex('ArrowLeft', 0, 6)).toBe(5);
  });

  it('jumps to the first and last tab with Home and End', () => {
    expect(tabKeyIndex('Home', 3, 6)).toBe(0);
    expect(tabKeyIndex('End', 3, 6)).toBe(5);
  });

  it('leaves up, down and other keys to the page', () => {
    ['ArrowUp', 'ArrowDown', 'Enter', 'PageDown'].forEach((key) => {
      expect(tabKeyIndex(key, 3, 6)).toBeNull();
    });
  });
});

describe('wrapIndex', () => {
  it('wraps indexes past either end', () => {
    expect(wrapIndex(-1, 6)).toBe(5);
    expect(wrapIndex(6, 6)).toBe(0);
    expect(wrapIndex(13, 6)).toBe(1);
  });
});
