import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  INTRO_ATTRIBUTE,
  INTRO_INIT_SCRIPT_SRC,
  INTRO_PENDING,
  INTRO_SEEN_STORAGE_KEY,
} from 'constants/intro';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { STAGE_PAGE_IDS } from 'constants/stage';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { markIntroSeen } from './introMode';

// jsdom replaces the global URL, so build the path from the plain file URL string.
const PUBLIC_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../public',
);
const scriptSource = readFileSync(
  join(PUBLIC_DIR, INTRO_INIT_SCRIPT_SRC),
  'utf8',
);

function runIntroInitScript() {
  // The script ships as a plain browser file, so the spec evaluates the real source.
  new Function(scriptSource)();
  return document.documentElement.getAttribute(INTRO_ATTRIBUTE);
}

describe('intro init script', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
    document.documentElement.removeAttribute(INTRO_ATTRIBUTE);
    window.history.replaceState(null, '', '/');
  });

  it('uses the same storage key, attribute, value and query as the app', () => {
    expect(scriptSource).toContain(`'${INTRO_SEEN_STORAGE_KEY}'`);
    expect(scriptSource).toContain(`'${INTRO_ATTRIBUTE}'`);
    expect(scriptSource).toContain(`'${INTRO_PENDING}'`);
    expect(scriptSource).toContain(`'${REDUCED_MOTION_QUERY}'`);
    STAGE_PAGE_IDS.forEach((pageId) => {
      expect(scriptSource).toContain(`'#${pageId}'`);
    });
  });

  it('marks a first visit as pending', () => {
    expect(runIntroInitScript()).toBe(INTRO_PENDING);
  });

  it('leaves a repeat visit in the session alone', () => {
    markIntroSeen();

    expect(runIntroInitScript()).toBeNull();
  });

  it('leaves reduced motion alone', () => {
    vi.stubGlobal(
      'matchMedia',
      createMatchMediaMock([REDUCED_MOTION_QUERY]).matchMedia,
    );

    expect(runIntroInitScript()).toBeNull();
  });

  it('plays for a deep link into the stage', () => {
    window.history.replaceState(null, '', '/#venues');

    expect(runIntroInitScript()).toBe(INTRO_PENDING);
  });

  it('leaves a deep link past the stage alone', () => {
    window.history.replaceState(null, '', '/#contact');

    expect(runIntroInitScript()).toBeNull();
  });

  it('treats throwing session storage as a first visit', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(runIntroInitScript()).toBe(INTRO_PENDING);
  });
});
