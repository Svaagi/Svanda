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

  it.each(['left', 'right'] as const)(
    'turns the %s chevron sideways, three cells wide and five tall',
    (direction) => {
      render(<PixelChevron direction={direction} cellSize={10} />);
      const root = screen.getByTestId('pixel-chevron');
      const svg = root.querySelector('svg');

      expect(root.querySelectorAll('rect')).toHaveLength(5);
      expect(svg).toHaveAttribute('width', '30');
      expect(svg).toHaveAttribute('height', '50');
    },
  );

  it('points the tip left or right', () => {
    render(<PixelChevron direction="left" cellSize={10} testId="left" />);
    render(<PixelChevron direction="right" cellSize={10} testId="right" />);
    const tipLeft = (testId: string) =>
      screen
        .getByTestId(testId)
        .querySelector('rect[y="21"]')
        ?.getAttribute('x');

    expect(tipLeft('left')).toBe('1');
    expect(tipLeft('right')).toBe('21');
  });
});
