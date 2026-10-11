import { fireEvent, render, screen } from '@testing-library/react';
import { stubResizeObserver } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Slider } from './Slider';

const thumb = () => screen.getByTestId('slider-thumb');

describe('Slider', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is a labelled slider reading its formatted value', () => {
    render(
      <>
        <p id="hint">Background blocks</p>
        <Slider
          label="Pixel size"
          value={12}
          min={6}
          max={30}
          step={1}
          valueText="12 px"
          describedBy="hint"
          onValueChange={vi.fn()}
        />
      </>,
    );

    expect(thumb()).toHaveAttribute('role', 'slider');
    expect(thumb()).toHaveAccessibleName('Pixel size');
    expect(thumb()).toHaveAccessibleDescription('Background blocks');
    expect(thumb()).toHaveAttribute('aria-valuenow', '12');
    expect(thumb()).toHaveAttribute('aria-valuemin', '6');
    expect(thumb()).toHaveAttribute('aria-valuemax', '30');
    expect(thumb()).toHaveAttribute('aria-valuetext', '12 px');
  });

  it('steps by keyboard and stays inside its bounds', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        label="Speed"
        value={2.9}
        min={0.2}
        max={3}
        step={0.1}
        onValueChange={handleChange}
      />,
    );

    fireEvent.keyDown(thumb(), { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenLastCalledWith(3);

    fireEvent.keyDown(thumb(), { key: 'Home' });
    expect(handleChange).toHaveBeenLastCalledWith(0.2);
  });
});
