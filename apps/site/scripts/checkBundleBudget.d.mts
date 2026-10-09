export const INITIAL_JS_BUDGET_KB: number;
export function initialScriptUrls(html: string): string[];
export function gzipSizeBytes(content: string | Buffer): number;
export function checkPage(
  dir: string,
  page: string,
): { page: string; sizeKb: number; lazyUrls: string[] };
