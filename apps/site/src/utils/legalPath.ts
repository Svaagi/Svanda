import { LEGAL_LINKS, type LegalLinkId } from 'constants/legal';

const TRAILING_SLASHES = /(.)\/+$/;

// The legal routes share one module; the URL says which page it is.
export function findLegalPageId(pathname: string): LegalLinkId | undefined {
  const path = pathname.replace(TRAILING_SLASHES, '$1');

  return LEGAL_LINKS.find(({ paths }) => Object.values(paths).includes(path))
    ?.id;
}

// Only the legal routes render the legal page, so their paths always match.
export function requireLegalPageId(pathname: string): LegalLinkId {
  const pageId = findLegalPageId(pathname);
  if (!pageId) throw new Error(`No legal page at ${pathname}`);

  return pageId;
}
