import {
  VENUE_SCRAMBLE_STEP_CHARS,
  VENUE_SCRAMBLE_STEP_MS,
} from 'constants/venues';
import { useReducedMotion } from 'hooks';
import { useEffect, useState } from 'react';

import { scrambleText } from './venueScramble';

type ScrambleState = {
  text: string;
  resolvedCount: number;
  shown: string;
};

const resolvedState = (text: string): ScrambleState => ({
  text,
  resolvedCount: [...text].length,
  shown: text,
});

// The text as the band shows it: a new text starts fully scrambled and resolves left to right,
// a few characters per step. The first text (and every text under reduced motion) shows as it
// is, so the prerendered page and its hydration agree.
export function useVenueScramble(text: string): string {
  const isReducedMotion = useReducedMotion();
  const [state, setState] = useState(() => resolvedState(text));

  if (state.text !== text) {
    setState(
      isReducedMotion
        ? resolvedState(text)
        : { text, resolvedCount: 0, shown: scrambleText(text, 0) },
    );
  }

  const isResolving =
    state.text === text && state.resolvedCount < [...text].length;

  useEffect(() => {
    if (!isResolving) return undefined;
    const timer = setTimeout(
      () =>
        setState((current) => {
          const resolvedCount =
            current.resolvedCount + VENUE_SCRAMBLE_STEP_CHARS;
          return {
            ...current,
            resolvedCount,
            shown: scrambleText(current.text, resolvedCount),
          };
        }),
      VENUE_SCRAMBLE_STEP_MS,
    );
    return () => clearTimeout(timer);
  }, [isResolving, state]);

  return state.text === text ? state.shown : text;
}
