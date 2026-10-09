// Usage: node scripts/checkBundleBudget.mjs [client build directory]
//
// Runs in CI after the build and fails when the JavaScript a page loads up front (its module
// scripts and modulepreloads, gzipped as served) outgrows the budget, or when a chunk that must
// stay lazy (three.js and the 3D scene) is among it. Checked on every prerendered home page.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const DEFAULT_DIR = fileURLToPath(new URL('../build/client', import.meta.url));
const HOME_PAGES = ['index.html', 'en/index.html', 'sk/index.html'];
// Initial JavaScript per page, gzipped, without the lazy 3D chunk: about 274 kB when this
// budget was set, so a dependency or feature that adds more than about 10 kB is noticed.
export const INITIAL_JS_BUDGET_KB = 285;
const BYTES_PER_KB = 1024;
// Chunks that may never load up front.
const LAZY_CHUNK_PATTERNS = [/\/JukeboxCanvas-[^/]+\.js$/];

const SCRIPT_URL_PATTERNS = [
  /<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g,
  /<script[^>]+type="module"[^>]+src="([^"]+)"/g,
];

export function initialScriptUrls(html) {
  const urls = SCRIPT_URL_PATTERNS.flatMap((pattern) =>
    [...html.matchAll(pattern)].map(([, url]) => url),
  );
  return [...new Set(urls)];
}

export function gzipSizeBytes(content) {
  return gzipSync(content).length;
}

export function checkPage(dir, page) {
  const urls = initialScriptUrls(readFileSync(join(dir, page), 'utf8'));
  const sizeBytes = urls.reduce(
    (total, url) => total + gzipSizeBytes(readFileSync(join(dir, url))),
    0,
  );
  const lazyUrls = urls.filter((url) =>
    LAZY_CHUNK_PATTERNS.some((pattern) => pattern.test(url)),
  );
  return { page, sizeKb: sizeBytes / BYTES_PER_KB, lazyUrls };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , dir = DEFAULT_DIR] = process.argv;
  const results = HOME_PAGES.map((page) => checkPage(dir, page));
  let hasFailed = false;
  for (const { page, sizeKb, lazyUrls } of results) {
    const isOverBudget = sizeKb > INITIAL_JS_BUDGET_KB;
    hasFailed ||= isOverBudget || lazyUrls.length > 0;
    process.stdout.write(
      `${page}: ${sizeKb.toFixed(1)} kB of ${INITIAL_JS_BUDGET_KB} kB initial JS (gzip)${isOverBudget ? ' OVER BUDGET' : ''}\n`,
    );
    for (const url of lazyUrls) {
      process.stdout.write(`${page}: lazy chunk loaded up front: ${url}\n`);
    }
  }
  if (hasFailed) process.exitCode = 1;
}
