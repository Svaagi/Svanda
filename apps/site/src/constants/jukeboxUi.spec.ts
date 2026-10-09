import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { JUKEBOX_CONFIG_DEFAULTS, JUKEBOX_SECTIONS } from '@svanda/shared';
import { describe, expect, it } from 'vitest';

import { GLASS_UI_DEFAULTS, PIXEL_UI_DEFAULTS } from './jukeboxUi';

// jsdom replaces the global URL, so build paths from the plain file URL string.
const THEME_CSS = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../styles/theme.css',
);
const DECLARATION_PATTERN = /(--[\w-]+)\s*:\s*([^;]+);/g;
const VAR_PATTERN = /^var\(\s*(--[\w-]+)\s*\)$/;

// Custom properties of the first (dark, default) `:root` block of theme.css.
function readRootTokens(): Map<string, string> {
  const css = readFileSync(THEME_CSS, 'utf8');
  const start = css.indexOf(':root {');
  const block = css.slice(start, css.indexOf('\n}', start));

  return new Map(
    Array.from(
      block.matchAll(DECLARATION_PATTERN),
      ([, name = '', value = '']) => [name, value.replace(/\s+/g, '')],
    ),
  );
}

function resolveToken(tokens: Map<string, string>, value: string): string {
  const name = VAR_PATTERN.exec(value)?.[1];
  if (!name) return value;
  return resolveToken(tokens, tokens.get(name) ?? '');
}

describe('jukebox UI preview defaults', () => {
  const tokens = readRootTokens();

  it.each(JUKEBOX_SECTIONS)(
    'resolve to the configurator defaults (%s)',
    (section) => {
      const resolveAll = (config: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(config).map(([key, value]) => [
            key,
            typeof value === 'string' ? resolveToken(tokens, value) : value,
          ]),
        );

      expect(resolveAll(PIXEL_UI_DEFAULTS[section])).toEqual(
        JUKEBOX_CONFIG_DEFAULTS.pixel[section],
      );
      expect(resolveAll(GLASS_UI_DEFAULTS[section])).toEqual(
        JUKEBOX_CONFIG_DEFAULTS.glass[section],
      );
    },
  );
});
