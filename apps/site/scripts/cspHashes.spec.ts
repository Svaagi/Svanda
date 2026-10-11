// @vitest-environment node
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { collectCspHashes, cspHash, inlineScripts } from './cspHashes.mjs';

const fixtureDirs: string[] = [];

function writeFixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'svanda-csp-'));
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

describe('inlineScripts', () => {
  it('returns executable inline scripts only', () => {
    const html = [
      '<script src="/theme-init.js"></script>',
      '<script type="application/ld+json">{"@type":"Organization"}</script>',
      '<script>window.ctx = 1;</script>',
      '<script type="module" async="">import "/a.js";</script>',
      '<script></script>',
    ].join('');

    expect(inlineScripts(html)).toEqual(['window.ctx = 1;', 'import "/a.js";']);
  });
});

describe('cspHash', () => {
  it('formats a base64 sha256 CSP source', () => {
    const expected = createHash('sha256').update('a()').digest('base64');

    expect(cspHash('a()')).toBe(`'sha256-${expected}'`);
  });
});

describe('collectCspHashes', () => {
  it('dedupes the hashes of every HTML page in the build', () => {
    const dir = writeFixture({
      'index.html': '<script>a()</script><script>b()</script>',
      'en/index.html': '<script>a()</script>',
      'assets/app.js': '<script>c()</script>',
    });

    expect(collectCspHashes(dir)).toEqual(
      [cspHash('a()'), cspHash('b()')].sort(),
    );
  });
});
