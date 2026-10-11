import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { type Accent, ACCENT_ATTRIBUTE } from 'constants/accent';
import { type Theme, THEME_STORAGE_KEY } from 'constants/theme';

// WCAG 2.2 AA, the target in codingStandards.md, plus the levels it builds on.
const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
] as const;

// Stores a theme choice the way the theme toggle does, before any page script runs.
export async function presetTheme(page: Page, theme: Theme) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [THEME_STORAGE_KEY, theme] as const,
  );
}

export async function forceAccent(page: Page, accent: Accent) {
  await page.evaluate(
    ([attribute, value]) =>
      document.documentElement.setAttribute(attribute, value),
    [ACCENT_ATTRIBUTE, accent] as const,
  );
}

type AxeScanOptions = {
  // Limits the scan to these axe rules (e.g. only colour contrast).
  rules?: readonly string[];
};

// Runs axe on what the page shows now and returns one readable line per failing node, so a
// failed assertion names the rule, the element and the reason.
export async function axeViolations(
  page: Page,
  { rules }: AxeScanOptions = {},
) {
  const builder = new AxeBuilder({ page });
  // Both set axe's `runOnly`, so a rule list replaces the tag filter rather than narrowing it.
  if (rules) builder.withRules([...rules]);
  else builder.withTags([...WCAG_TAGS]);
  const { violations } = await builder.analyze();

  return violations.flatMap(({ id, nodes }) =>
    nodes.map(
      ({ target, failureSummary }) =>
        `${id} ${target.join(' ')}: ${failureSummary ?? ''}`,
    ),
  );
}

// Waits for running CSS transitions and animations to finish: axe samples colours as they
// are, so a dialog still fading in would report a contrast it never shows at rest. Infinite
// animations are left alone.
export async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}
