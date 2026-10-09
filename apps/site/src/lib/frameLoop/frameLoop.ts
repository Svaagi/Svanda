export type FrameLoop = {
  setIsTabVisible: (isVisible: boolean) => void;
  setIsOnScreen: (isOnScreen: boolean) => void;
  stop: () => void;
};

// One requestAnimationFrame loop that only runs while its scene is on screen in a visible
// tab: a paused loop requests no frames at all.
export function createFrameLoop(onFrame: (nowMs: number) => void): FrameLoop {
  let frameId = 0;
  let isTabVisible = true;
  let isOnScreen = true;
  let isStopped = false;

  const tick = (nowMs: number) => {
    frameId = requestAnimationFrame(tick);
    onFrame(nowMs);
  };

  const sync = () => {
    const shouldRun = isTabVisible && isOnScreen && !isStopped;
    if (shouldRun && !frameId) frameId = requestAnimationFrame(tick);
    if (!shouldRun && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  sync();
  return {
    setIsTabVisible: (isVisible) => {
      isTabVisible = isVisible;
      sync();
    },
    setIsOnScreen: (isVisibleOnScreen) => {
      isOnScreen = isVisibleOnScreen;
      sync();
    },
    stop: () => {
      isStopped = true;
      sync();
    },
  };
}

// Pauses the loop in a background tab and while the element is scrolled out of view.
// Browsers without IntersectionObserver count the element as always on screen.
export function bindFrameLoopVisibility(
  loop: FrameLoop,
  element: Element,
): () => void {
  const handleVisibilityChange = () =>
    loop.setIsTabVisible(document.visibilityState !== 'hidden');
  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const observer =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
          if (entry) loop.setIsOnScreen(entry.isIntersecting);
        });
  observer?.observe(element);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    observer?.disconnect();
  };
}
