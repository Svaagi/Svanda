import { act, fireEvent, render, screen } from '@testing-library/react';
import { TOAST_DURATION_MS } from 'constants/motion';
import { renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';

function ToastTrigger() {
  const { showToast } = useToast();

  return (
    <>
      <button
        type="button"
        data-testid="show-first"
        onClick={() => showToast('Settings loaded.')}
      >
        First
      </button>
      <button
        type="button"
        data-testid="show-second"
        onClick={() => showToast('All settings copied as JSON.')}
      >
        Second
      </button>
    </>
  );
}

const renderToasts = (path = '/en') =>
  renderAtPath(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>,
    path,
  );

const message = () => screen.queryByTestId('toast-message');

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows a toast and dismisses it after 3.2 s', () => {
    renderToasts();

    fireEvent.click(screen.getByTestId('show-first'));
    expect(message()).toHaveTextContent('Settings loaded.');

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
    });
    expect(message()).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(message()).not.toBeInTheDocument();
  });

  it('queues toasts and shows them one after another', () => {
    renderToasts();

    fireEvent.click(screen.getByTestId('show-first'));
    fireEvent.click(screen.getByTestId('show-second'));
    expect(screen.getAllByTestId('toast')).toHaveLength(1);
    expect(message()).toHaveTextContent('Settings loaded.');

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS);
    });
    expect(message()).toHaveTextContent('All settings copied as JSON.');
  });

  it('announces the message in a polite live region', () => {
    renderToasts();

    fireEvent.click(screen.getByTestId('show-first'));
    // Radix fills its announcer two animation frames after the toast mounts.
    act(() => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent('Settings loaded.');
  });

  it('closes from its localised close button', () => {
    renderToasts('/sk');

    fireEvent.click(screen.getByTestId('show-first'));
    const close = screen.getByTestId('toast-close');

    expect(close).toHaveAccessibleName('Zavrieť');
    fireEvent.click(close);
    expect(message()).not.toBeInTheDocument();
  });

  it('labels the notification region in the active locale', () => {
    renderToasts('/');

    expect(
      screen.getByRole('region', { name: /^Oznámení \(/ }),
    ).toBeInTheDocument();
  });

  it('fails loudly when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<ToastTrigger />)).toThrow(/ToastProvider/);
  });
});
