// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  checkPage,
  gzipSizeBytes,
  initialScriptUrls,
} from './checkBundleBudget.mjs';

const PAGE_HTML = `<!DOCTYPE html><html><head>
<link rel="modulepreload" href="/assets/entry.client-a1.js"/>
<link rel="modulepreload" href="/assets/home-b2.js"/>
<link rel="stylesheet" href="/assets/home-b2.css"/>
<script src="/theme-init.js"></script>
</head><body><script type="module" src="/assets/home-b2.js"></script></body></html>`;

const fixtureDirs: string[] = [];

function writeFixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'svanda-bundle-'));
  fixtureDirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    const path = join(dir, name);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content);
  }
  return dir;
}

afterEach(() => {
  fixtureDirs.splice(0).forEach((dir) => rmSync(dir, { recursive: true }));
});

describe('initialScriptUrls', () => {
  it('lists each module script and modulepreload once, and nothing else', () => {
    expect(initialScriptUrls(PAGE_HTML)).toEqual([
      '/assets/entry.client-a1.js',
      '/assets/home-b2.js',
    ]);
  });
});

describe('checkPage', () => {
  it('sums the gzipped size of the initial scripts', () => {
    const entry = 'export const entry = 1;'.repeat(50);
    const home = 'export const home = 2;'.repeat(50);
    const dir = writeFixture({
      'index.html': PAGE_HTML,
      'assets/entry.client-a1.js': entry,
      'assets/home-b2.js': home,
    });

    const { sizeKb, lazyUrls } = checkPage(dir, 'index.html');

    expect(sizeKb * 1024).toBe(gzipSizeBytes(entry) + gzipSizeBytes(home));
    expect(lazyUrls).toEqual([]);
  });

  it('flags the 3D chunk when it loads up front', () => {
    const dir = writeFixture({
      'index.html':
        '<link rel="modulepreload" href="/assets/JukeboxCanvas-c3.js"/>',
      'assets/JukeboxCanvas-c3.js': 'export {};',
    });

    expect(checkPage(dir, 'index.html').lazyUrls).toEqual([
      '/assets/JukeboxCanvas-c3.js',
    ]);
  });
});
