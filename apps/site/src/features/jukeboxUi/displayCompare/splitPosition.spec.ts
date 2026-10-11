import { describe, expect, it } from 'vitest';

import { clampSplit, splitAfterKey, splitFromOffset } from './splitPosition';

const key = (name: string, shiftKey = false) => ({ key: name, shiftKey });

describe('clampSplit', () => {
  it('keeps the split on the screen', () => {
    expect(clampSplit(-10)).toBe(0);
    expect(clampSplit(42)).toBe(42);
    expect(clampSplit(130)).toBe(100);
  });
});

describe('splitFromOffset', () => {
  it('maps the pointer to a share of the width', () => {
    expect(splitFromOffset(135, 540)).toBe(25);
    expect(splitFromOffset(-20, 540)).toBe(0);
    expect(splitFromOffset(600, 540)).toBe(100);
  });

  it('has no split for an unmeasured surface', () => {
    expect(splitFromOffset(10, 0)).toBeNull();
  });
});

describe('splitAfterKey', () => {
  it('steps with the horizontal arrows, further with Shift', () => {
    expect(splitAfterKey(50, key('ArrowLeft'))).toBe(45);
    expect(splitAfterKey(50, key('ArrowRight'))).toBe(55);
    expect(splitAfterKey(50, key('ArrowRight', true))).toBe(70);
  });

  it('clamps at the edges and jumps there with Home and End', () => {
    expect(splitAfterKey(2, key('ArrowLeft'))).toBe(0);
    expect(splitAfterKey(98, key('ArrowRight', true))).toBe(100);
    expect(splitAfterKey(50, key('Home'))).toBe(0);
    expect(splitAfterKey(50, key('End'))).toBe(100);
  });

  it('leaves the paging keys to the stage', () => {
    expect(splitAfterKey(50, key('ArrowDown'))).toBeNull();
    expect(splitAfterKey(50, key('ArrowUp'))).toBeNull();
    expect(splitAfterKey(50, key('PageDown'))).toBeNull();
  });
});
