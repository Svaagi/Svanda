import type { MouseEvent } from 'react';
import { describe, expect, it } from 'vitest';

import { isPlainLeftClick } from './plainClick';

const click = (overrides: Partial<MouseEvent> = {}) =>
  ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  }) as MouseEvent;

describe('isPlainLeftClick', () => {
  it('accepts an unmodified primary click', () => {
    expect(isPlainLeftClick(click())).toBe(true);
  });

  it.each([
    { button: 1 },
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
  ])('rejects %o', (overrides) => {
    expect(isPlainLeftClick(click(overrides))).toBe(false);
  });
});
