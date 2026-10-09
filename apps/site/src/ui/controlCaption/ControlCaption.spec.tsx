import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ControlCaption } from './ControlCaption';

describe('ControlCaption', () => {
  it('labels the control it points at and gives the hint its id', () => {
    render(
      <>
        <ControlCaption
          label="Speed"
          hint="How fast the background moves"
          hintId="speed-hint"
          htmlFor="speed"
        />
        <input id="speed" aria-describedby="speed-hint" />
      </>,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleName('Speed');
    expect(input).toHaveAccessibleDescription('How fast the background moves');
    expect(screen.getByTestId('control-label').tagName).toBe('LABEL');
  });

  it('renders plain text without a target and no hint unless given', () => {
    render(<ControlCaption label="Blur" hintId="blur-hint" testId="blur" />);

    expect(screen.getByTestId('blur-caption')).toBeInTheDocument();
    expect(screen.getByTestId('blur-label').tagName).toBe('SPAN');
    expect(screen.queryByTestId('blur-hint')).not.toBeInTheDocument();
  });
});
