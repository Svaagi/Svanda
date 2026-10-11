import { LEGAL_IDENTITY } from 'constants/legalIdentity';
import { getI18nInstance } from 'i18n';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import { HomeNoscript } from './HomeNoscript';

// Browsers only show <noscript> content without JavaScript, so the spec reads the
// prerendered markup.
function prerender() {
  return renderToStaticMarkup(
    <I18nextProvider i18n={getI18nInstance('en')}>
      <HomeNoscript />
    </I18nextProvider>,
  );
}

describe('HomeNoscript', () => {
  it('prerenders the page copy with headings inside <noscript>', () => {
    const html = prerender();
    const { t } = getI18nInstance('en');

    expect(html).toMatch(/^<noscript>.*<\/noscript>$/s);
    expect(html).toContain(`<h2`);
    expect(html).toContain(t('karaoke.title'));
    expect(html).toContain(t('jukebox.body'));
    expect(html).toContain(t('seo.noscript'));
    expect(html).toContain(`href="mailto:${LEGAL_IDENTITY.email}"`);
  });
});
