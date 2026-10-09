import { fireEvent, screen } from '@testing-library/react';
import { LEGAL_LINKS } from 'constants/legal';
import { SOCIAL_LINKS } from 'constants/social';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it, vi } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
  it('shows the copyright line', () => {
    renderAtPath(<Footer />, '/en');

    expect(screen.getByTestId('footer').tagName).toBe('FOOTER');
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent(
      '© 2026 SVANDA · Karaoke jukebox',
    );
  });

  it('opens the social profiles in a new tab without an opener', () => {
    renderAtPath(<Footer />, '/');

    SOCIAL_LINKS.forEach(({ id, href }) => {
      const socialLink = screen.getByTestId(`footer-${id}`);
      expect(socialLink).toHaveAttribute('href', href);
      expect(socialLink).toHaveAttribute('target', '_blank');
      expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it.each([
    [
      '/',
      'cs',
      {
        imprint: 'Právní informace',
        privacy: 'Ochrana osobních údajů',
        cookies: 'Zásady cookies',
      },
    ],
    [
      '/en',
      'en',
      {
        imprint: 'Legal information',
        privacy: 'Privacy policy',
        cookies: 'Cookie policy',
      },
    ],
    [
      '/sk',
      'sk',
      {
        imprint: 'Právne informácie',
        privacy: 'Ochrana osobných údajov',
        cookies: 'Zásady cookies',
      },
    ],
  ] as const)(
    'links the legal pages of the %s locale',
    (path, locale, labels) => {
      renderAtPath(<Footer />, path);

      LEGAL_LINKS.forEach(({ id, paths }) => {
        const legalLink = screen.getByTestId(`footer-${id}`);
        expect(legalLink).toHaveAttribute('href', paths[locale]);
        expect(legalLink).toHaveTextContent(labels[id]);
      });
    },
  );

  it('leaves out the cookie settings button until it is wired', () => {
    renderAtPath(<Footer />, '/en');

    expect(
      screen.queryByTestId('footer-cookie-settings'),
    ).not.toBeInTheDocument();
  });

  it('opens the cookie settings from its button', () => {
    const handleOpen = vi.fn();
    renderAtPath(<Footer onOpenCookieSettings={handleOpen} />, '/en');
    const button = screen.getByTestId('footer-cookie-settings');

    fireEvent.click(button);

    expect(button).toHaveAccessibleName('Cookie settings');
    expect(handleOpen).toHaveBeenCalledOnce();
  });
});
