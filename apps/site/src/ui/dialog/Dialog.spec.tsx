import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { Dialog, type DialogProps } from './Dialog';

interface DialogHarnessProps {
  description?: string;
  closeLabel?: string;
  variant?: DialogProps['variant'];
}

function DialogHarness({
  description,
  closeLabel,
  variant,
}: DialogHarnessProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-testid="open-dialog"
        onClick={() => setIsOpen(true)}
      >
        Open
      </button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Colours"
        description={description}
        closeLabel={closeLabel}
        variant={variant}
      >
        <input aria-label="Accent" data-testid="dialog-field" />
      </Dialog>
    </>
  );
}

const openDialog = () => {
  const trigger = screen.getByTestId('open-dialog');
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
};

const waitForClosed = () =>
  waitFor(() => expect(screen.queryByTestId('dialog')).not.toBeInTheDocument());

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    renderAtPath(<DialogHarness />, '/en');

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('opens as a modal dialog named by its title and described by its description', () => {
    renderAtPath(<DialogHarness description="Pick a colour" />, '/en');
    openDialog();
    const dialog = screen.getByRole('dialog');

    expect(dialog).toBe(screen.getByTestId('dialog'));
    expect(dialog).toHaveAccessibleName('Colours');
    expect(dialog).toHaveAccessibleDescription('Pick a colour');
    expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument();
  });

  it('moves focus inside on open and restores it on Escape', async () => {
    renderAtPath(<DialogHarness />, '/en');
    const trigger = openDialog();

    await waitFor(() =>
      expect(screen.getByTestId('dialog')).toContainElement(
        document.activeElement as HTMLElement,
      ),
    );
    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'Escape',
    });

    await waitForClosed();
    expect(trigger).toHaveFocus();
  });

  it('traps Tab inside the dialog', () => {
    renderAtPath(<DialogHarness />, '/en');
    openDialog();
    const lastField = screen.getByTestId('dialog-field');

    lastField.focus();
    fireEvent.keyDown(lastField, { key: 'Tab' });

    expect(screen.getByTestId('dialog-close')).toHaveFocus();
  });

  it('closes from its localised close button', async () => {
    renderAtPath(<DialogHarness />, '/');
    openDialog();
    const close = screen.getByTestId('dialog-close');

    expect(close).toHaveAccessibleName('Zavřít');
    fireEvent.click(close);

    await waitForClosed();
  });

  it('takes a custom close label', () => {
    renderAtPath(<DialogHarness closeLabel="Done" />, '/en');
    openDialog();

    expect(screen.getByTestId('dialog-close')).toHaveAccessibleName('Done');
  });

  it('hides the rest of the page from assistive technology while open', () => {
    renderAtPath(<DialogHarness />, '/en');
    openDialog();

    expect(screen.getByTestId('open-dialog').closest('[aria-hidden]')).not.toBe(
      null,
    );
  });

  it('styles the sheet variant apart from the centred dialog', () => {
    renderAtPath(<DialogHarness />, '/en');
    openDialog();
    const centredClass = screen.getByTestId('dialog').className;
    cleanup();

    renderAtPath(<DialogHarness variant="sheet" />, '/en');
    openDialog();

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Colours');
    expect(screen.getByTestId('dialog').className).not.toBe(centredClass);
  });
});
