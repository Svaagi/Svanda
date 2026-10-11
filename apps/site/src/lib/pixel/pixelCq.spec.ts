import { describe, expect, it } from 'vitest';

import { pixelCq } from './pixelCq';

describe('pixelCq', () => {
  it('lays out cells in container-query units', () => {
    const layout = pixelCq('I', 1.5, ['a']);

    expect(layout.width).toBe('4.5cqw');
    expect(layout.height).toBe('7.5cqw');
    expect(layout.cells[0]).toEqual({
      left: '0cqw',
      top: '0cqw',
      size: '1.26cqw',
      color: 'a',
    });
  });

  it('rounds to three decimals', () => {
    expect(pixelCq('A', 1 / 3, ['a']).width).toBe('1.333cqw');
  });
});
