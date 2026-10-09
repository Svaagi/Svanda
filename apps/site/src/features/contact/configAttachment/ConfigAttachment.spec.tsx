import { act, fireEvent, screen } from '@testing-library/react';
import { useConfiguratorStore } from 'features/configurator';
import { track } from 'lib/analytics';
import { renderAtPath } from 'utils/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigAttachment } from './ConfigAttachment';

vi.mock('lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lib/analytics')>()),
  track: vi.fn(),
}));

const byTestId = (testId: string) => screen.getByTestId(testId);

describe('ConfigAttachment', () => {
  beforeEach(() => {
    useConfiguratorStore.setState({ isAttached: false });
    vi.mocked(track).mockClear();
  });

  it('attaches the configuration and moves focus to the remove button', () => {
    renderAtPath(<ConfigAttachment />, '/en');

    fireEvent.click(byTestId('config-attachment-add'));

    expect(useConfiguratorStore.getState().isAttached).toBe(true);
    expect(track).toHaveBeenCalledExactlyOnceWith('configurator_attach', {
      source: 'contact',
    });
    expect(byTestId('config-attachment-attached')).toBeInTheDocument();
    expect(byTestId('config-attachment-remove')).toHaveFocus();
    expect(byTestId('config-attachment-remove')).toHaveAccessibleDescription(
      'Jukebox colour configuration attached',
    );
  });

  it('removes the attachment and moves focus back to the add button', () => {
    useConfiguratorStore.setState({ isAttached: true });
    renderAtPath(<ConfigAttachment />, '/en');

    fireEvent.click(byTestId('config-attachment-remove'));

    expect(useConfiguratorStore.getState().isAttached).toBe(false);
    expect(byTestId('config-attachment-add')).toHaveFocus();
  });

  it('shows an attachment made in the configurator without taking focus', () => {
    renderAtPath(<ConfigAttachment />, '/en');

    act(() => useConfiguratorStore.getState().setAttached(true));

    expect(
      screen.getByTestId('config-attachment-attached'),
    ).toBeInTheDocument();
    expect(byTestId('config-attachment-remove')).not.toHaveFocus();
  });
});
