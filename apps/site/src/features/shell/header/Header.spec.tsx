import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import {
  NAV_ITEMS,
  NAV_ITEMS_LEFT,
  NAV_ITEMS_RIGHT,
  NAV_REVEAL_DELAY_OUTER,
} from 'constants/nav';
import { CONTACT_PAGE, JUKEBOX_PAGE, VENUES_PAGE } from 'constants/stage';
import { THEME_ATTRIBUTE } from 'constants/theme';
import { useStageStore } from 'features/stage';
import { createMatchMediaMock, renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Header } from './Header';

const PAGE_HEIGHT = 800;
const PAGE_WIDTH = 1280;
const scrollTo = vi.fn();

const link = (id: string) =>
  screen.getByTestId(new RegExp(`^header-items-(left|right)-link-${id}$`));
const menuButton = () => screen.getByTestId('header-menu-button');
const revealDelay = (element: HTMLElement) =>
  Number(element.style.getPropertyValue('--nav-reveal-delay'));
const itemDelay = (side: string, id: string) =>
  revealDelay(screen.getByTestId(`header-items-${side}-item-${id}`));

const openMenu = () => {
  const button = menuButton();
  button.focus();
  fireEvent.click(button);
  return button;
};

const waitForMenuClosed = () =>
  waitFor(() =>
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument(),
  );

describe('Header', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', scrollTo);
    vi.stubGlobal('matchMedia', createMatchMediaMock().matchMedia);
    useStageStore.setState({
      page: 0,
      viewport: {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        isMobile: false,
        isPortrait: false,
      },
    });
  });

  afterEach(() => {
    scrollTo.mockReset();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it('links every item to its section and the logo to the top', () => {
    renderAtPath(<Header />, '/en');

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
    NAV_ITEMS.forEach(({ id }) => {
      expect(link(id)).toHaveAttribute('href', `#${id}`);
    });
    expect(link('venues')).toHaveTextContent('Venues');
    expect(screen.getByTestId('header-logo')).toHaveAttribute('href', '#top');
    expect(screen.getByTestId('header-logo')).toHaveTextContent('SVANDA');
  });

  describe('reveal', () => {
    it('staggers the items from the logo outwards', () => {
      renderAtPath(<Header />, '/');

      const leftDelays = NAV_ITEMS_LEFT.map(({ id }) => itemDelay('left', id));
      const rightDelays = NAV_ITEMS_RIGHT.map(({ id }) =>
        itemDelay('right', id),
      );

      // Left items are listed from the edge towards the logo, right items away from it.
      expect(leftDelays).toEqual([...leftDelays].sort().reverse());
      expect(rightDelays).toEqual([...rightDelays].sort());
      expect(leftDelays.at(-1)).toBe(0);
    });

    it('reveals the outermost controls last', () => {
      renderAtPath(<Header />, '/');
      const outerControls = [
        screen.getByTestId('header-theme-toggle').parentElement,
        menuButton().closest('[style]'),
      ];

      outerControls.forEach((control) => {
        expect(revealDelay(control as HTMLElement)).toBe(
          NAV_REVEAL_DELAY_OUTER,
        );
      });
      NAV_ITEMS.forEach(({ revealDelay: delay }) => {
        expect(delay).toBeLessThanOrEqual(NAV_REVEAL_DELAY_OUTER);
      });
    });
  });

  it('marks the item of the current page', () => {
    renderAtPath(<Header />, '/');

    expect(link('jukebox')).not.toHaveAttribute('aria-current');
    act(() => useStageStore.getState().setPage(JUKEBOX_PAGE));

    expect(link('jukebox')).toHaveAttribute('aria-current', 'true');
    expect(link('karaoke')).not.toHaveAttribute('aria-current');
  });

  it('pages the stage on a plain click and leaves modified clicks alone', () => {
    renderAtPath(<Header />, '/');

    const isNotCancelled = fireEvent.click(link('venues'));
    fireEvent.click(link('contact'), { metaKey: true });
    fireEvent.click(screen.getByTestId('header-logo'));

    expect(isNotCancelled).toBe(false);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenNthCalledWith(1, {
      top: VENUES_PAGE * PAGE_HEIGHT,
      behavior: 'smooth',
    });
    expect(scrollTo).toHaveBeenNthCalledWith(2, { top: 0, behavior: 'smooth' });
  });

  it('toggles the theme and names the theme it switches to', () => {
    renderAtPath(<Header />, '/en');
    const toggle = screen.getByTestId('header-theme-toggle');

    expect(toggle).toHaveAccessibleName('Light mode');
    fireEvent.click(toggle);

    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light');
    expect(toggle).toHaveAccessibleName('Dark mode');
  });

  describe('mobile menu', () => {
    it('opens as a dialog with every item and the language switch', () => {
      renderAtPath(<Header />, '/en');

      expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
      openMenu();

      expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Menu');
      NAV_ITEMS.forEach(({ id }) => {
        expect(screen.getByTestId(`mobile-menu-link-${id}`)).toHaveAttribute(
          'href',
          `#${id}`,
        );
      });
      expect(
        screen.getByTestId('mobile-menu-language-switch-sk'),
      ).toHaveAttribute('href', '/sk');
      expect(screen.getByTestId('mobile-menu-close')).toHaveAccessibleName(
        'CLOSE',
      );
    });

    it('closes on Escape and returns focus to the menu button', async () => {
      renderAtPath(<Header />, '/');
      const button = openMenu();

      await waitFor(() =>
        expect(screen.getByTestId('mobile-menu')).toContainElement(
          document.activeElement as HTMLElement,
        ),
      );
      fireEvent.keyDown(document.activeElement as HTMLElement, {
        key: 'Escape',
      });

      await waitForMenuClosed();
      expect(button).toHaveFocus();
    });

    it('traps focus inside the menu', () => {
      renderAtPath(<Header />, '/');
      openMenu();
      const lastLocale = screen.getByTestId('mobile-menu-language-switch-sk');

      lastLocale.focus();
      fireEvent.keyDown(lastLocale, { key: 'Tab' });

      expect(screen.getByTestId('mobile-menu-close')).toHaveFocus();
    });

    it('closes on navigation and pages the stage', async () => {
      renderAtPath(<Header />, '/');
      act(() => useStageStore.getState().setPage(CONTACT_PAGE));
      openMenu();

      expect(screen.getByTestId('mobile-menu-link-contact')).toHaveAttribute(
        'aria-current',
        'true',
      );
      fireEvent.click(screen.getByTestId('mobile-menu-link-karaoke'));

      await waitForMenuClosed();
      expect(scrollTo).toHaveBeenCalledWith({
        top: PAGE_HEIGHT,
        behavior: 'smooth',
      });
    });
  });
});
