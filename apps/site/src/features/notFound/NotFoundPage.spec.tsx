import { fireEvent, screen } from '@testing-library/react';
import { LOCALES } from 'constants/locales';
import { NOT_FOUND_PATHS } from 'constants/seo';
import { getCurrentLocation, renderAtPath } from 'utils/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it.each(LOCALES)('renders the %s page with a heading', (locale) => {
    renderAtPath(<NotFoundPage />, NOT_FOUND_PATHS[locale]);
    const page = screen.getByTestId('not-found-page');

    expect(page.tagName).toBe('MAIN');
    expect(page).toHaveAttribute('data-locale', locale);
    expect(screen.getByRole('heading', { level: 1 })).toBe(
      screen.getByTestId('not-found-page-title'),
    );
    expect(screen.getByTestId('not-found-page-code')).toHaveTextContent('404');
  });

  it('speaks the locale of an unknown path', () => {
    renderAtPath(<NotFoundPage />, '/en/no-such-page');

    expect(screen.getByTestId('not-found-page-title')).toHaveTextContent(
      'Page not found',
    );
  });

  it('leads back to the home page of the locale', () => {
    renderAtPath(<NotFoundPage />, '/sk/404');
    fireEvent.click(screen.getByTestId('not-found-page-home'));

    expect(getCurrentLocation()).toHaveTextContent('/sk');
  });
});
