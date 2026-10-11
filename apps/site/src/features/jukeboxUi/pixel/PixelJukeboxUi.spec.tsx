import { screen, within } from '@testing-library/react';
import { PIXEL_UI_DEFAULTS } from 'constants/jukeboxUi';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { PixelJukeboxUi } from './PixelJukeboxUi';

const TEST_ID = 'pixel-jukebox-ui';
// Lit cells of the 4 x 5 digits 1, 2 and 0.
const LIT_CELLS_120 = 8 + 10 + 10;

const litCells = (element: HTMLElement) =>
  element.querySelectorAll('[data-lit="true"]').length;

describe('PixelJukeboxUi', () => {
  it('renders the karaoke screen as one labelled picture', () => {
    renderAtPath(<PixelJukeboxUi section="sing" />, '/en');
    const ui = screen.getByRole('img', { name: 'Jukebox screen preview' });

    expect(ui).toBe(screen.getByTestId(TEST_ID));
    expect(ui).toHaveAttribute('data-section', 'sing');
    expect(screen.getByTestId(`${TEST_ID}-search`)).toHaveTextContent(
      'Search songs...',
    );
    expect(
      screen.getByTestId(`${TEST_ID}-song-bohemian-rhapsody`),
    ).toHaveTextContent('Bohemian Rhapsody (Karaoke) - Queen5:55');
    expect(
      screen.getByTestId(`${TEST_ID}-song-i-will-survive-vip`),
    ).toHaveTextContent('VIP');
    expect(screen.getByTestId(`${TEST_ID}-now-playing`)).toHaveTextContent(
      '0:42 / 3:10',
    );
  });

  it('marks the active section in the toggle', () => {
    renderAtPath(<PixelJukeboxUi section="listen" />, '/');

    expect(screen.getByTestId(`${TEST_ID}-toggle-listen`)).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId(`${TEST_ID}-toggle-sing`)).toHaveAttribute(
      'data-active',
      'false',
    );
  });

  it('draws the credit in pixel digits with the locale currency', () => {
    renderAtPath(<PixelJukeboxUi section="sing" />, '/');
    const credit = screen.getByTestId(`${TEST_ID}-credit`);
    const digits = screen.getByTestId(`${TEST_ID}-credit-digits`);

    expect(digits).toHaveAttribute('data-value', '120');
    expect(digits.children).toHaveLength(3);
    expect(litCells(digits)).toBe(LIT_CELLS_120);
    expect(credit).toHaveTextContent('Kč');
  });

  it('takes its colours from the config', () => {
    const config = { ...PIXEL_UI_DEFAULTS.sing, acc: 'var(--test-acc)' };
    renderAtPath(<PixelJukeboxUi section="sing" config={config} />, '/');
    const { style } = screen.getByTestId(TEST_ID);

    expect(style.getPropertyValue('--app-acc')).toBe('var(--test-acc)');
    expect(style.getPropertyValue('--app-base')).toBe(
      'var(--color-jukebox-ui-pixel-sing-base)',
    );
    expect(style.getPropertyValue('--app-row-a')).toBe('0.62');
  });

  it('shows the payment window only when asked', () => {
    const { unmount } = renderAtPath(<PixelJukeboxUi section="sing" />, '/en');
    expect(screen.queryByTestId(`${TEST_ID}-payment`)).not.toBeInTheDocument();

    unmount();
    renderAtPath(<PixelJukeboxUi section="sing" isPaymentOpen />, '/en');
    const payment = screen.getByTestId(`${TEST_ID}-payment`);

    expect(payment).toHaveTextContent('Bohemian Rhapsody (Karaoke) - Queen');
    expect(
      within(payment).getByTestId(`${TEST_ID}-payment-add`),
    ).toHaveTextContent(/Add for CZK\s10/);
    expect(
      within(payment).getByTestId(`${TEST_ID}-payment-vip`),
    ).toHaveTextContent(/VIP for CZK\s20/);
  });

  it('puts a background behind the UI', () => {
    renderAtPath(
      <PixelJukeboxUi
        section="sing"
        background={<canvas data-testid="lamp" />}
      />,
      '/',
    );

    expect(
      within(screen.getByTestId(`${TEST_ID}-background`)).getByTestId('lamp'),
    ).toBeInTheDocument();
  });
});
