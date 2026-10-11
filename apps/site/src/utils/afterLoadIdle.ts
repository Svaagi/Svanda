// Runs `callback` once the page has loaded and the main thread is idle (or `timeoutMs` after
// load at the latest), so deferred work does not compete with the first paint and hydration.
// Returns a cancel function. Safari has no requestIdleCallback; there a timeout stands in.
export function afterLoadIdle(
  callback: () => void,
  timeoutMs: number,
): () => void {
  let idleId: number | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const scheduleIdle = () => {
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(callback, { timeout: timeoutMs });
    } else {
      timeoutId = setTimeout(callback, 0);
    }
  };

  if (document.readyState === 'complete') scheduleIdle();
  else window.addEventListener('load', scheduleIdle, { once: true });

  return () => {
    window.removeEventListener('load', scheduleIdle);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  };
}
