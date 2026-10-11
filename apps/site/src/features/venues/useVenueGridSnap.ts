import { useStageStore } from 'features/stage';
import { type RefObject, useEffect, useState } from 'react';

import {
  type FrameSnap,
  type GridLines,
  type HeadingSnap,
  snapFrame,
  snapHeading,
} from './gridSnap';

type GridSnapRefs = {
  // The section fills the stage viewport: its top left is the stage origin.
  section: RefObject<HTMLElement | null>;
  heading: RefObject<HTMLElement | null>;
  // The untransformed box the frame sits at the top of, above the tabs.
  frameHost: RefObject<HTMLElement | null>;
  tabs: RefObject<HTMLElement | null>;
};

export type VenueGridSnap = {
  frame: FrameSnap | null;
  heading: HeadingSnap | null;
};

const UNSNAPPED: VenueGridSnap = { frame: null, heading: null };

const isSameRecord = <T extends Record<string, number>>(
  first: T | null,
  second: T | null,
) =>
  first === second ||
  (first !== null &&
    second !== null &&
    Object.keys(first).every((key) => first[key] === second[key]));

const pixels = (value: string) => Number.parseFloat(value) || 0;

const horizontalPadding = (element: HTMLElement) => {
  const { paddingLeft, paddingRight } = getComputedStyle(element);
  return pixels(paddingLeft) + pixels(paddingRight);
};

// Below the frame: the gap to the tabs, the tabs and the page's bottom padding.
const heightBelowFrame = (
  section: HTMLElement,
  frameHost: HTMLElement,
  tabs: HTMLElement,
) =>
  pixels(getComputedStyle(frameHost).rowGap) +
  tabs.offsetHeight +
  pixels(getComputedStyle(section).paddingBottom);

function measureSnap(
  {
    section,
    heading,
    frameHost,
    tabs,
  }: Record<keyof GridSnapRefs, HTMLElement>,
  grid: GridLines,
  isPortrait: boolean,
): VenueGridSnap {
  const origin = section.getBoundingClientRect();
  const host = frameHost.getBoundingClientRect();
  const head = heading.getBoundingClientRect();
  const stageWidth = section.clientWidth;
  return {
    frame: snapFrame({
      grid,
      left: host.left - origin.left,
      top: host.top - origin.top,
      availableWidth: frameHost.clientWidth,
      stageWidth,
      stageHeight: section.clientHeight,
      reserveBelow: heightBelowFrame(section, frameHost, tabs),
      isPortrait,
    }),
    heading: snapHeading({
      grid,
      left: head.left - origin.left,
      top: head.top - origin.top,
      contentWidth: stageWidth - horizontalPadding(section),
      stageWidth,
      isPortrait,
    }),
  };
}

// Snaps the venue frame and heading onto the hero background grid. Measured on mount, when
// the grid or orientation changes and when the boxes resize (each snap moves the next box,
// so it settles over a frame or two), never per animation frame. Null parts until the grid
// is known: the CSS fallback layout shows meanwhile.
export function useVenueGridSnap(refs: GridSnapRefs): VenueGridSnap {
  const grid = useStageStore((state) => state.grid);
  const isPortrait = useStageStore((state) => state.viewport.isPortrait);
  const [snap, setSnap] = useState<VenueGridSnap>(UNSNAPPED);
  const { section, heading, frameHost, tabs } = refs;

  useEffect(() => {
    const sectionElement = section.current;
    const headingElement = heading.current;
    const frameHostElement = frameHost.current;
    const tabsElement = tabs.current;
    if (
      !sectionElement ||
      !headingElement ||
      !frameHostElement ||
      !tabsElement
    ) {
      return undefined;
    }
    if (grid.cell <= 0) return undefined;
    const measured = {
      section: sectionElement,
      heading: headingElement,
      frameHost: frameHostElement,
      tabs: tabsElement,
    };

    const measure = () => {
      const next = measureSnap(measured, grid, isPortrait);
      setSnap((current) =>
        isSameRecord(current.frame, next.frame) &&
        isSameRecord(current.heading, next.heading)
          ? current
          : next,
      );
    };
    measure();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    Object.values(measured).forEach((element) => observer?.observe(element));
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [grid, isPortrait, section, heading, frameHost, tabs]);

  return grid.cell > 0 ? snap : UNSNAPPED;
}
