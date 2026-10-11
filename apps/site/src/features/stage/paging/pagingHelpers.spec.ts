import { describe, expect, it } from 'vitest';

import {
  canWheelScrollInside,
  isNativeContactScroll,
  pageScrollTop,
  resolveScrollPage,
  toStagePage,
} from './pagingHelpers';

const PAGE_HEIGHT = 800;

describe('resolveScrollPage', () => {
  it('targets the nearest snap anchor', () => {
    expect(resolveScrollPage(0, PAGE_HEIGHT)).toBe(0);
    expect(resolveScrollPage(399, PAGE_HEIGHT)).toBe(0);
    expect(resolveScrollPage(400, PAGE_HEIGHT)).toBe(1);
    expect(resolveScrollPage(3200, PAGE_HEIGHT)).toBe(4);
  });

  it('counts the contact section as page 5 and never goes past it', () => {
    expect(resolveScrollPage(4000, PAGE_HEIGHT)).toBe(5);
    expect(resolveScrollPage(9000, PAGE_HEIGHT)).toBe(5);
    expect(resolveScrollPage(-50, PAGE_HEIGHT)).toBe(0);
  });

  it('stays on the first page before the stage is measured', () => {
    expect(resolveScrollPage(500, 0)).toBe(0);
  });
});

describe('toStagePage', () => {
  it('keeps stage pages and maps contact to the last stage page', () => {
    expect(toStagePage(2)).toBe(2);
    expect(toStagePage(5)).toBe(4);
  });
});

describe('pageScrollTop', () => {
  it('puts each page one stage height apart and clamps the range', () => {
    expect(pageScrollTop(3, PAGE_HEIGHT)).toBe(2400);
    expect(pageScrollTop(9, PAGE_HEIGHT)).toBe(4000);
    expect(pageScrollTop(-1, PAGE_HEIGHT)).toBe(0);
  });
});

describe('isNativeContactScroll', () => {
  it('is false anywhere on the stage', () => {
    expect(isNativeContactScroll(3200, PAGE_HEIGHT, 1)).toBe(false);
  });

  it('scrolls down natively inside contact', () => {
    expect(isNativeContactScroll(4000, PAGE_HEIGHT, 1)).toBe(true);
  });

  it('pages up from the top of contact but scrolls natively further down', () => {
    expect(isNativeContactScroll(4000, PAGE_HEIGHT, -1)).toBe(false);
    expect(isNativeContactScroll(4100, PAGE_HEIGHT, -1)).toBe(true);
  });
});

describe('canWheelScrollInside', () => {
  function scrollBox(scrollTop: number) {
    const box = document.createElement('div');
    box.setAttribute('data-wheel-scroll', '');
    const child = document.createElement('button');
    box.append(child);
    Object.defineProperties(box, {
      scrollTop: { value: scrollTop },
      clientHeight: { value: 300 },
      scrollHeight: { value: 900 },
    });
    return child;
  }

  it('scrolls a marked box until it reaches its end in the wheel direction', () => {
    expect(canWheelScrollInside(scrollBox(0), 40)).toBe(true);
    expect(canWheelScrollInside(scrollBox(0), -40)).toBe(false);
    expect(canWheelScrollInside(scrollBox(300), -40)).toBe(true);
    expect(canWheelScrollInside(scrollBox(600), 40)).toBe(false);
    expect(canWheelScrollInside(scrollBox(300), 0)).toBe(false);
  });

  it('leaves the wheel to the page outside a marked box', () => {
    expect(canWheelScrollInside(document.createElement('div'), 40)).toBe(false);
    expect(canWheelScrollInside(null, 40)).toBe(false);
  });
});
