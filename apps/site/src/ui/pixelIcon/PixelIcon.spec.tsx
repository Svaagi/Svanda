import { render, screen } from '@testing-library/react';
import { MOON, SUN } from 'lib/pixel';
import { countFilledPixels } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { PixelIcon } from './PixelIcon';

describe('PixelIcon', () => {
  it.each([
    ['sun', SUN],
    ['moon', MOON],
  ] as const)('draws the %s as a decorative 15px icon', (name, bitmap) => {
    render(<PixelIcon name={name} />);
    const root = screen.getByTestId('pixel-icon');

    expect(root.querySelectorAll('rect')).toHaveLength(
      countFilledPixels(bitmap),
    );
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root.querySelector('svg')).toHaveAttribute('width', '15');
  });
});
