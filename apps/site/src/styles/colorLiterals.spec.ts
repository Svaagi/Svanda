import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// jsdom replaces the global URL, so build paths from the plain file URL string.
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCANNED_DIRS = ['app', 'src'];
const SCANNED_EXTENSIONS = ['.css', '.ts', '.tsx'];
const SPEC_FILE_PATTERN = /\.spec\.tsx?$/;

// Paths relative to the site root, with forward slashes.
const ALLOWED_FILES = ['src/styles/theme.css'];

const COLOR_LITERAL_PATTERNS = [
  /#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?![\w-])/gi,
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi,
];

function findColorLiterals(source: string): string[] {
  return COLOR_LITERAL_PATTERNS.flatMap((pattern) =>
    Array.from(source.matchAll(pattern), (match) => match[0]),
  );
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return SCANNED_EXTENSIONS.some((extension) => path.endsWith(extension))
      ? [path]
      : [];
  });
}

function toSitePath(path: string) {
  return relative(SITE_ROOT, path).split(sep).join('/');
}

describe('colour literal guard', () => {
  it('finds hex and functional colours', () => {
    const planted = [
      'color: #ff4fd8;',
      'fill: #FFF;',
      "const shadow = '#00000080';",
      'background: rgba(0, 0, 0, 0.5);',
      'border-color: rgb(5 5 7 / 0.9);',
      'outline-color: hsl(10 50% 50%);',
      'color: oklch(70% 0.1 200);',
    ];

    planted.forEach((line) => {
      expect(findColorLiterals(line)).toHaveLength(1);
    });
  });

  it('ignores anchors, ids and token references', () => {
    const clean = [
      "href: '#kontakt'",
      "href: '#top'",
      'color: var(--color-accent);',
      "const id = '#bad-section';",
    ];

    clean.forEach((line) => {
      expect(findColorLiterals(line)).toEqual([]);
    });
  });

  it('finds no raw colour outside theme.css', () => {
    const offenders = SCANNED_DIRS.flatMap((directory) =>
      listSourceFiles(join(SITE_ROOT, directory)),
    )
      .filter((path) => !SPEC_FILE_PATTERN.test(path))
      .map((path) => ({
        file: toSitePath(path),
        literals: findColorLiterals(readFileSync(path, 'utf8')),
      }))
      .filter(
        ({ file, literals }) =>
          literals.length > 0 && !ALLOWED_FILES.includes(file),
      );

    expect(offenders).toEqual([]);
  });
});
