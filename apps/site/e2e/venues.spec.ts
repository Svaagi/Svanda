import { expect, type Page, test } from './fixtures';

const frame = (page: Page) => page.getByTestId('venue-frame');
const tab = (page: Page, venueId: string) =>
  page.getByTestId(`venue-tabs-${venueId}`);
const strip = (page: Page, venueId: string) =>
  page.getByTestId(`venue-frame-slide-${venueId}-strip`);

const openVenues = async (page: Page, path = '/en#venues') => {
  await page.goto(path);
  await expect(page.getByTestId('page-layer-venues')).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(frame(page)).toHaveAttribute('data-snapped', 'true');
};

// The frame's box on the stage grid: its edges must fall on whole cells from the grid origin
// (the stage viewport's top left, which sits at the top left of the page).
const expectFrameOnGrid = async (page: Page) => {
  await expect
    .poll(async () =>
      frame(page).evaluate((element) => {
        const cell = Number.parseFloat(
          element.style.getPropertyValue('--venue-cell'),
        );
        const stage = element.closest('[data-testid="stage-shell-viewport"]');
        const origin = stage?.getBoundingClientRect() ?? { left: 0, top: 0 };
        const box = element.getBoundingClientRect();
        const offGrid = (value: number) => {
          const remainder = Math.abs(value % cell);
          return Math.min(remainder, cell - remainder);
        };
        return Math.max(
          offGrid(box.left - origin.left),
          offGrid(box.top - origin.top),
          offGrid(box.width),
          offGrid(box.height),
        );
      }),
    )
    .toBeLessThan(0.5);
};

test.describe('venues page', () => {
  test('the frame snaps to the background grid at any viewport', async ({
    page,
    isMobile,
  }) => {
    await openVenues(page);
    await expectFrameOnGrid(page);

    await page.setViewportSize(
      isMobile ? { width: 360, height: 740 } : { width: 1111, height: 777 },
    );
    await expectFrameOnGrid(page);
  });

  test('tabs and frame keys switch venues and photos without paging the stage', async ({
    page,
  }) => {
    await openVenues(page);

    await tab(page, 'lemon').focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 'arcadeBar')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(tab(page, 'arcadeBar')).toBeFocused();
    await page.keyboard.press('End');
    await expect(tab(page, 'pivniceUMostu')).toBeFocused();

    await frame(page).focus();
    await page.keyboard.press('ArrowRight');
    await expect(strip(page, 'pivniceUMostu')).toHaveAttribute(
      'data-photo-index',
      '1',
    );
    await page.keyboard.press('ArrowDown');
    await expect(tab(page, 'lemon')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('venue-frame-track')).toHaveAttribute(
      'data-venue-index',
      '0',
    );
    await expect(page.getByTestId('page-layer-venues')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  test('chevrons, dots and a swipe navigate', async ({ page }) => {
    await openVenues(page);

    await page.getByTestId('venue-frame-next').click();
    await expect(tab(page, 'arcadeBar')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page.getByTestId('venue-frame-previous').click();
    await expect(tab(page, 'lemon')).toHaveAttribute('aria-selected', 'true');

    // The venue track slides for 0.7 s; a click scrolls the page if its target is still moving.
    const dot = page.getByTestId('venue-frame-slide-lemon-dot-3');
    await expect(dot).toBeInViewport({ ratio: 1 });
    await dot.click();
    await expect(strip(page, 'lemon')).toHaveAttribute('data-photo-index', '2');

    const box = await frame(page).boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 8 });
    await page.mouse.up();
    await expect(strip(page, 'lemon')).toHaveAttribute('data-photo-index', '3');
  });

  test('photos load lazily with explicit dimensions and a localized date', async ({
    page,
  }) => {
    await openVenues(page, '/sk#venues');

    const photo = page.getByTestId('venue-frame-slide-lemon-photo-1');
    await expect(photo).toHaveAttribute('loading', 'lazy');
    await expect(photo).toHaveAttribute('width', /\d+/);
    await expect(photo).toHaveAttribute('height', /\d+/);
    await expect
      .poll(() =>
        photo.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth,
        ),
      )
      .toBeGreaterThan(0);
    await expect(page.getByTestId('venue-frame-slide-lemon-place')).toHaveText(
      'Brno · 20. 9. 2026',
    );
  });
});
