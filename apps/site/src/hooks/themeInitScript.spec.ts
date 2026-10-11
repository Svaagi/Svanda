import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LIGHT_SCHEME_QUERY,
  THEME_ATTRIBUTE,
  THEME_INIT_SCRIPT_SRC,
  THEME_STORAGE_KEY,
} from 'constants/theme';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

// jsdom replaces the global URL, so build the path from the plain file URL string.
const PUBLIC_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../public',
);
const scriptSource = readFileSync(
  join(PUBLIC_DIR, THEME_INIT_SCRIPT_SRC),
  'utf8',
);

function runThemeInitScript() {
  // The script ships as a plain browser file, so the spec evaluates the real source.
  new Function(scriptSource)();
  return document.documentElement.getAttribute(THEME_ATTRIBUTE);
}

describe('theme init script', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it('uses the same storage key, attribute and query as the app', () => {
    expect(scriptSource).toContain(`'${THEME_STORAGE_KEY}'`);
    expect(scriptSource).toContain(`'${THEME_ATTRIBUTE}'`);
    expect(scriptSource).toContain(`'${LIGHT_SCHEME_QUERY}'`);
  });

  it('applies dark by default', () => {
    expect(runThemeInitScript()).toBe('dark');
  });

  it('applies a light system preference', () => {
    vi.stubGlobal(
      'matchMedia',
      createMatchMediaMock([LIGHT_SCHEME_QUERY]).matchMedia,
    );

    expect(runThemeInitScript()).toBe('light');
  });

  it('applies a stored choice over the system preference', () => {
    vi.stubGlobal(
      'matchMedia',
      createMatchMediaMock([LIGHT_SCHEME_QUERY]).matchMedia,
    );
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    expect(runThemeInitScript()).toBe('dark');
  });

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(runThemeInitScript()).toBe('dark');
  });
});
