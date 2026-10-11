import type { LegalLinkId } from 'constants/legal';
import { LEGAL_IDENTITY } from 'constants/legalIdentity';
import type { Locale } from 'constants/locales';

import { type MarkdownBlock, parseMarkdown } from './markdown';

type IdentityValues = Readonly<Record<string, string>>;

const IDENTITY_TOKEN_PATTERN = /\{\{(\w+)\}\}/g;

// Bundled at build time, so prerendered pages carry the full text.
const sources = import.meta.glob<string>('./content/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function contentPath(id: LegalLinkId, locale: Locale): string {
  return `./content/${locale}/${id}.md`;
}

// An unknown token stays as written, so a typo shows up on the page and in the content spec.
export function fillIdentity(
  source: string,
  identity: IdentityValues = LEGAL_IDENTITY,
): string {
  return source.replace(
    IDENTITY_TOKEN_PATTERN,
    (token, field: string) => identity[field] ?? token,
  );
}

export function getLegalSource(id: LegalLinkId, locale: Locale): string {
  const source = sources[contentPath(id, locale)];
  if (source === undefined) {
    throw new Error(`Missing legal text ${contentPath(id, locale)}`);
  }

  return fillIdentity(source);
}

export function getLegalBlocks(
  id: LegalLinkId,
  locale: Locale,
): MarkdownBlock[] {
  return parseMarkdown(getLegalSource(id, locale));
}
