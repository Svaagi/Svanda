import {
  INTRO_ATTRIBUTE,
  INTRO_REVEAL_VARS,
  INTRO_ROOT_REVEAL_VARS,
} from 'constants/intro';

import type { IntroRevealVars } from './introTimeline';

// Writes the root reveal variables on <html> only when a value changes: the style
// recalculation is the expensive part, not the comparison.
export function createRevealVarWriter(root: HTMLElement) {
  const written = new Map<string, string>();
  return {
    write: (vars: IntroRevealVars) => {
      for (const name of INTRO_ROOT_REVEAL_VARS) {
        if (written.get(name) === vars[name]) continue;
        root.style.setProperty(name, vars[name]);
        written.set(name, vars[name]);
      }
    },
    // Back to the final values in global.css.
    clear: () => {
      INTRO_REVEAL_VARS.forEach((name) => root.style.removeProperty(name));
      written.clear();
    },
  };
}

export function setIntroAttribute(root: HTMLElement, value: string | null) {
  if (value === null) root.removeAttribute(INTRO_ATTRIBUTE);
  else root.setAttribute(INTRO_ATTRIBUTE, value);
}
