import { fireEvent, screen } from '@testing-library/react';
import { renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DisplayCompare } from './DisplayCompare';

const TEST_ID = 'display-compare';

const splitOf = () =>
  screen.getByTestId(TEST_ID).style.getPropertyValue('--split');

describe('DisplayCompare', () => {
  // jsdom has no canvas; the lamps have their own spec.
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stacks both designs of the section over their lava lamps', () => {
    renderAtPath(<DisplayCompare section="listen" />, '/en');

    expect(
      screen.getByRole('group', {
        name: 'Jukebox display: pixel and original design',
      }),
    ).toBe(screen.getByTestId(TEST_ID));
    expect(screen.getByTestId('pixel-jukebox-ui')).toHaveAttribute(
      'data-section',
      'listen',
    );
    expect(screen.getByTestId('glass-jukebox-ui')).toHaveAttribute(
      'data-section',
      'listen',
    );
    expect(screen.getByTestId('pixel-jukebox-ui')).toContainElement(
      screen.getByTestId(`${TEST_ID}-pixel-lava`),
    );
    expect(screen.getByTestId('glass-jukebox-ui')).toContainElement(
      screen.getByTestId(`${TEST_ID}-glass-lava`),
    );
    expect(screen.getByTestId(TEST_ID)).toHaveTextContent('PIXELORIGINAL');
  });

  it('pauses both lamps with the display', () => {
    renderAtPath(<DisplayCompare section="sing" isPaused />, '/');

    expect(screen.getByTestId(`${TEST_ID}-pixel-lava`)).toHaveAttribute(
      'data-paused',
      'true',
    );
    expect(screen.getByTestId(`${TEST_ID}-glass-lava`)).toHaveAttribute(
      'data-paused',
      'true',
    );
  });

  it('starts split in the middle with a labelled slider handle', () => {
    renderAtPath(<DisplayCompare section="sing" />, '/en');
    const handle = screen.getByRole('slider', {
      name: 'Design comparison slider',
    });

    expect(handle).toBe(screen.getByTestId(`${TEST_ID}-handle`));
    expect(handle).toHaveAttribute('aria-valuenow', '50');
    expect(handle).toHaveAttribute('aria-valuetext', 'Pixel 50%, original 50%');
    expect(splitOf()).toBe('50%');
  });

  it('moves the split with the arrow keys and clamps it', () => {
    renderAtPath(<DisplayCompare section="sing" />, '/en');
    const handle = screen.getByTestId(`${TEST_ID}-handle`);

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle).toHaveAttribute('aria-valuenow', '55');
    fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true });
    expect(handle).toHaveAttribute('aria-valuenow', '35');
    expect(splitOf()).toBe('35%');

    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle).toHaveAttribute('aria-valuenow', '100');
    expect(handle).toHaveAttribute('aria-valuetext', 'Pixel 100%, original 0%');
  });

  describe('dragging', () => {
    const SURFACE_WIDTH_PX = 540;

    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
        SURFACE_WIDTH_PX,
      );
      HTMLElement.prototype.setPointerCapture = vi.fn();
      HTMLElement.prototype.releasePointerCapture = vi.fn();
      HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
    });

    // A pointer event at a client position, `offsetX` into the surface.
    const pointer = (
      type: string,
      clientX: number,
      clientY: number,
      offsetX = clientX,
    ) => {
      const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'touch',
        buttons: type === 'pointerup' ? 0 : 1,
        clientX,
        clientY,
      });
      Object.defineProperty(event, 'offsetX', { value: offsetX });
      return event;
    };

    const drag = (points: readonly [number, number][]) => {
      const surface = screen.getByTestId(`${TEST_ID}-surface`);
      const [start, ...rest] = points;
      if (!start) return;
      fireEvent(surface, pointer('pointerdown', ...start));
      rest.forEach((point) =>
        fireEvent(surface, pointer('pointermove', ...point)),
      );
      const end = rest.at(-1) ?? start;
      fireEvent(surface, pointer('pointerup', ...end));
    };

    it('follows a horizontal drag', () => {
      renderAtPath(<DisplayCompare section="sing" />, '/en');

      drag([
        [270, 400],
        [300, 402],
        [405, 404],
      ]);

      expect(splitOf()).toBe('75%');
    });

    it('ignores taps and vertical swipes', () => {
      renderAtPath(<DisplayCompare section="sing" />, '/en');

      drag([[100, 400]]);
      expect(splitOf()).toBe('50%');

      drag([
        [100, 400],
        [102, 450],
        [104, 600],
      ]);
      expect(splitOf()).toBe('50%');
    });
  });

  it('keeps Home and End from paging the stage, but not Up and Down', () => {
    renderAtPath(<DisplayCompare section="sing" />, '/en');
    const handle = screen.getByTestId(`${TEST_ID}-handle`);

    expect(fireEvent.keyDown(handle, { key: 'Home' })).toBe(false);
    expect(handle).toHaveAttribute('aria-valuenow', '0');
    expect(fireEvent.keyDown(handle, { key: 'ArrowDown' })).toBe(true);
    expect(handle).toHaveAttribute('aria-valuenow', '0');
  });
});
