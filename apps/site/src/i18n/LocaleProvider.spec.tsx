import { screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

function ContactLabel() {
  const { t } = useTranslation();

  return <span data-testid="contact-label">{t('nav.contact')}</span>;
}

describe('LocaleProvider', () => {
  it.each([
    ['/', 'Kontakt'],
    ['/en', 'Contact'],
    ['/sk', 'Kontakt'],
  ])('renders the copy of the locale in %s', (path, expected) => {
    renderAtPath(<ContactLabel />, path);

    expect(screen.getByTestId('contact-label')).toHaveTextContent(expected);
  });
});
