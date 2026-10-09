import { screen } from '@testing-library/react';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the copy of the locale in the URL', () => {
    renderAtPath(<HomePage />, '/en');

    expect(screen.getByTestId('home-page')).toHaveAttribute(
      'data-locale',
      'en',
    );
    expect(screen.getByTestId('home-page-title')).toHaveTextContent(
      'Built from scratch.',
    );
    expect(screen.getByTestId('language-switch')).toBeInTheDocument();
  });
});
