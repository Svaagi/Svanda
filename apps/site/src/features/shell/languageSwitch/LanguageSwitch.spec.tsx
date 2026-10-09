import { fireEvent, screen } from '@testing-library/react';
import { LOCALE_STORAGE_KEY } from 'constants/locales';
import { getCurrentLocation, renderAtPath } from 'utils/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { LanguageSwitch } from './LanguageSwitch';

const option = (locale: string) =>
  screen.getByTestId(`language-switch-${locale}`);

describe('LanguageSwitch', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.location.hash = '';
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

  it('switches locale, keeps the section hash and remembers the choice', () => {
    window.location.hash = '#venues';
    renderAtPath(<LanguageSwitch />, '/');

    fireEvent.click(option('sk'));

    expect(getCurrentLocation()).toHaveTextContent('/sk#venues');
    expect(option('sk')).toHaveAttribute('aria-current', 'page');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('sk');
  });

  it('remembers choosing the active locale without navigating', () => {
    renderAtPath(<LanguageSwitch />, '/');

    fireEvent.click(option('cs'));

    expect(getCurrentLocation()).toHaveTextContent(/^\/$/);
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('cs');
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
