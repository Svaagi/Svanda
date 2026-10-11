// Usage: pnpm --filter @svanda/site brand:assets
//
// Paints the brand assets committed under public/: the favicon and app icons (the rainbow
// pixel S of the SVANDA mark), the web manifest, and one Open Graph image per locale (the
// pixel wordmark with the hero tag and title). Colours come from the tokens in
// src/styles/theme.css, the copy from the locale catalogs, and the pixel letters, locales and
// public paths from src/ (loaded through Vite, which resolves their `src` imports). The output
// is deterministic; generateBrandAssets.spec.ts checks the committed files are up to date.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const SITE_DIR = fileURLToPath(new URL('..', import.meta.url));
const THEME_PATH = `${SITE_DIR}src/styles/theme.css`;
const CATALOG_DIR = `${SITE_DIR}src/i18n/locales/`;
const PUBLIC_DIR = `${SITE_DIR}public/`;

// The S of the brand mark: 8-unit cells on a 10-unit pitch inside a 38 x 48 box.
const MARK_WIDTH = 38;
const MARK_HEIGHT = 48;
const MARK_CELL = 8;
const MARK_CELLS = [
  { x: 10, y: 0, token: '--palette-lime' },
  { x: 20, y: 0, token: '--palette-lime' },
  { x: 30, y: 0, token: '--palette-lime' },
  { x: 0, y: 10, token: '--palette-aqua' },
  { x: 10, y: 20, token: '--palette-cyan' },
  { x: 20, y: 20, token: '--palette-cyan' },
  { x: 30, y: 30, token: '--palette-violet' },
  { x: 0, y: 40, token: '--palette-magenta' },
  { x: 10, y: 40, token: '--palette-magenta' },
  { x: 20, y: 40, token: '--palette-magenta' },
];
const BACKGROUND_TOKEN = '--palette-brand-ink';

// App icons centre the mark on a square; the maskable one keeps it inside the safe zone.
const APP_ICON = { size: 68, markX: 15, markY: 10 };
const MASKABLE_ICON = { size: 88, markX: 25, markY: 20 };

const APP_ICON_SIZES_PX = { small: 192, large: 512, appleTouch: 180 };

// `seo` is src/constants/seo: the public paths the app links to.
export function pngIcons(seo) {
  return [
    { path: seo.APP_ICON_192_PATH, sizePx: APP_ICON_SIZES_PX.small },
    { path: seo.APP_ICON_512_PATH, sizePx: APP_ICON_SIZES_PX.large },
    { path: seo.APPLE_TOUCH_ICON_PATH, sizePx: APP_ICON_SIZES_PX.appleTouch },
  ];
}

export function maskablePngIcon(seo) {
  return { path: seo.MASKABLE_ICON_512_PATH, sizePx: APP_ICON_SIZES_PX.large };
}

const OG_MARGIN_PX = 80;
const OG_CELL_INSET_RATIO = 0.1;
const OG_WORDMARK_CELL_PX = 24;
const OG_TAG_CELL_PX = 8;
const OG_TITLE_CELL_PX = 10;
const OG_DOMAIN_CELL_PX = 5;
const OG_TAG_GAP_PX = 48;
const OG_TITLE_GAP_PX = 32;
const OG_DOMAIN = 'SVANDA.FUN';
const LETTER_COLOR_COUNT = 6;
const LETTER_TOKENS = Array.from(
  { length: LETTER_COLOR_COUNT },
  (_, index) => `--color-letter-${index + 1}`,
);
const HALF = 2;
const JSON_INDENT = 2;
const OG_COLOR_TOKENS = {
  tag: '--color-fg',
  title: '--color-accent',
  domain: '--color-muted',
};

const VAR_REFERENCE = /^var\((--[\w-]+)\)$/;
const LEADING_SLASH = /^\//;
const PNG_OPTIONS = { compressionLevel: 9 };

// The first declaration is the default (dark) theme value; `var()` references are followed.
export function resolveToken(css, name) {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Token ${name} not found in theme.css`);
  const value = match[1].trim();
  const reference = value.match(VAR_REFERENCE);

  return reference ? resolveToken(css, reference[1]) : value;
}

function markRects(css, offsetX, offsetY) {
  return MARK_CELLS.map(
    ({ x, y, token }) =>
      `<rect x="${offsetX + x}" y="${offsetY + y}" width="${MARK_CELL}" height="${MARK_CELL}" fill="${resolveToken(css, token)}"/>`,
  ).join('');
}

function svgDocument(viewBox, body, sizePx) {
  const size = sizePx ? ` width="${sizePx}" height="${sizePx}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size} shape-rendering="crispEdges">${body}</svg>\n`;
}

export function faviconSvg(css) {
  return svgDocument(`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`, markRects(css, 0, 0));
}

function squareIconSvg(css, { size, markX, markY }, sizePx) {
  const background = `<rect width="${size}" height="${size}" fill="${resolveToken(css, BACKGROUND_TOKEN)}"/>`;
  return svgDocument(
    `0 0 ${size} ${size}`,
    background + markRects(css, markX, markY),
    sizePx,
  );
}

export function appIconSvg(css, sizePx) {
  return squareIconSvg(css, APP_ICON, sizePx);
}

export function maskableIconSvg(css, sizePx) {
  return squareIconSvg(css, MASKABLE_ICON, sizePx);
}

function manifestIcon({ path, sizePx }) {
  return { src: path, sizes: `${sizePx}x${sizePx}`, type: 'image/png' };
}

export function manifestJson(css, seo, name) {
  const background = resolveToken(css, BACKGROUND_TOKEN);
  const manifest = {
    name,
    short_name: name,
    start_url: '/',
    display: 'browser',
    background_color: background,
    theme_color: background,
    icons: [
      ...pngIcons(seo)
        .filter(({ path }) => path !== seo.APPLE_TOUCH_ICON_PATH)
        .map(manifestIcon),
      { ...manifestIcon(maskablePngIcon(seo)), purpose: 'maskable' },
      {
        src: seo.MASKABLE_ICON_PATH,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };

  return `${JSON.stringify(manifest, null, JSON_INDENT)}\n`;
}

function cellRects(cells, cellPx, originX, originY, colorAt) {
  const inset = cellPx * OG_CELL_INSET_RATIO;
  const size = cellPx - inset - inset;
  return cells
    .map(
      ({ col, row, letterIndex }) =>
        `<rect x="${originX + col * cellPx + inset}" y="${originY + row * cellPx + inset}" width="${size}" height="${size}" fill="${colorAt(letterIndex)}"/>`,
    )
    .join('');
}

function centredCells(cells, cols, cellPx, { width, y, colorAt }) {
  const x = Math.round((width - cols * cellPx) / HALF);
  return cellRects(cells, cellPx, x, y, colorAt);
}

// A long localized line shrinks its cells to fit between the margins.
function textLine(pixel, text, preferredPx, { width, y, color }) {
  const upper = text.toUpperCase();
  const cols = pixel.measureText(upper);
  const maxPx = Math.floor((width - OG_MARGIN_PX - OG_MARGIN_PX) / cols);
  return centredCells(
    pixel.layoutText(upper),
    cols,
    Math.min(preferredPx, maxPx),
    {
      width,
      y,
      colorAt: () => color,
    },
  );
}

// `pixel` is src/lib/pixel, `seo` src/constants/seo; `copy` holds the hero tag and title of
// one locale.
export function ogImageSvg(css, { pixel, seo }, copy) {
  const width = seo.OG_IMAGE_WIDTH_PX;
  const height = seo.OG_IMAGE_HEIGHT_PX;
  const rows = pixel.BITMAP.length;
  const color = (token) => resolveToken(css, token);
  const letterColors = LETTER_TOKENS.map(color);
  const wordmarkHeight = rows * OG_WORDMARK_CELL_PX;
  const contentHeight =
    wordmarkHeight +
    OG_TAG_GAP_PX +
    rows * OG_TAG_CELL_PX +
    OG_TITLE_GAP_PX +
    rows * OG_TITLE_CELL_PX;
  const top = Math.round((height - contentHeight) / HALF);
  const tagY = top + wordmarkHeight + OG_TAG_GAP_PX;
  const titleY = tagY + rows * OG_TAG_CELL_PX + OG_TITLE_GAP_PX;
  const domainY = height - OG_MARGIN_PX / HALF - rows * OG_DOMAIN_CELL_PX;

  const body = [
    `<rect width="${width}" height="${height}" fill="${color(BACKGROUND_TOKEN)}"/>`,
    centredCells(
      pixel.layoutBitmap(pixel.BITMAP),
      pixel.bitmapWidth(pixel.BITMAP),
      OG_WORDMARK_CELL_PX,
      {
        width,
        y: top,
        colorAt: (letterIndex) =>
          letterColors[letterIndex % letterColors.length],
      },
    ),
    textLine(pixel, copy.tag, OG_TAG_CELL_PX, {
      width,
      y: tagY,
      color: color(OG_COLOR_TOKENS.tag),
    }),
    textLine(pixel, copy.title, OG_TITLE_CELL_PX, {
      width,
      y: titleY,
      color: color(OG_COLOR_TOKENS.title),
    }),
    textLine(pixel, OG_DOMAIN, OG_DOMAIN_CELL_PX, {
      width,
      y: domainY,
      color: color(OG_COLOR_TOKENS.domain),
    }),
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${body}</svg>
`;
}

export function readCatalog(locale) {
  return JSON.parse(readFileSync(`${CATALOG_DIR}${locale}.json`, 'utf8'));
}

export function renderPng(svg) {
  return sharp(Buffer.from(svg)).png(PNG_OPTIONS).toBuffer();
}

async function loadSiteModules() {
  const { runnerImport } = await import('vite');
  const load = async (path) =>
    (
      await runnerImport(path, {
        configFile: false,
        root: SITE_DIR,
        resolve: { tsconfigPaths: true },
        logLevel: 'silent',
      })
    ).module;
  const [pixel, seo, locales] = await Promise.all([
    load('/src/lib/pixel/index.ts'),
    load('/src/constants/seo.ts'),
    load('/src/constants/locales.ts'),
  ]);
  return { pixel, seo, locales };
}

function writeOutput(path, content) {
  const file = `${PUBLIC_DIR}${path.replace(LEADING_SLASH, '')}`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  process.stdout.write(`Wrote public${path}
`);
}

async function main() {
  const css = readFileSync(THEME_PATH, 'utf8');
  const { pixel, seo, locales } = await loadSiteModules();
  const maskablePng = maskablePngIcon(seo);

  writeOutput(seo.FAVICON_PATH, faviconSvg(css));
  writeOutput(seo.MASKABLE_ICON_PATH, maskableIconSvg(css));
  writeOutput(
    seo.MANIFEST_PATH,
    manifestJson(css, seo, readCatalog(locales.DEFAULT_LOCALE).brand.name),
  );
  for (const { path, sizePx } of pngIcons(seo)) {
    writeOutput(path, await renderPng(appIconSvg(css, sizePx)));
  }
  writeOutput(
    maskablePng.path,
    await renderPng(maskableIconSvg(css, maskablePng.sizePx)),
  );
  for (const locale of locales.LOCALES) {
    const { hero } = readCatalog(locale);
    const svg = ogImageSvg(
      css,
      { pixel, seo },
      { tag: hero.tag, title: hero.title },
    );
    writeOutput(seo.ogImagePath(locale), await renderPng(svg));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
