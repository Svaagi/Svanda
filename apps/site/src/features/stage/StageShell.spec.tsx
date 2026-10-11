import { act, fireEvent, render, screen } from '@testing-library/react';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import {
  STAGE_PAGE_IDS,
  VP_CSS_PROPERTY,
  VP_TWEEN_DURATION_MS,
  WHEEL_TURN_INTERVAL_MS,
} from 'constants/stage';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StageShell } from './StageShell';
import { createInitialStageValues, useStageStore } from './stageStore';

const PAGE_HEIGHT = 800;
const PAGE_WIDTH = 1280;

const scrollTo = vi.fn();

const setScrollY = (scrollY: number) => {
  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    configurable: true,
  });
};

const scrollToPage = (page: number) => {
  act(() => {
    setScrollY(page * PAGE_HEIGHT);
    fireEvent.scroll(window);
  });
};

const advanceTime = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const renderStage = () => render(<StageShell>{null}</StageShell>);

const rootVp = () =>
  document.documentElement.style.getPropertyValue(VP_CSS_PROPERTY);

describe('StageShell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useStageStore.setState(createInitialStageValues());
    setScrollY(0);
    scrollTo.mockReset();
    vi.stubGlobal('scrollTo', scrollTo);
    vi.stubGlobal('matchMedia', createMatchMediaMock().matchMedia);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
      PAGE_HEIGHT,
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
      PAGE_WIDTH,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders a snap anchor with a real id for every page', () => {
    renderStage();

    STAGE_PAGE_IDS.forEach((pageId) => {
      expect(
        screen.getByTestId(`stage-shell-anchor-${pageId}`),
      ).toHaveAttribute('id', pageId);
    });
  });

  it('puts the anchors before the viewport, so a deep link Tabs into its page', () => {
    renderStage();
    const viewport = screen.getByTestId('stage-shell-viewport');

    STAGE_PAGE_IDS.forEach((pageId) => {
      expect(
        screen
          .getByTestId(`stage-shell-anchor-${pageId}`)
          .compareDocumentPosition(viewport),
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  it('measures the viewport into the store', () => {
    renderStage();

    expect(useStageStore.getState().viewport).toEqual({
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      isMobile: false,
      isPortrait: false,
    });
  });

  it('lands directly on the page of a deep link', () => {
    setScrollY(4 * PAGE_HEIGHT);
    renderStage();

    expect(useStageStore.getState()).toMatchObject({ page: 4, vp: 4 });
    expect(rootVp()).toBe('4.0000');
  });

  it('tweens vp to the scrolled page and publishes --sv-vp', () => {
    renderStage();

    scrollToPage(1);
    expect(useStageStore.getState().page).toBe(1);

    advanceTime(VP_TWEEN_DURATION_MS / 2);
    const midVp = useStageStore.getState().vp;
    expect(midVp).toBeGreaterThan(0);
    expect(midVp).toBeLessThan(1);

    advanceTime(VP_TWEEN_DURATION_MS);
    expect(useStageStore.getState().vp).toBe(1);
    expect(rootVp()).toBe('1.0000');
  });

  it('keeps the last stage page in view while contact scrolls', () => {
    renderStage();

    scrollToPage(5);
    advanceTime(VP_TWEEN_DURATION_MS * 2);

    expect(useStageStore.getState()).toMatchObject({ page: 5, vp: 4 });
  });

  it('changes pages instantly with reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      createMatchMediaMock([REDUCED_MOTION_QUERY]).matchMedia,
    );
    renderStage();

    scrollToPage(3);

    expect(useStageStore.getState().vp).toBe(3);
  });

  it('ignores scrolling until the stage is ready, then catches up', () => {
    useStageStore.setState({ isReady: false });
    renderStage();

    scrollToPage(2);
    expect(useStageStore.getState().page).toBe(0);

    act(() => useStageStore.getState().setIsReady(true));
    expect(useStageStore.getState().page).toBe(2);
  });

  describe('keyboard paging', () => {
    it('moves exactly one page per key press', () => {
      renderStage();
      setScrollY(PAGE_HEIGHT);

      fireEvent.keyDown(window, { key: 'PageDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown', repeat: true });

      expect(scrollTo).toHaveBeenCalledTimes(1);
      expect(scrollTo).toHaveBeenCalledWith({
        top: 2 * PAGE_HEIGHT,
        behavior: 'smooth',
      });
    });

    it('jumps with Home and End and scrolls instantly with reduced motion', () => {
      vi.stubGlobal(
        'matchMedia',
        createMatchMediaMock([REDUCED_MOTION_QUERY]).matchMedia,
      );
      renderStage();
      setScrollY(2 * PAGE_HEIGHT);

      fireEvent.keyDown(window, { key: 'End' });
      fireEvent.keyDown(window, { key: 'Home' });

      expect(scrollTo).toHaveBeenNthCalledWith(1, {
        top: 5 * PAGE_HEIGHT,
        behavior: 'instant',
      });
      expect(scrollTo).toHaveBeenNthCalledWith(2, {
        top: 0,
        behavior: 'instant',
      });
    });

    it('leaves modified keys and the contact section to the browser', () => {
      renderStage();

      fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      setScrollY(5 * PAGE_HEIGHT + PAGE_HEIGHT / 4);
      const isNotCancelled = fireEvent.keyDown(window, { key: 'ArrowUp' });

      expect(isNotCancelled).toBe(true);
      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('swallows paging keys until the stage is ready', () => {
      useStageStore.setState({ isReady: false });
      renderStage();

      const isNotCancelled = fireEvent.keyDown(window, { key: 'PageDown' });

      expect(isNotCancelled).toBe(false);
      expect(scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('wheel paging', () => {
    it('turns one page per gesture and waits between turns', () => {
      renderStage();
      // Starts past the gate's silence window, like any real first wheel.
      advanceTime(WHEEL_TURN_INTERVAL_MS);

      fireEvent.wheel(window, { deltaY: 120 });
      advanceTime(50);
      fireEvent.wheel(window, { deltaY: 120 });
      expect(scrollTo).toHaveBeenCalledTimes(1);

      setScrollY(PAGE_HEIGHT);
      advanceTime(WHEEL_TURN_INTERVAL_MS);
      fireEvent.wheel(window, { deltaY: 120 });

      expect(scrollTo).toHaveBeenCalledTimes(2);
      expect(scrollTo).toHaveBeenLastCalledWith({
        top: 2 * PAGE_HEIGHT,
        behavior: 'smooth',
      });
    });

    it('leaves wheels that something else already handled alone', () => {
      renderStage();
      const scroller = document.createElement('div');
      document.body.append(scroller);
      scroller.addEventListener('wheel', (event) => event.preventDefault());

      fireEvent.wheel(scroller, { deltaY: 120 });

      expect(scrollTo).not.toHaveBeenCalled();
      scroller.remove();
    });

    it('lets wheels inside a dialog scroll the dialog, not the stage', () => {
      renderStage();
      const dialog = document.createElement('div');
      dialog.setAttribute('role', 'dialog');
      document.body.append(dialog);

      expect(fireEvent.wheel(dialog, { deltaY: 120 })).toBe(true);
      expect(scrollTo).not.toHaveBeenCalled();
      dialog.remove();
    });

    it('cancels the native scroll on the stage but not inside contact', () => {
      renderStage();

      expect(fireEvent.wheel(window, { deltaY: 120 })).toBe(false);

      setScrollY(5 * PAGE_HEIGHT);
      expect(fireEvent.wheel(window, { deltaY: 120 })).toBe(true);
    });
  });

  it('cleans up its listeners and --sv-vp on unmount', () => {
    const { unmount } = renderStage();
    unmount();

    setScrollY(PAGE_HEIGHT);
    fireEvent.keyDown(window, { key: 'PageDown' });

    expect(scrollTo).not.toHaveBeenCalled();
    expect(rootVp()).toBe('');
  });
});
