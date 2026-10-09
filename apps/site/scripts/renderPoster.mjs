// Usage: pnpm build && node scripts/renderPoster.mjs
//
// Renders the jukebox poster (the stand-in shown while the 3D scene loads and when WebGL is
// missing) from the real scene: serves the built site, opens the hero in headless Chromium,
// hides everything but the 3D canvas and saves it as a transparent WebP. The values copied
// from src/constants (poster size and URL, intro storage key) are checked by
// renderPoster.spec.ts.

/* global window, document, Image -- page.evaluate callbacks run in the browser */

import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const BUILD_DIR = fileURLToPath(new URL('../build/client', import.meta.url));
const OUTPUT_PATH = fileURLToPath(
  new URL('../public/models/jukebox-poster.webp', import.meta.url),
);
const POSTER_SIZE = { width: 1620, height: 900 };
const WEBP_QUALITY = 0.9;
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const READY_TIMEOUT_MS = 30_000;
// Frames for the environment map bake and the first lit render to land.
const SETTLE_MS = 500;
// The intro is skipped as for a returning visitor.
const INTRO_SEEN_STORAGE_KEY = 'svanda-intro-seen';
const INTRO_SEEN_VALUE = '1';

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.glb': 'model/gltf-binary',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.json': 'application/json',
};

const ONLY_CANVAS_CSS = `
  html, body, body * { background: transparent !important; visibility: hidden !important; }
  [data-testid='jukebox-stage-canvas'], [data-testid='jukebox-stage-canvas'] * {
    visibility: visible !important;
  }
`;

function serveBuild() {
  const server = createServer(async (request, response) => {
    const path = normalize(new URL(request.url, 'http://local').pathname);
    const file = extname(path) ? path : join(path, 'index.html');
    try {
      const body = await readFile(join(BUILD_DIR, file));
      response.writeHead(HTTP_OK, {
        'content-type':
          CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(HTTP_NOT_FOUND).end();
    }
  });
  return new Promise((resolve) => {
    server.listen(0, () => resolve(server));
  });
}

async function screenshotScene(browser, baseUrl) {
  const page = await browser.newPage({ viewport: POSTER_SIZE });
  await page.addInitScript(
    ([key, value]) => window.sessionStorage.setItem(key, value),
    [INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE],
  );
  await page.goto(`${baseUrl}/en`);
  await page
    .locator("[data-testid='jukebox-stage'][data-state='ready']")
    .waitFor({ state: 'attached', timeout: READY_TIMEOUT_MS });
  await page.waitForTimeout(SETTLE_MS);
  await page.addStyleTag({ content: ONLY_CANVAS_CSS });
  return page.screenshot({ omitBackground: true, type: 'png' });
}

async function encodeWebp(browser, png) {
  const page = await browser.newPage();
  const dataUrl = await page.evaluate(
    async ([source, quality]) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      return canvas.toDataURL('image/webp', quality);
    },
    [`data:image/png;base64,${png.toString('base64')}`, WEBP_QUALITY],
  );
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

const server = await serveBuild();
const browser = await chromium.launch();
try {
  const png = await screenshotScene(
    browser,
    `http://localhost:${server.address().port}`,
  );
  const webp = await encodeWebp(browser, png);
  await writeFile(OUTPUT_PATH, webp);
  process.stdout.write(`Wrote ${OUTPUT_PATH} (${webp.length} bytes)\n`);
} finally {
  await browser.close();
  server.close();
}
