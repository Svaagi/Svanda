import { CONTACT_PAGE } from 'constants/stage';
import { clamp } from 'lib/math';

import { isInsideDialog } from './pagingHelpers';

const SPACE_KEY = ' ';

// Keys typed into these keep their native meaning.
const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
// Space activates these, so it must not turn the page.
const ACTIVATABLE_SELECTOR =
  'a[href], button, summary, [role="button"], [role="switch"], [role="checkbox"], [role="radio"], [role="option"], [role="tab"]';

type PagingKey = {
  key: string;
  shiftKey: boolean;
};

// The page a paging key moves to from `currentPage`, or null when the key does not page.
export function resolveKeyPage(
  { key, shiftKey }: PagingKey,
  currentPage: number,
): number | null {
  switch (key) {
    case 'PageDown':
    case 'ArrowDown':
      return clamp(currentPage + 1, 0, CONTACT_PAGE);
    case 'PageUp':
    case 'ArrowUp':
      return clamp(currentPage - 1, 0, CONTACT_PAGE);
    case SPACE_KEY:
      return clamp(currentPage + (shiftKey ? -1 : 1), 0, CONTACT_PAGE);
    case 'Home':
      return 0;
    case 'End':
      return CONTACT_PAGE;
    default:
      return null;
  }
}

export function isPagingKeyTarget(target: EventTarget | null, key: string) {
  if (!(target instanceof Element)) return true;
  if (target.closest(EDITABLE_SELECTOR) || isInsideDialog(target)) {
    return false;
  }
  return key !== SPACE_KEY || !target.closest(ACTIVATABLE_SELECTOR);
}
