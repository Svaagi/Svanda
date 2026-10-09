import type { MouseEvent } from 'react';

// A modified or non-primary click asks the browser for a new tab or window; leave it alone.
export function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
