import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the placeholder for the locale in the URL', () => {
    render(
      <MemoryRouter initialEntries={['/en']}>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('home-page')).toHaveAttribute(
      'data-locale',
      'en',
    );
  });
});
