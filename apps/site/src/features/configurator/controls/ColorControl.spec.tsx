import { fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { ToastProvider } from 'ui';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it, vi } from 'vitest';

import { ColorControl } from './ColorControl';

const TEST_ID = 'accent';

type HarnessProps = {
  onValueChange?: (value: string) => void;
  hasSwatches?: boolean;
};

function ControlledColor({ onValueChange, hasSwatches = true }: HarnessProps) {
  const [color, setColor] = useState('#2fcaca');
  const handleValueChange = (value: string) => {
    setColor(value);
    onValueChange?.(value);
  };

  return (
    <ToastProvider>
      <ColorControl
        label="Accent"
        hint="Buttons and switch"
        value={color}
        hasSwatches={hasSwatches}
        onValueChange={handleValueChange}
        testId={TEST_ID}
      />
    </ToastProvider>
  );
}

const picker = () => screen.getByTestId(`${TEST_ID}-picker`);
const hex = () => screen.getByTestId<HTMLInputElement>(`${TEST_ID}-hex`);

describe('ColorControl', () => {
  it('labels the picker and the hex field and shows the colour in both', () => {
    renderAtPath(<ControlledColor />, '/en');

    expect(picker()).toHaveAccessibleName('Accent');
    expect(picker()).toHaveAccessibleDescription('Buttons and switch');
    expect(picker()).toHaveValue('#2fcaca');
    expect(hex()).toHaveAccessibleName('Accent (hex)');
    expect(hex()).toHaveValue('#2FCACA');
  });

  it('applies the picker live and mirrors it in the hex field', () => {
    const handleChange = vi.fn();
    renderAtPath(<ControlledColor onValueChange={handleChange} />, '/en');

    fireEvent.change(picker(), { target: { value: '#ff4fd8' } });

    expect(handleChange).toHaveBeenLastCalledWith('#ff4fd8');
    expect(hex()).toHaveValue('#FF4FD8');
  });

  it('applies a typed hex on Enter, with or without the hash', () => {
    const handleChange = vi.fn();
    renderAtPath(<ControlledColor onValueChange={handleChange} />, '/en');

    fireEvent.change(hex(), { target: { value: 'b6ff4d' } });
    fireEvent.keyDown(hex(), { key: 'Enter' });

    expect(handleChange).toHaveBeenLastCalledWith('#b6ff4d');
    expect(hex()).toHaveValue('#B6FF4D');
    expect(picker()).toHaveValue('#b6ff4d');
  });

  it('keeps focus in the hex field after Enter', () => {
    renderAtPath(<ControlledColor />, '/en');

    hex().focus();
    fireEvent.change(hex(), { target: { value: '#ff4fd8' } });
    fireEvent.keyDown(hex(), { key: 'Enter' });

    expect(hex()).toHaveFocus();
    expect(hex()).toHaveValue('#FF4FD8');
  });

  it('shows a colour changed elsewhere in the hex field', () => {
    renderAtPath(<ControlledColor />, '/en');

    fireEvent.click(screen.getByTestId(`${TEST_ID}-swatch-ff9a3c`));

    expect(hex()).toHaveValue('#FF9A3C');
  });

  it('reverts an invalid hex when the field loses focus and says why', () => {
    const handleChange = vi.fn();
    renderAtPath(<ControlledColor onValueChange={handleChange} />, '/en');

    fireEvent.change(hex(), { target: { value: '#12' } });
    fireEvent.blur(hex());

    expect(handleChange).not.toHaveBeenCalled();
    expect(hex()).toHaveValue('#2FCACA');
    expect(screen.getByTestId('toast-message')).toHaveTextContent(
      'Enter a colour as #RRGGBB.',
    );
  });

  it('leaves an untouched field alone when it loses focus', () => {
    const handleChange = vi.fn();
    renderAtPath(<ControlledColor onValueChange={handleChange} />, '/en');

    fireEvent.blur(hex());

    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('toast-message')).not.toBeInTheDocument();
  });

  it('offers labelled swatches that apply their colour', () => {
    const handleChange = vi.fn();
    renderAtPath(<ControlledColor onValueChange={handleChange} />, '/en');
    const swatch = screen.getByTestId(`${TEST_ID}-swatch-ff9a3c`);

    expect(swatch).toHaveAccessibleName('Accent #FF9A3C');
    expect(swatch).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(swatch);

    expect(handleChange).toHaveBeenLastCalledWith('#ff9a3c');
    expect(swatch).toHaveAttribute('aria-pressed', 'true');
    expect(hex()).toHaveValue('#FF9A3C');
  });

  it('shows no swatches unless asked', () => {
    renderAtPath(<ControlledColor hasSwatches={false} />, '/en');

    expect(screen.queryByTestId(`${TEST_ID}-swatches`)).not.toBeInTheDocument();
  });
});
