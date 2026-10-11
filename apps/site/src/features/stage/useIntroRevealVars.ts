import { type RefObject, useEffect } from 'react';

import { useStageStore } from './stageStore';
import type { IntroReveal } from './stageTypes';

function applyRevealVars(
  element: HTMLElement,
  names: readonly string[],
  reveal: IntroReveal | null,
) {
  names.forEach((name) => {
    const value = reveal?.[name];
    if (value === undefined) element.style.removeProperty(name);
    else if (element.style.getPropertyValue(name) !== value)
      element.style.setProperty(name, value);
  });
}

// Copies the intro's per-frame reveal variables `names` onto `ref`'s element (no re-render),
// so a ramp restyles only that element's subtree. Without an intro the element inherits the
// final values from <html>.
export function useIntroRevealVars(
  ref: RefObject<HTMLElement | null>,
  names: readonly string[],
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    applyRevealVars(element, names, useStageStore.getState().introReveal);
    const unsubscribe = useStageStore.subscribe((state, previous) => {
      if (state.introReveal !== previous.introReveal)
        applyRevealVars(element, names, state.introReveal);
    });
    return () => {
      unsubscribe();
      applyRevealVars(element, names, null);
    };
  }, [ref, names]);
}
