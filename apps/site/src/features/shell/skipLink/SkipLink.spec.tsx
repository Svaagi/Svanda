import { screen } from '@testing-library/react';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('jumps to the main content', () => {
    renderAtPath(<SkipLink />, '/en');
    const skipLink = screen.getByTestId('skip-link');

    expect(skipLink).toHaveAttribute('href', '#main');
    expect(skipLink).toHaveTextContent('Skip to content');
  });
});
