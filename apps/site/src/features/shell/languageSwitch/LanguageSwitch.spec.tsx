import { fireEvent, screen } from '@testing-library/react';
import { LOCALE_STORAGE_KEY } from 'constants/locales';
import { track } from 'lib/analytics';
import { getCurrentLocation, renderAtPath } from 'utils/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LanguageSwitch } from './LanguageSwitch';

vi.mock('lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lib/analytics')>()),
  track: vi.fn(),
}));

const option = (locale: string) =>
  screen.getByTestId(`language-switch-${locale}`);

describe('LanguageSwitch', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.location.hash = '';
    vi.mocked(track).mockClear();
  });

  it('links every locale to its home path and marks the active one', () => {
    renderAtPath(<LanguageSwitch />, '/en');

    expect(screen.getByTestId('language-switch')).toHaveAccessibleName(
      'Language',
    );
    expect(option('cs')).toHaveAttribute('href', '/');
    expect(option('en')).toHaveAttribute('href', '/en');
    expect(option('sk')).toHaveAttribute('href', '/sk');
    expect(option('en')).toHaveAttribute('aria-current', 'page');
    expect(option('cs')).not.toHaveAttribute('aria-current');
    expect(option('sk')).toHaveTextContent('SK');
    expect(option('sk')).toHaveAttribute('lang', 'sk');
  });

  it('links the same page in every locale when given its paths', () => {
    const paths = { cs: '/stranka', en: '/en/page', sk: '/sk/stranka' };
    renderAtPath(<LanguageSwitch paths={paths} />, '/en/page');

    expect(option('cs')).toHaveAttribute('href', '/stranka');
    expect(option('sk')).toHaveAttribute('href', '/sk/stranka');
    expect(option('en')).toHaveAttribute('aria-current', 'page');

    fireEvent.click(option('sk'));

    expect(getCurrentLocation()).toHaveTextContent(/^\/sk\/stranka$/);
  });

  it('switches locale, keeps the section hash and remembers the choice', () => {
    window.location.hash = '#venues';
    renderAtPath(<LanguageSwitch />, '/');

    fireEvent.click(option('sk'));

    expect(getCurrentLocation()).toHaveTextContent('/sk#venues');
    expect(option('sk')).toHaveAttribute('aria-current', 'page');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('sk');
    expect(track).toHaveBeenCalledExactlyOnceWith('language_change', {
      from: 'cs',
      to: 'sk',
    });
  });

  it('remembers choosing the active locale without navigating', () => {
    renderAtPath(<LanguageSwitch />, '/');

    fireEvent.click(option('cs'));

    expect(getCurrentLocation()).toHaveTextContent(/^\/$/);
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('cs');
    expect(track).not.toHaveBeenCalled();
  });

  it('leaves a modified click to the browser', () => {
    renderAtPath(<LanguageSwitch />, '/');
    // Stands in for the browser opening a new tab, which jsdom cannot do.
    window.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    });

    fireEvent.click(option('en'), { ctrlKey: true });

    expect(getCurrentLocation()).toHaveTextContent(/^\/$/);
  });
});
