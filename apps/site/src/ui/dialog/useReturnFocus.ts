import { useCallback, useRef } from 'react';

// Radix returns focus to its own Trigger part on close. A controlled dialog opened from
// anywhere has no Trigger, so the element focused when it opened is remembered instead.
export function useReturnFocus() {
  const returnTargetRef = useRef<HTMLElement | null>(null);

  const handleOpenAutoFocus = useCallback(() => {
    const { activeElement } = document;
    returnTargetRef.current =
      activeElement instanceof HTMLElement ? activeElement : null;
  }, []);

  const handleCloseAutoFocus = useCallback((event: Event) => {
    event.preventDefault();
    returnTargetRef.current?.focus();
    returnTargetRef.current = null;
  }, []);

  return { handleOpenAutoFocus, handleCloseAutoFocus };
}
