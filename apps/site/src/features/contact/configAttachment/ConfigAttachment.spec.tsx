import { act, fireEvent, screen } from '@testing-library/react';
import { useConfiguratorStore } from 'features/configurator';
import { renderAtPath } from 'utils/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConfigAttachment } from './ConfigAttachment';

const byTestId = (testId: string) => screen.getByTestId(testId);

describe('ConfigAttachment', () => {
  beforeEach(() => {
    useConfiguratorStore.setState({ isAttached: false });
  });

  it('attaches the configuration and moves focus to the remove button', () => {
    renderAtPath(<ConfigAttachment />, '/en');

    fireEvent.click(byTestId('config-attachment-add'));

    expect(useConfiguratorStore.getState().isAttached).toBe(true);
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
