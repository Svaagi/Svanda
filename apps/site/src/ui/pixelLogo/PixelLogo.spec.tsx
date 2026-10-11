import { screen } from '@testing-library/react';
import { LETTER_COLORS } from 'constants/pixel';
import { BITMAP } from 'lib/pixel';
import { countFilledPixels, renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { PixelLogo } from './PixelLogo';

const FILLED_MODULES = countFilledPixels(BITMAP);

describe('PixelLogo', () => {
  it('draws the 36 x 5 wordmark with one colour per letter', () => {
    renderAtPath(<PixelLogo />, '/en');
    const root = screen.getByTestId('pixel-logo');
    const svg = root.querySelector('svg');

    expect(root.querySelectorAll('rect')).toHaveLength(FILLED_MODULES);
    expect(root.querySelectorAll('g')).toHaveLength(LETTER_COLORS.length);
    expect(svg).toHaveAttribute('width', '180');
    expect(svg).toHaveAttribute('height', '25');
    expect(root).toHaveTextContent('SVANDA');
  });

  it('scales with the cell size', () => {
    renderAtPath(<PixelLogo cellSize={4} testId="nav-logo" />, '/');

    expect(screen.getByTestId('nav-logo').querySelector('svg')).toHaveAttribute(
      'width',
      '144',
    );
  });
});
