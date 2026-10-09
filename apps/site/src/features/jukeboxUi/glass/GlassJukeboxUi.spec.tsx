import { screen } from '@testing-library/react';
import { GLASS_UI_DEFAULTS } from 'constants/jukeboxUi';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { GlassJukeboxUi } from './GlassJukeboxUi';

const TEST_ID = 'glass-jukebox-ui';

describe('GlassJukeboxUi', () => {
  it('renders the listening screen with its queue and credit', () => {
    renderAtPath(<GlassJukeboxUi section="listen" />, '/sk');
    const ui = screen.getByTestId(TEST_ID);

    expect(ui).toHaveAttribute('role', 'img');
    expect(ui).toHaveAttribute('data-design', 'glass');
    expect(screen.getByTestId(`${TEST_ID}-credit`)).toHaveTextContent('40CZK');
    expect(screen.getByTestId(`${TEST_ID}-search`)).toHaveTextContent('RAD');
    expect(screen.getByTestId(`${TEST_ID}-toggle-listen`)).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(
      screen.getByTestId(`${TEST_ID}-song-blinding-lights`),
    ).toHaveTextContent('Blinding Lights - The Weeknd4:23');
    expect(screen.getByTestId(`${TEST_ID}-now-playing`)).toHaveTextContent(
      'JD',
    );
  });

  it('takes its colours and glass strength from the config', () => {
    const config = { ...GLASS_UI_DEFAULTS.sing, glassA: 0.3, now: 'red' };
    renderAtPath(<GlassJukeboxUi section="sing" config={config} />, '/');
    const { style } = screen.getByTestId(TEST_ID);

    expect(style.getPropertyValue('--app-glass-a')).toBe('0.3');
    expect(style.getPropertyValue('--app-now')).toBe('red');
  });

  it('shows the payment window only when asked', () => {
    const { unmount } = renderAtPath(<GlassJukeboxUi section="sing" />, '/');
    expect(screen.queryByTestId(`${TEST_ID}-payment`)).not.toBeInTheDocument();

    unmount();
    renderAtPath(<GlassJukeboxUi section="sing" isPaymentOpen />, '/');

    expect(screen.getByTestId(`${TEST_ID}-payment`)).toHaveAttribute(
      'data-design',
      'glass',
    );
  });
});
