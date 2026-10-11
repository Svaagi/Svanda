import { fireEvent, screen } from '@testing-library/react';
import { LEGAL_LINKS, LEGAL_PATHS } from 'constants/legal';
import { LEGAL_IDENTITY } from 'constants/legalIdentity';
import { LOCALES } from 'constants/locales';
import { getCurrentLocation, renderAtPath } from 'utils/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { LegalPage } from './LegalPage';

const PAGES = LEGAL_LINKS.flatMap(({ id, paths }) =>
  LOCALES.map((locale) => ({ id, locale, path: paths[locale] })),
);

describe('LegalPage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it.each(PAGES)(
    'renders the $locale $id page at $path',
    ({ id, locale, path }) => {
      renderAtPath(<LegalPage />, path);
      const page = screen.getByTestId('legal-page');

      expect(page.tagName).toBe('MAIN');
      expect(page).toHaveAttribute('data-page', id);
      expect(page).toHaveAttribute('data-locale', locale);
      expect(screen.getByRole('heading', { level: 1 })).toBe(
        screen.getByTestId('legal-page-content-title'),
      );
    },
  );

  it('shows the identity from the constants and the effective date', () => {
    renderAtPath(<LegalPage />, '/en/legal');

    expect(screen.getByTestId('legal-page-content')).toHaveTextContent(
      LEGAL_IDENTITY.ico,
    );
    expect(screen.getByTestId('legal-page-content')).toHaveTextContent(
      LEGAL_IDENTITY.seat,
    );
    expect(screen.getByTestId('legal-page-effective')).toHaveTextContent(
      'Effective from Oct 9, 2026',
    );
  });

  it('wraps the text in a skip link, a header home link and the footer', () => {
    renderAtPath(<LegalPage />, '/sk/zasady-cookies');
    const main = screen.getByRole('main');

    expect(screen.getByTestId('skip-link')).toHaveAttribute(
      'href',
      `#${main.id}`,
    );
    expect(screen.getByTestId('legal-header-home')).toHaveAttribute(
      'href',
      '/sk',
    );
    expect(screen.getByTestId('legal-header-home')).toHaveAccessibleName(
      'SVANDA, úvodná stránka',
    );
    expect(screen.getByTestId('legal-header-theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('footer-cookies')).toHaveAttribute(
      'href',
      '/sk/zasady-cookies',
    );
    expect(screen.getByTestId('footer-cookie-settings')).toBeInTheDocument();
  });

  it('switches language to the same legal page', () => {
    renderAtPath(<LegalPage />, '/ochrana-osobnich-udaju');

    LOCALES.forEach((locale) => {
      expect(
        screen.getByTestId(`legal-header-language-switch-${locale}`),
      ).toHaveAttribute('href', LEGAL_PATHS.privacy[locale]);
    });

    fireEvent.click(screen.getByTestId('legal-header-language-switch-en'));

    expect(getCurrentLocation()).toHaveTextContent(/^\/en\/privacy$/);
    expect(screen.getByTestId('legal-page')).toHaveAttribute(
      'data-locale',
      'en',
    );
  });
});
