import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MOBILE_BREAKPOINT_PX } from 'constants/breakpoints';
import { describe, expect, it } from 'vitest';

// jsdom replaces the global URL, so build the path from the plain file URL string.
const HEADER_CSS = join(
  dirname(fileURLToPath(import.meta.url)),
  'header.module.css',
);
const MIN_WIDTH_QUERY = /@media \(min-width: (\d+)px\)/g;

// A media query cannot read a custom property, so the header CSS repeats the breakpoint. This
// keeps it equal to the constant the stage (and the intro swarm) use for `isMobile`.
describe('nav breakpoint', () => {
  it('switches the header layout at MOBILE_BREAKPOINT_PX', () => {
    const css = readFileSync(HEADER_CSS, 'utf8');
    const breakpoints = Array.from(css.matchAll(MIN_WIDTH_QUERY), (match) =>
      Number(match[1]),
    );

    expect(breakpoints).toEqual([MOBILE_BREAKPOINT_PX]);
  });
});
