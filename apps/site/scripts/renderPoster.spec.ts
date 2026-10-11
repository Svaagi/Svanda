// @vitest-environment node
import { readFileSync } from 'node:fs';

import { INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE } from 'constants/intro';
import {
  JUKEBOX_POSTER_HEIGHT_PX,
  JUKEBOX_POSTER_URL,
  JUKEBOX_POSTER_WIDTH_PX,
} from 'constants/jukebox3d';
import { describe, expect, it } from 'vitest';

// The script is plain Node and cannot import the TypeScript constants: it keeps copies,
// held in step with the app here.
const script = readFileSync(
  new URL('./renderPoster.mjs', import.meta.url),
  'utf8',
);

const readConstant = (pattern: RegExp) => pattern.exec(script)?.slice(1);

describe('renderPoster.mjs', () => {
  it('renders at the poster size the page lays out', () => {
    expect(
      readConstant(/POSTER_SIZE = \{ width: (\d+), height: (\d+) \}/),
    ).toEqual([
      String(JUKEBOX_POSTER_WIDTH_PX),
      String(JUKEBOX_POSTER_HEIGHT_PX),
    ]);
  });

  it('writes the poster where the page loads it from', () => {
    expect(
      readConstant(/new URL\('\.\.\/public(\/[\w/.-]+)', import\.meta\.url\)/),
    ).toEqual([JUKEBOX_POSTER_URL]);
  });

  it('skips the intro with the key and value the app reads', () => {
    expect(readConstant(/INTRO_SEEN_STORAGE_KEY = '([^']+)'/)).toEqual([
      INTRO_SEEN_STORAGE_KEY,
    ]);
    expect(readConstant(/INTRO_SEEN_VALUE = '([^']+)'/)).toEqual([
      INTRO_SEEN_VALUE,
    ]);
  });
});
