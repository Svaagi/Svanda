import { LEGAL_LINKS } from 'constants/legal';
import { LEGAL_IDENTITY } from 'constants/legalIdentity';
import { LOCALES } from 'constants/locales';
import { describe, expect, it } from 'vitest';

import { fillIdentity, getLegalBlocks, getLegalSource } from './legalContent';

const PAGES = LEGAL_LINKS.flatMap(({ id }) =>
  LOCALES.map((locale) => ({ id, locale })),
);
const SITE_LINK_PATTERN = /\]\((\/[^)]*)\)/g;
const LONG_DASH_PATTERN = /[\u2013\u2014]/;

describe('fillIdentity', () => {
  it('replaces known tokens and keeps unknown ones visible', () => {
    expect(
      fillIdentity('{{name}} at {{seat}} {{typo}}', {
        name: 'Jana',
        seat: 'Brno',
      }),
    ).toBe('Jana at Brno {{typo}}');
  });
});

describe('legal texts', () => {
  it.each(PAGES)('$locale $id fills every identity token', ({ id, locale }) => {
    expect(getLegalSource(id, locale)).not.toMatch(/\{\{|\}\}/);
  });

  it.each(PAGES)('$locale $id opens with its only h1', ({ id, locale }) => {
    const blocks = getLegalBlocks(id, locale);
    const titles = blocks.filter(
      (block) => block.type === 'heading' && block.tag === 'h1',
    );

    expect(titles).toHaveLength(1);
    expect(blocks[0]).toBe(titles[0]);
  });

  it.each(PAGES)(
    '$locale $id links only legal pages of its own locale',
    ({ id, locale }) => {
      const sitePaths = [
        ...getLegalSource(id, locale).matchAll(SITE_LINK_PATTERN),
      ].map(([, path]) => path);

      sitePaths.forEach((path) => {
        expect(LEGAL_LINKS.some(({ paths }) => paths[locale] === path)).toBe(
          true,
        );
      });
    },
  );

  it.each(PAGES)('$locale $id uses no long dashes', ({ id, locale }) => {
    expect(getLegalSource(id, locale)).not.toMatch(LONG_DASH_PATTERN);
  });

  it.each(LOCALES)('the %s imprint shows the identity', (locale) => {
    const imprint = getLegalSource('imprint', locale);

    [
      LEGAL_IDENTITY.operatorName,
      LEGAL_IDENTITY.ico,
      LEGAL_IDENTITY.dic,
      LEGAL_IDENTITY.seat,
      LEGAL_IDENTITY.email,
    ].forEach((value) => expect(imprint).toContain(value));
  });

  it.each(LOCALES)('the %s privacy policy names the controller', (locale) => {
    const privacy = getLegalSource('privacy', locale);

    expect(privacy).toContain(LEGAL_IDENTITY.operatorName);
    expect(privacy).toContain(LEGAL_IDENTITY.privacyEmail);
  });
});
