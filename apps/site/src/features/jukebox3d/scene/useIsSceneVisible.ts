import { bindFrameLoopVisibility } from 'lib/frameLoop';
import { type RefObject, useEffect, useState } from 'react';

// Whether the element is on screen in a visible tab: the same rule that pauses the 2D frame
// loops, here driving the R3F frameloop.
export function useIsSceneVisible(
  elementRef: RefObject<Element | null>,
): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    let isTabVisible = true;
    let isOnScreen = true;
    const sync = () => setIsVisible(isTabVisible && isOnScreen);

    return bindFrameLoopVisibility(
      {
        setIsTabVisible: (isVisibleTab) => {
          isTabVisible = isVisibleTab;
          sync();
        },
        setIsOnScreen: (isVisibleOnScreen) => {
          isOnScreen = isVisibleOnScreen;
          sync();
        },
      },
      element,
    );
  }, [elementRef]);

  return isVisible;
}
