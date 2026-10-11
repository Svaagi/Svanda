import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

function ControlledSwitch() {
  const [isOn, setIsOn] = useState(false);

  return <Switch label="Glitch" checked={isOn} onCheckedChange={setIsOn} />;
}

const control = () => screen.getByTestId('switch-control');

describe('Switch', () => {
  it('is a labelled switch that starts off', () => {
    render(<Switch label="Scanlines" />);

    expect(control()).toHaveAttribute('role', 'switch');
    expect(control()).toHaveAccessibleName('Scanlines');
    expect(control()).toHaveAttribute('aria-checked', 'false');
  });

  it('reads its hint as the description', () => {
    render(<Switch label="Glitch" hint="Occasional row shifts" />);

    expect(control()).toHaveAccessibleDescription('Occasional row shifts');
    expect(screen.getByTestId('switch-hint')).toHaveTextContent(
      'Occasional row shifts',
    );
  });

  it('toggles from a click and reports the new state', () => {
    const handleChange = vi.fn();
    render(<Switch label="Motion" onCheckedChange={handleChange} />);

    fireEvent.click(control());

    expect(control()).toHaveAttribute('aria-checked', 'true');
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles from its label', () => {
    render(<ControlledSwitch />);

    fireEvent.click(screen.getByTestId('switch-label'));

    expect(control()).toHaveAttribute('aria-checked', 'true');
  });

  it('is a focusable native button, so Space and Enter work by keyboard', () => {
    render(<Switch label="Motion" defaultChecked />);

    control().focus();

    expect(control()).toHaveFocus();
    expect(control().tagName).toBe('BUTTON');
    expect(control()).toHaveAttribute('aria-checked', 'true');
  });

  it('ignores input when disabled', () => {
    const handleChange = vi.fn();
    render(<Switch label="Motion" disabled onCheckedChange={handleChange} />);

    fireEvent.click(control());

    expect(control()).toBeDisabled();
    expect(handleChange).not.toHaveBeenCalled();
  });
});
