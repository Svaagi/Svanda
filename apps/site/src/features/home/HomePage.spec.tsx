import { screen } from '@testing-library/react';
import { INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE } from 'constants/intro';
import { STAGE_PAGE_IDS } from 'constants/stage';
import { renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  // jsdom has no canvas; the intro and the hero background have their own specs.
  beforeEach(() => {
    window.sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the copy of the locale in the URL', () => {
    renderAtPath(<HomePage />, '/en');

    expect(screen.getByTestId('home-page')).toHaveAttribute(
      'data-locale',
      'en',
    );
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'SVANDA, the karaoke jukebox',
      }),
    ).toBe(screen.getByTestId('home-page-title'));
    expect(screen.getByTestId('hero-overlay-cta')).toHaveTextContent(
      'EXPLORE SVANDA',
    );
    expect(screen.getByTestId('header-language-switch')).toBeInTheDocument();
  });

  it('wraps the page in a skip link, header, main landmark and footer', () => {
    renderAtPath(<HomePage />, '/en');
    const main = screen.getByRole('main');

    expect(screen.getByTestId('skip-link')).toHaveAttribute(
      'href',
      `#${main.id}`,
    );
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('puts five page layers on the stage and the contact section after it', () => {
    renderAtPath(<HomePage />, '/');

    expect(screen.getByTestId('stage-shell')).toBeInTheDocument();
    STAGE_PAGE_IDS.forEach((pageId) => {
      expect(screen.getByTestId(`page-layer-${pageId}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId('intro')).toBeInTheDocument();
    expect(screen.getByTestId('hero-background')).toBeInTheDocument();
    expect(screen.getByTestId('page-layer-top')).toContainElement(
      screen.getByTestId('hero-overlay'),
    );
    expect(screen.getByTestId('contact-section')).toHaveAttribute(
      'id',
      'contact',
    );
  });
});
