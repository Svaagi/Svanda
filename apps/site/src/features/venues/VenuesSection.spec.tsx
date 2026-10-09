import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { VENUES } from 'constants/venues';
import { useStageStore } from 'features/stage';
import { renderAtPath } from 'utils/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VenuesSection } from './VenuesSection';

const frame = () => screen.getByTestId('venue-frame');
const activeStrip = (venueId: string) =>
  screen.getByTestId(`venue-frame-slide-${venueId}-strip`);
const tab = (venueId: string) => screen.getByTestId(`venue-tabs-${venueId}`);

describe('VenuesSection', () => {
  afterEach(() => {
    useStageStore.setState({ grid: { cell: 0, originX: 0, originY: 0 } });
  });

  it('labels the section with the pixel heading and wires the tabs to the frame', () => {
    renderAtPath(<VenuesSection />, '/en');

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'VENUES & EVENTS',
    });
    expect(screen.getByRole('region', { name: 'VENUES & EVENTS' })).toBe(
      screen.getByTestId('venues-section'),
    );
    const tablist = screen.getByRole('tablist', { name: 'VENUES & EVENTS' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(VENUES.length);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    expect(heading).toBe(screen.getByTestId('venues-section-heading'));

    const panel = screen.getByRole('tabpanel', { name: /Lemon/ });
    expect(panel).toBe(frame());
    expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
  });

  it('selects a venue by tab click and opens it on its first photo', () => {
    renderAtPath(<VenuesSection />, '/en');

    fireEvent.click(screen.getByTestId('venue-frame-slide-lemon-dot-3'));
    fireEvent.click(tab('musicBarAndel'));

    expect(tab('musicBarAndel')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('venue-frame-track')).toHaveAttribute(
      'data-venue-index',
      '3',
    );
    expect(activeStrip('musicBarAndel')).toHaveAttribute(
      'data-photo-index',
      '0',
    );
    expect(
      screen.getByTestId('venue-frame-slide-musicBarAndel'),
    ).not.toHaveAttribute('inert');
    expect(screen.getByTestId('venue-frame-slide-lemon')).toHaveAttribute(
      'inert',
    );
  });

  it('moves focus and selection through the tabs with arrows, Home and End', () => {
    renderAtPath(<VenuesSection />, '/en');
    tab('lemon').focus();

    expect(fireEvent.keyDown(tab('lemon'), { key: 'ArrowRight' })).toBe(false);
    expect(tab('arcadeBar')).toHaveAttribute('aria-selected', 'true');
    expect(tab('arcadeBar')).toHaveFocus();

    fireEvent.keyDown(tab('arcadeBar'), { key: 'End' });
    expect(tab('pivniceUMostu')).toHaveFocus();
    fireEvent.keyDown(tab('pivniceUMostu'), { key: 'ArrowRight' });
    expect(tab('lemon')).toHaveFocus();
    fireEvent.keyDown(tab('lemon'), { key: 'ArrowLeft' });
    expect(tab('pivniceUMostu')).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tab('pivniceUMostu'), { key: 'Home' });
    expect(tab('lemon')).toHaveAttribute('aria-selected', 'true');

    // Up and down stay with the stage, which pages on them.
    expect(fireEvent.keyDown(tab('lemon'), { key: 'ArrowDown' })).toBe(true);
  });

  it('switches photos with left and right and venues with up and down on the frame', () => {
    renderAtPath(<VenuesSection />, '/en');

    expect(fireEvent.keyDown(frame(), { key: 'ArrowRight' })).toBe(false);
    fireEvent.keyDown(frame(), { key: 'ArrowRight' });
    expect(activeStrip('lemon')).toHaveAttribute('data-photo-index', '2');
    fireEvent.keyDown(frame(), { key: 'ArrowLeft' });
    expect(activeStrip('lemon')).toHaveAttribute('data-photo-index', '1');

    fireEvent.keyDown(frame(), { key: 'ArrowDown' });
    expect(tab('arcadeBar')).toHaveAttribute('aria-selected', 'true');
    expect(activeStrip('arcadeBar')).toHaveAttribute('data-photo-index', '0');
    fireEvent.keyDown(frame(), { key: 'ArrowUp' });
    fireEvent.keyDown(frame(), { key: 'ArrowUp' });
    expect(tab('pivniceUMostu')).toHaveAttribute('aria-selected', 'true');

    expect(fireEvent.keyDown(frame(), { key: 'Enter' })).toBe(true);
  });

  it('cycles the venues with the chevrons and picks photos with the dots', () => {
    renderAtPath(<VenuesSection />, '/en');

    fireEvent.click(screen.getByRole('button', { name: 'Previous venue' }));
    expect(tab('pivniceUMostu')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Next venue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next venue' }));
    expect(tab('arcadeBar')).toHaveAttribute('aria-selected', 'true');

    const dot = screen.getByRole('button', {
      name: 'PHOTO 4/5 · Arcade Bar',
    });
    fireEvent.click(dot);
    expect(dot).toHaveAttribute('aria-current', 'true');
    expect(activeStrip('arcadeBar')).toHaveAttribute('data-photo-index', '3');
  });

  it('shows the note, city and a localized date over each venue', () => {
    renderAtPath(<VenuesSection />, '/');

    const slide = screen.getByTestId('venue-frame-slide-lemon');
    expect(slide).toHaveTextContent('Karaoke pátek');
    expect(
      screen.getByTestId('venue-frame-slide-lemon-place'),
    ).toHaveTextContent('Brno · 20. 9. 2026');
  });

  it('lazy-loads every photo with its intrinsic size and alt text', () => {
    renderAtPath(<VenuesSection />, '/sk');

    const photo = screen.getByTestId('venue-frame-slide-galerieZlin-photo-2');
    expect(photo).toHaveAttribute('loading', 'lazy');
    expect(photo).toHaveAttribute('width', '1600');
    expect(photo).toHaveAttribute('height', '1200');
    expect(photo).toHaveAttribute('alt', 'FOTO 2/5 · Galerie Zlín');
    expect(photo.parentElement?.querySelector('source')).toHaveAttribute(
      'type',
      'image/avif',
    );
  });

  it('snaps the frame and heading once the background grid is known', () => {
    renderAtPath(<VenuesSection />, '/en');
    expect(frame()).toHaveAttribute('data-snapped', 'false');
    const headingPixels = screen.getByTestId('venues-section-heading-pixels');
    const fallbackHeight = headingPixels
      .querySelector('svg')
      ?.getAttribute('height');

    act(() => {
      useStageStore.setState({ grid: { cell: 20, originX: 0, originY: 0 } });
    });

    expect(frame()).toHaveAttribute('data-snapped', 'true');
    expect(frame().style.getPropertyValue('--venue-cell')).toBe('20px');
    expect(headingPixels.querySelector('svg')?.getAttribute('height')).not.toBe(
      fallbackHeight,
    );
  });

  it('replays the name scramble in the band when the venue changes', () => {
    vi.useFakeTimers();
    try {
      renderAtPath(<VenuesSection />, '/en');
      const band = screen.getByTestId('venue-frame-slide-arcadeBar-band');
      expect(band).toHaveAttribute('data-text', 'Arcade Bar');
      expect(band).toHaveAttribute('aria-hidden', 'true');

      fireEvent.click(tab('arcadeBar'));
      expect(band.dataset.text).not.toBe('Arcade Bar');
      expect(band.dataset.text).toHaveLength('Arcade Bar'.length);

      // Two letters per 70 ms step resolve the ten characters in five steps.
      for (let step = 0; step < 5; step++) {
        act(() => {
          vi.advanceTimersByTime(70);
        });
      }
      expect(band).toHaveAttribute('data-text', 'Arcade Bar');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('VenuesSection lightbox', () => {
  const lightbox = () => screen.queryByTestId('venue-lightbox');
  const openButton = (venueId: string) =>
    screen.getByTestId(`venue-frame-slide-${venueId}-open`);

  it('opens the current photo with its counter and alt text', async () => {
    renderAtPath(<VenuesSection />, '/en');
    fireEvent.click(screen.getByTestId('venue-frame-slide-lemon-dot-2'));
    const trigger = openButton('lemon');
    expect(trigger).toHaveAccessibleName('Open photo 2/5 · Lemon');

    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', {
      name: 'PHOTO 2/5 · Lemon',
    });
    expect(dialog).toBe(lightbox());
    expect(screen.getByTestId('venue-lightbox-image')).toHaveAttribute(
      'alt',
      'PHOTO 2/5 · Lemon',
    );
    expect(screen.getByTestId('venue-lightbox-image')).toHaveAttribute(
      'loading',
      'eager',
    );
  });

  it('steps through the photos with the arrows and keys, stopping at the ends', async () => {
    renderAtPath(<VenuesSection />, '/en');
    fireEvent.click(openButton('lemon'));
    await screen.findByTestId('venue-lightbox');
    const title = () => screen.getByTestId('venue-lightbox-title');
    const previous = screen.getByTestId('venue-lightbox-previous');

    expect(previous).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(previous);
    expect(title()).toHaveTextContent('PHOTO 1/5 · Lemon');

    fireEvent.click(screen.getByTestId('venue-lightbox-next'));
    expect(title()).toHaveTextContent('PHOTO 2/5 · Lemon');
    expect(fireEvent.keyDown(title(), { key: 'ArrowRight' })).toBe(false);
    expect(title()).toHaveTextContent('PHOTO 3/5 · Lemon');
    fireEvent.keyDown(title(), { key: 'ArrowLeft' });
    expect(title()).toHaveTextContent('PHOTO 2/5 · Lemon');
    // The frame behind follows, so closing shows the photo last viewed.
    expect(activeStrip('lemon')).toHaveAttribute('data-photo-index', '1');

    for (let i = 0; i < 5; i++) {
      fireEvent.keyDown(title(), { key: 'ArrowRight' });
    }
    expect(title()).toHaveTextContent('PHOTO 5/5 · Lemon');
    expect(screen.getByTestId('venue-lightbox-next')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('closes on Escape and returns focus to the photo', async () => {
    renderAtPath(<VenuesSection />, '/en');
    const trigger = openButton('lemon');
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByTestId('venue-lightbox-close')).toHaveFocus(),
    );

    fireEvent.keyDown(screen.getByTestId('venue-lightbox'), {
      key: 'Escape',
    });

    await waitFor(() => expect(lightbox()).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
