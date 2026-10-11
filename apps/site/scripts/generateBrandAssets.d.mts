type PixelLib = typeof import('../src/lib/pixel');
type SeoConstants = typeof import('../src/constants/seo');

type PngIcon = { path: string; sizePx: number };

export function pngIcons(seo: SeoConstants): PngIcon[];
export function maskablePngIcon(seo: SeoConstants): PngIcon;
export function resolveToken(css: string, name: string): string;
export function faviconSvg(css: string): string;
export function appIconSvg(css: string, sizePx: number): string;
export function maskableIconSvg(css: string, sizePx?: number): string;
export function manifestJson(
  css: string,
  seo: SeoConstants,
  name: string,
): string;
export function ogImageSvg(
  css: string,
  modules: { pixel: PixelLib; seo: SeoConstants },
  copy: { tag: string; title: string },
): string;
export function readCatalog(locale: string): {
  brand: { name: string };
  hero: { tag: string; title: string };
};
export function renderPng(svg: string): Promise<Buffer>;
