import {
  CONTACT_NATIVE_SCROLL_TOLERANCE_PX,
  CONTACT_PAGE,
  LAST_STAGE_PAGE,
} from 'constants/stage';
import { clamp } from 'lib/math';

const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"]';

// Input inside a dialog belongs to the dialog, never to the page behind it.
export function isInsideDialog(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(DIALOG_SELECTOR) !== null;
}

// The page whose snap anchor is nearest to the scroll position, 0..5 (5 is contact).
export function resolveScrollPage(scrollY: number, pageHeight: number): number {
  if (pageHeight <= 0) return 0;
  return clamp(Math.round(scrollY / pageHeight), 0, CONTACT_PAGE);
}

// The stage keeps showing its last page while the contact section scrolls over it.
export function toStagePage(page: number): number {
  return Math.min(page, LAST_STAGE_PAGE);
}

export function pageScrollTop(page: number, pageHeight: number): number {
  return clamp(page, 0, CONTACT_PAGE) * pageHeight;
}

// Inside the contact section the page scrolls natively, except for the move from its very
// top back up into the stage.
export function isNativeContactScroll(
  scrollY: number,
  pageHeight: number,
  direction: number,
): boolean {
  if (resolveScrollPage(scrollY, pageHeight) < CONTACT_PAGE) return false;
  return (
    direction > 0 ||
    scrollY > CONTACT_PAGE * pageHeight + CONTACT_NATIVE_SCROLL_TOLERANCE_PX
  );
}
