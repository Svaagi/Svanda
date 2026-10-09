import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PixelChevron } from './PixelChevron';

describe('PixelChevron', () => {
  it.each(['up', 'down'] as const)(
    'draws the %s chevron as five decorative squares',
    (direction) => {
      render(<PixelChevron direction={direction} />);
      const root = screen.getByTestId('pixel-chevron');
      const svg = root.querySelector('svg');

      expect(root.querySelectorAll('rect')).toHaveLength(5);
      expect(root).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('width', String(5 * 14));
      expect(svg).toHaveAttribute('height', String(3 * 14));
    },
  );

  it('points the tip up or down', () => {
    render(<PixelChevron direction="up" cellSize={10} testId="up" />);
    render(<PixelChevron direction="down" cellSize={10} testId="down" />);
    const tipTop = (testId: string) =>
      screen
        .getByTestId(testId)
        .querySelector('rect[x="21"]')
        ?.getAttribute('y');

    expect(tipTop('up')).toBe('1');
    expect(tipTop('down')).toBe('21');
  });
});
