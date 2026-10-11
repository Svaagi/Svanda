import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SegmentedControl } from './SegmentedControl';

type Section = 'sing' | 'listen';

const OPTIONS = [
  { value: 'sing', label: 'Karaoke' },
  { value: 'listen', label: 'Normal' },
] as const;

function ControlledSegmentedControl() {
  const [section, setSection] = useState<Section>('sing');

  return (
    <SegmentedControl
      label="Section"
      options={OPTIONS}
      value={section}
      onValueChange={setSection}
    />
  );
}

const option = (value: Section) =>
  screen.getByTestId(`segmented-control-${value}`);

const isPressed = (value: Section) =>
  option(value).getAttribute('aria-checked') === 'true';

describe('SegmentedControl', () => {
  it('is a named radio group with the selected option checked', () => {
    render(<ControlledSegmentedControl />);

    expect(screen.getByRole('radiogroup')).toBe(
      screen.getByTestId('segmented-control'),
    );
    expect(option('sing')).toHaveAttribute('role', 'radio');
    expect(screen.getByTestId('segmented-control')).toHaveAccessibleName(
      'Section',
    );
    expect(isPressed('sing')).toBe(true);
    expect(isPressed('listen')).toBe(false);
    expect(option('listen')).toHaveAccessibleName('Normal');
  });

  it('selects an option on click', () => {
    render(<ControlledSegmentedControl />);

    fireEvent.click(option('listen'));

    expect(isPressed('listen')).toBe(true);
    expect(isPressed('sing')).toBe(false);
  });

  it('keeps the selection when the selected option is pressed again', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        label="Section"
        options={OPTIONS}
        value="sing"
        onValueChange={handleChange}
      />,
    );

    fireEvent.click(option('sing'));

    expect(handleChange).not.toHaveBeenCalled();
    expect(isPressed('sing')).toBe(true);
  });

  it('moves focus between options with the arrow keys', async () => {
    render(<ControlledSegmentedControl />);

    option('sing').focus();
    fireEvent.keyDown(option('sing'), { key: 'ArrowRight' });

    // Radix moves roving focus on the next tick.
    await waitFor(() => expect(option('listen')).toHaveFocus());
  });

  it('marks its size for the compact styling', () => {
    render(
      <SegmentedControl
        label="Section"
        size="compact"
        options={OPTIONS}
        value="sing"
        onValueChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId('segmented-control')).toHaveAttribute(
      'data-size',
      'compact',
    );
  });
});
