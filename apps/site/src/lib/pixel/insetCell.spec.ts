import { describe, expect, it, vi } from 'vitest';

import { fillInsetCell } from './insetCell';

describe('fillInsetCell', () => {
  it('fills the cell shrunk by the inset on every side', () => {
    const fillRect = vi.fn();
    const context = { fillRect } as unknown as CanvasRenderingContext2D;

    fillInsetCell(context, 20, 30, 10, 1);

    expect(fillRect).toHaveBeenCalledWith(21, 31, 8, 8);
  });
});
