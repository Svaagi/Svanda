import { render, screen } from '@testing-library/react';
import { pixelHead, pixelWord } from 'lib/pixel';
import { describe, expect, it } from 'vitest';

import { PixelText } from './PixelText';

const countRects = (testId: string) =>
  screen.getByTestId(testId).querySelectorAll('rect').length;

describe('PixelText', () => {
  it('draws one rect per filled cell and keeps the text for screen readers', () => {
    render(<PixelText text="Karaoke" cellSize={6} />);
    const root = screen.getByTestId('pixel-text');

    expect(countRects('pixel-text')).toBe(
      pixelWord('KARAOKE', 6, []).cells.length,
    );
    expect(root).toHaveTextContent('Karaoke');
    expect(root).not.toHaveAttribute('aria-hidden');
    expect(root.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(root.querySelector('svg')).toHaveAttribute('width', String(34 * 6));
  });

  it('wraps a heading and falls back to narrow letters', () => {
    render(
      <PixelText
        text="POBOČKY & AKCE"
        cellSize={4}
        maxCols={30}
        testId="venues-heading"
      />,
    );
    const svg = screen.getByTestId('venues-heading').querySelector('svg');

    expect(countRects('venues-heading')).toBe(
      pixelHead('POBOČKY & AKCE', 4, 30, []).cells.length,
    );
    expect(svg).toHaveAttribute('width', String(27 * 4));
    expect(svg).toHaveAttribute('height', String(12 * 4));
    expect(screen.getByTestId('venues-heading')).toHaveTextContent(
      'POBOČKY & AKCE',
    );
  });

  it('groups cells by colour token', () => {
    render(
      <PixelText
        text="II"
        cellSize={4}
        colors={['var(--color-letter-1)', 'var(--color-letter-2)']}
      />,
    );
    const groups = screen.getByTestId('pixel-text').querySelectorAll('g');

    expect(groups).toHaveLength(2);
    expect(groups[1]?.style.getPropertyValue('--pixel-fill')).toBe(
      'var(--color-letter-2)',
    );
  });
});
