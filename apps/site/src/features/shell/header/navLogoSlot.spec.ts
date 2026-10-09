import { afterEach, describe, expect, it } from 'vitest';

import { measureNavLogoSlot } from './navLogoSlot';

const DESKTOP_CELL_PX = 5;
const MOBILE_CELL_PX = 4;

const withRect = (element: HTMLElement, rect: Partial<DOMRect>) => {
  element.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 0, height: 0, ...rect }) as DOMRect;
  return element;
};

const mountLogo = (headerTop: number) => {
  const header = withRect(document.createElement('header'), {
    top: headerTop,
  });
  const desktop = document.createElement('span');
  const mobile = document.createElement('span');
  header.append(desktop, mobile);
  document.body.append(header);
  return { desktop, mobile };
};

describe('measureNavLogoSlot', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('measures the visible variant with its cell size', () => {
    const { desktop, mobile } = mountLogo(0);
    withRect(mobile, { left: 115.5, top: 22, width: 144 });

    expect(
      measureNavLogoSlot([
        { element: desktop, cellPx: DESKTOP_CELL_PX },
        { element: mobile, cellPx: MOBILE_CELL_PX },
      ]),
    ).toEqual({ x: 115.5, y: 22, cellPx: MOBILE_CELL_PX });
  });

  it('measures the top relative to a header still slid off screen', () => {
    const { desktop } = mountLogo(-64);
    withRect(desktop, { left: 630, top: -64 + 19.5, width: 180 });

    expect(
      measureNavLogoSlot([{ element: desktop, cellPx: DESKTOP_CELL_PX }]),
    ).toEqual({ x: 630, y: 19.5, cellPx: DESKTOP_CELL_PX });
  });

  it('returns null when no variant is laid out', () => {
    const { desktop, mobile } = mountLogo(0);

    expect(
      measureNavLogoSlot([
        { element: desktop, cellPx: DESKTOP_CELL_PX },
        { element: mobile, cellPx: MOBILE_CELL_PX },
        { element: null, cellPx: MOBILE_CELL_PX },
      ]),
    ).toBeNull();
  });
});
