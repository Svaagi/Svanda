import type { CSSProperties } from 'react';

// The fade itself is CSS (`--sv-menu` changes every intro frame, React must not re-render);
// each item only carries its own start point.
export function navRevealStyle(revealDelay: number): CSSProperties {
  return { '--nav-reveal-delay': revealDelay } as CSSProperties;
}
