import { render, screen } from '@testing-library/react';
import type { PixelLayout } from 'lib/pixel';
import { describe, expect, it } from 'vitest';

import { PixelGrid } from './PixelGrid';

const LAYOUT: PixelLayout = {
  cells: [
    { left: 1, top: 1, size: 2, color: 'var(--color-letter-1)' },
    { left: 5, top: 1, size: 2, color: 'var(--color-letter-1)' },
    { left: 9, top: 1, size: 2, color: 'var(--color-letter-2)' },
  ],
  width: 12,
  height: 4,
};

describe('PixelGrid', () => {
  it('draws a rect per cell, grouped by colour, in a sized svg', () => {
    render(<PixelGrid layout={LAYOUT} />);
    const root = screen.getByTestId('pixel-grid');
    const svg = root.querySelector('svg');

    expect(root.querySelectorAll('rect')).toHaveLength(3);
    expect(root.querySelectorAll('g')).toHaveLength(2);
    expect(svg).toHaveAttribute('viewBox', '0 0 12 4');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes the label as text when labelled', () => {
    render(<PixelGrid layout={LAYOUT} label="Svanda" testId="labelled" />);
    const root = screen.getByTestId('labelled');

    expect(root).not.toHaveAttribute('aria-hidden');
    expect(root).toHaveTextContent('Svanda');
  });

  it('hides itself from assistive technology when decorative', () => {
    render(<PixelGrid layout={LAYOUT} />);
    const root = screen.getByTestId('pixel-grid');

    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveTextContent('');
  });
});
