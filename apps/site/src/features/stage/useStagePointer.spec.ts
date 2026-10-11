import { act, renderHook } from '@testing-library/react';
import { TOUCH_RELEASE_MS } from 'constants/stage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialStageValues, useStageStore } from './stageStore';
import { useStagePointer } from './useStagePointer';

const RECT = { left: 0, top: 0, width: 800, height: 600 } as DOMRect;

const pointer = () => useStageStore.getState().pointer;

const dispatchPointerMove = (
  clientX: number,
  clientY: number,
  type = 'mouse',
) => {
  const event = new MouseEvent('pointermove', { clientX, clientY });
  Object.defineProperty(event, 'pointerType', { value: type });
  window.dispatchEvent(event);
};

const dispatchTouch = (
  type: string,
  touches: { clientX: number; clientY: number }[],
) => {
  const event = new Event(type);
  Object.defineProperty(event, 'touches', { value: touches });
  window.dispatchEvent(event);
};

describe('useStagePointer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useStageStore.setState(createInitialStageValues());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderPointer = () => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => RECT;
    return renderHook(() => useStagePointer({ current: element }));
  };

  it('publishes the mouse over the stage and releases it on leave', () => {
    renderPointer();

    act(() => dispatchPointerMove(400, 300));
    expect(pointer()).toEqual({ x: 0, y: 0, isActive: true });

    act(() => {
      document.documentElement.dispatchEvent(new Event('pointerleave'));
    });
    expect(pointer().isActive).toBe(false);
  });

  it('follows a finger and lets go shortly after it lifts', () => {
    renderPointer();

    act(() => dispatchPointerMove(0, 0, 'touch'));
    expect(pointer().isActive).toBe(false);

    act(() => dispatchTouch('touchmove', [{ clientX: 800, clientY: 0 }]));
    expect(pointer()).toEqual({ x: 1, y: 1, isActive: true });

    act(() => dispatchTouch('touchend', []));
    act(() => {
      vi.advanceTimersByTime(TOUCH_RELEASE_MS - 1);
    });
    expect(pointer().isActive).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(pointer().isActive).toBe(false);
  });

  it('stops listening on unmount', () => {
    const { unmount } = renderPointer();
    unmount();

    act(() => dispatchPointerMove(400, 300));
    expect(pointer().isActive).toBe(false);
  });
});
