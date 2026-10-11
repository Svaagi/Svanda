import { expect, type Page, test } from './fixtures';

const expectCopyInsideViewport = async (page: Page, testId: string) => {
  const box = await page.getByTestId(testId).boundingBox();
  const size = page.viewportSize();
  expect(box).not.toBeNull();
  expect(size).not.toBeNull();
  if (!box || !size) return;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(size.width);
};

test.describe('karaoke and jukebox pages', () => {
  test('the karaoke page shows its copy in the layout the viewport asks for', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/en#karaoke');

    const panel = page.getByTestId('product-panel-karaoke');
    await expect(page.getByTestId('page-layer-karaoke')).toHaveAttribute(
      'data-active',
      'true',
    );
    // Portrait (the phone project) keeps the title for screen readers only.
    const titleBox = await page
      .getByTestId('product-panel-karaoke-title')
      .boundingBox();
    expect(titleBox).not.toBeNull();
    if (isMobile) expect(titleBox?.width).toBeLessThanOrEqual(1);
    else expect(titleBox?.width).toBeGreaterThan(1);
    await expect(
      panel.getByRole('heading', { level: 2, name: 'KARAOKE' }),
    ).toBeVisible();
    await expect(page.getByTestId('product-panel-karaoke-body')).toBeVisible();
    await expectCopyInsideViewport(page, 'product-panel-karaoke-body');
    await expect(page.locator('html')).not.toHaveAttribute('data-accent');
  });

  test('the jukebox page switches the accent and cursor to magenta', async ({
    page,
  }) => {
    await page.goto('/sk#jukebox');

    await expect(page.getByTestId('page-layer-jukebox')).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(page.locator('html')).toHaveAttribute(
      'data-accent',
      'magenta',
    );
    await expect(page.locator('html')).toHaveAttribute(
      'data-cursor',
      'magenta',
    );
    await expectCopyInsideViewport(page, 'product-panel-jukebox-body');

    await page.goto('/en#custom');
    await expect(page.locator('html')).not.toHaveAttribute('data-accent');
    await expect(page.locator('html')).toHaveAttribute('data-cursor', 'on');
  });
});
