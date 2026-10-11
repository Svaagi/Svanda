// @vitest-environment node
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';

import { afterEach, describe, expect, it } from 'vitest';

import { isCompressible, listFiles, precompress } from './precompress.mjs';

const LARGE_TEXT = 'svanda karaoke jukebox '.repeat(200);
const fixtureDirs: string[] = [];

function writeFixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'svanda-precompress-'));
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

describe('isCompressible', () => {
  it('takes text assets above the size floor only', () => {
    expect(isCompressible('assets/app.js', 4096)).toBe(true);
    expect(isCompressible('index.html', 4096)).toBe(true);
    expect(isCompressible('assets/app.js', 100)).toBe(false);
    expect(isCompressible('images/photo.avif', 4096)).toBe(false);
    expect(isCompressible('fonts/pixel.woff2', 4096)).toBe(false);
  });
});

describe('precompress', () => {
  it('writes Brotli and gzip copies that decompress to the original', () => {
    const dir = writeFixture({
      'index.html': LARGE_TEXT,
      'assets/app.js': LARGE_TEXT,
      'assets/tiny.css': 'a{}',
      'models/jukebox.glb': LARGE_TEXT,
    });

    expect(precompress(dir)).toBe(2);

    const script = join(dir, 'assets/app.js');
    expect(brotliDecompressSync(readFileSync(`${script}.br`)).toString()).toBe(
      LARGE_TEXT,
    );
    expect(gunzipSync(readFileSync(`${script}.gz`)).toString()).toBe(
      LARGE_TEXT,
    );
    expect(
      listFiles(dir).filter((path) => /\.(br|gz)$/.test(path)),
    ).toHaveLength(4);
  });
});
