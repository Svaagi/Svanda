import type { NavLogoSlot } from 'features/stage';

type LogoVariant = {
  element: HTMLElement | null;
  cellPx: number;
};

// Only the variant the media query shows has a size. Its top is taken relative to the header,
// so the slot is where the logo rests even while the intro still holds the header off screen.
export function measureNavLogoSlot(
  variants: readonly LogoVariant[],
): NavLogoSlot | null {
  for (const { element, cellPx } of variants) {
    const rect = element?.getBoundingClientRect();
    if (!element || !rect?.width) continue;
    const headerTop = element.closest('header')?.getBoundingClientRect().top;
    return { x: rect.left, y: rect.top - (headerTop ?? 0), cellPx };
  }
  return null;
}
