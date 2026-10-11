import { PIXEL_UI_RANGES } from '@svanda/shared';
import { fireEvent, screen } from '@testing-library/react';
import { renderAtPath, stubResizeObserver } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RangeControl } from './RangeControl';

const TEST_ID = 'speed';

const thumb = () => screen.getByTestId(`${TEST_ID}-slider-thumb`);
const shownValue = () => screen.getByTestId(`${TEST_ID}-value`);

describe('RangeControl', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows and announces the value in the format of the locale', () => {
    renderAtPath(
      <RangeControl
        label="Motion speed"
        value={1.5}
        range={PIXEL_UI_RANGES.speed}
        format="multiplier"
        onValueChange={vi.fn()}
        testId={TEST_ID}
      />,
      '/',
    );

    expect(thumb()).toHaveAccessibleName('Motion speed');
    expect(thumb()).toHaveAttribute('aria-valuetext', '1,5×');
    expect(shownValue()).toHaveTextContent('1,5×');
  });

  it('reads a share as percent and describes the slider with its hint', () => {
    renderAtPath(
      <RangeControl
        label="Window opacity"
        hint="Payment, queue, top-up"
        value={0.7}
        range={PIXEL_UI_RANGES.modalA}
        format="percent"
        onValueChange={vi.fn()}
        testId={TEST_ID}
      />,
      '/en',
    );

    expect(thumb()).toHaveAttribute('aria-valuetext', '70%');
    expect(thumb()).toHaveAccessibleDescription('Payment, queue, top-up');
  });

  it('steps within the range by keyboard', () => {
    const handleChange = vi.fn();
    renderAtPath(
      <RangeControl
        label="Pixel size"
        value={12}
        range={PIXEL_UI_RANGES.pixel}
        format="px"
        onValueChange={handleChange}
        testId={TEST_ID}
      />,
      '/en',
    );

    expect(shownValue()).toHaveTextContent('12 px');
    fireEvent.keyDown(thumb(), { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenLastCalledWith(13);
    fireEvent.keyDown(thumb(), { key: 'End' });
    expect(handleChange).toHaveBeenLastCalledWith(30);
  });
});
