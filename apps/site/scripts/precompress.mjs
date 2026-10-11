// Usage: node scripts/precompress.mjs [directory]
//
// Runs after every build and writes a Brotli (`.br`) and a gzip (`.gz`) copy next to each text
// asset of the client build, so a static host serves them precompressed (the `preview` server
// does this by default) instead of compressing on every request. Lighthouse budgets are
// measured against these sizes, as visitors receive them.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const DEFAULT_DIR = fileURLToPath(new URL('../build/client', import.meta.url));
const COMPRESSIBLE_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml',
]);
// Below this a compressed copy saves less than its own response overhead.
const MIN_SIZE_BYTES = 1024;

export function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

export function isCompressible(path, sizeBytes) {
  return (
    COMPRESSIBLE_EXTENSIONS.has(extname(path)) && sizeBytes >= MIN_SIZE_BYTES
  );
}

export function precompress(dir) {
  const files = listFiles(dir).filter((path) =>
    isCompressible(path, statSync(path).size),
  );
  for (const path of files) {
    const content = readFileSync(path);
    writeFileSync(
      `${path}.br`,
      brotliCompressSync(content, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
        },
      }),
    );
    writeFileSync(
      `${path}.gz`,
      gzipSync(content, { level: constants.Z_BEST_COMPRESSION }),
    );
  }
  return files.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , dir = DEFAULT_DIR] = process.argv;
  const count = precompress(dir);
  process.stdout.write(`precompressed ${count} files in ${dir}\n`);
}
