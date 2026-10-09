// @vitest-environment node
import { readFileSync } from 'node:fs';

import { DEFAULT_LOCALE, LOCALES } from 'constants/locales';
import * as seo from 'constants/seo';
import * as pixel from 'lib/pixel';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import {
  appIconSvg,
  faviconSvg,
  manifestJson,
  maskableIconSvg,
  maskablePngIcon,
  ogImageSvg,
  pngIcons,
  readCatalog,
  renderPng,
  resolveToken,
} from './generateBrandAssets.mjs';

const css = readFileSync(
  new URL('../src/styles/theme.css', import.meta.url),
  'utf8',
);

function publicFile(path: string) {
  return new URL(`../public/${path.replace(/^\//, '')}`, import.meta.url);
}

function readPublic(path: string) {
  return readFileSync(publicFile(path));
}

async function rawPixels(png: Buffer) {
  return sharp(png).raw().toBuffer({ resolveWithObject: true });
}

// The brand mark colours the owner specified, held in step with the theme palette.
const MARK_COLOURS = ['#b6ff4d', '#5ff5e0', '#3ee6ff', '#7a5cff', '#ff4fd8'];
const MARK_CELL_COUNT = 10;
const BRAND_INK = '#0d0e10';

function rectCount(svg: string) {
  return svg.match(/<rect /g)?.length ?? 0;
}

describe('generateBrandAssets.mjs', () => {
  it('follows token references to the dark theme value', () => {
    expect(resolveToken(css, '--palette-brand-ink')).toBe(BRAND_INK);
    expect(resolveToken(css, '--color-letter-1')).toBe(
      resolveToken(css, '--palette-lime'),
    );
  });

  it('draws the rainbow pixel S in the brand colours', () => {
    const favicon = faviconSvg(css);

    expect(favicon).toContain('viewBox="0 0 38 48"');
    expect(favicon).toContain('shape-rendering="crispEdges"');
    expect(rectCount(favicon)).toBe(MARK_CELL_COUNT);
    MARK_COLOURS.forEach((colour) => expect(favicon).toContain(colour));
    expect(favicon).not.toContain(BRAND_INK);
  });

  it('places the S on the brand background in the app and maskable icons', () => {
    const appIcon = appIconSvg(css, 512);
    const maskable = maskableIconSvg(css);

    expect(appIcon).toContain('viewBox="0 0 68 68"');
    expect(appIcon).toContain('<rect x="25" y="10"');
    expect(maskable).toContain('viewBox="0 0 88 88"');
    expect(maskable).toContain('<rect x="35" y="20"');
    [appIcon, maskable].forEach((svg) => {
      expect(svg).toContain(`fill="${BRAND_INK}"`);
      expect(rectCount(svg)).toBe(MARK_CELL_COUNT + 1);
    });
  });

  it('has committed up-to-date icons and manifest', async () => {
    expect(readPublic(seo.FAVICON_PATH).toString()).toBe(faviconSvg(css));
    expect(readPublic(seo.MASKABLE_ICON_PATH).toString()).toBe(
      maskableIconSvg(css),
    );
    expect(readPublic(seo.MANIFEST_PATH).toString()).toBe(
      manifestJson(css, seo, readCatalog(DEFAULT_LOCALE).brand.name),
    );

    const maskable = maskablePngIcon(seo);
    const pngs = [
      ...pngIcons(seo).map((icon) => ({
        ...icon,
        svg: appIconSvg(css, icon.sizePx),
      })),
      { ...maskable, svg: maskableIconSvg(css, maskable.sizePx) },
    ];
    for (const { path, sizePx, svg } of pngs) {
      const committed = await rawPixels(readPublic(path));
      const fresh = await rawPixels(await renderPng(svg));
      expect(committed.info.width).toBe(sizePx);
      expect(committed.info.height).toBe(sizePx);
      expect(committed.data.equals(fresh.data)).toBe(true);
    }
  });

  it('lists the app icons and both maskable icons in the manifest', () => {
    const { icons } = JSON.parse(manifestJson(css, seo, 'SVANDA')) as {
      icons: { src: string; sizes: string; purpose?: string }[];
    };

    expect(icons.map(({ src }) => src)).toEqual([
      seo.APP_ICON_192_PATH,
      seo.APP_ICON_512_PATH,
      seo.MASKABLE_ICON_512_PATH,
      seo.MASKABLE_ICON_PATH,
    ]);
    expect(
      icons
        .filter(({ purpose }) => purpose === 'maskable')
        .map(({ sizes }) => sizes),
    ).toEqual(['512x512', 'any']);
  });

  it('has committed an up-to-date Open Graph image per locale', async () => {
    for (const locale of LOCALES) {
      const { hero } = readCatalog(locale);
      const svg = ogImageSvg(
        css,
        { pixel, seo },
        { tag: hero.tag, title: hero.title },
      );
      const committed = await rawPixels(readPublic(seo.ogImagePath(locale)));
      const fresh = await rawPixels(await renderPng(svg));

      expect(committed.info.width).toBe(seo.OG_IMAGE_WIDTH_PX);
      expect(committed.info.height).toBe(seo.OG_IMAGE_HEIGHT_PX);
      expect(committed.data.equals(fresh.data)).toBe(true);
    }
  });

  it('draws every wordmark module in the Open Graph image', () => {
    const svg = ogImageSvg(css, { pixel, seo }, { tag: '', title: '' });
    const wordmarkModules = pixel.layoutBitmap(pixel.BITMAP).length;

    // The background, the wordmark and the domain line.
    expect(rectCount(svg)).toBe(
      1 + wordmarkModules + pixel.layoutText('SVANDA.FUN').length,
    );
  });
});
