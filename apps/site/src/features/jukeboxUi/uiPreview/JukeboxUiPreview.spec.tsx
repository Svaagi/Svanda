import { JUKEBOX_CONFIG_DEFAULTS, mergeJukeboxConfig } from '@svanda/shared';
import { screen } from '@testing-library/react';
import { renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JukeboxUiPreview } from './JukeboxUiPreview';

const TEST_ID = 'jukebox-ui-preview';

describe('JukeboxUiPreview', () => {
  // jsdom has no canvas; the lamps have their own spec.
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the pixel design of the section with its config over a lava lamp', () => {
    const config = mergeJukeboxConfig(JUKEBOX_CONFIG_DEFAULTS, {
      pixel: { listen: { acc: '#123456' } },
    });
    renderAtPath(
      <JukeboxUiPreview design="pixel" section="listen" config={config} />,
      '/en',
    );
    const ui = screen.getByTestId(`${TEST_ID}-pixel`);

    expect(ui).toHaveAttribute('data-section', 'listen');
    expect(ui.style.getPropertyValue('--app-acc')).toBe('#123456');
    expect(ui).toContainElement(screen.getByTestId(`${TEST_ID}-lava`));
    expect(screen.queryByTestId(`${TEST_ID}-glass`)).not.toBeInTheDocument();
  });

  it('shows the glass design with the payment window and a paused lamp', () => {
    renderAtPath(
      <JukeboxUiPreview
        design="glass"
        section="sing"
        config={JUKEBOX_CONFIG_DEFAULTS}
        isPaymentOpen
        isPaused
      />,
      '/en',
    );

    expect(screen.getByTestId(`${TEST_ID}-glass`)).toHaveAttribute(
      'data-design',
      'glass',
    );
    expect(screen.getByTestId(`${TEST_ID}-glass-payment`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_ID}-lava`)).toHaveAttribute(
      'data-paused',
      'true',
    );
  });
});
