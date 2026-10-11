import { LEGAL_PATHS } from 'constants/legal';
import { getI18nInstance } from 'i18n';
import { describe, expect, it } from 'vitest';

import { buildConsentTranslation, escapeHtml } from './consentTranslation';

describe('escapeHtml', () => {
  it('escapes markup characters', () => {
    expect(escapeHtml(`<a href="x">'Tom' & Jerry</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;Tom&#39; &amp; Jerry&lt;/a&gt;',
    );
  });
});

describe('buildConsentTranslation', () => {
  it('fills the banner from the catalog of the locale', () => {
    const { t } = getI18nInstance('en');
    const { consentModal } = buildConsentTranslation(t, 'en');

    expect(consentModal.title).toBe(t('consent.banner.title'));
    expect(consentModal.acceptAllBtn).toBe(t('consent.acceptAll'));
    expect(consentModal.acceptNecessaryBtn).toBe(t('consent.rejectAll'));
    expect(consentModal.showPreferencesBtn).toBe(t('consent.banner.settings'));
  });

  it('links the cookie policy of the same locale', () => {
    const { consentModal } = buildConsentTranslation(
      getI18nInstance('sk').t,
      'sk',
    );

    expect(consentModal.footer).toContain(`href="${LEGAL_PATHS.cookies.sk}"`);
  });

  it('lists a section for every category', () => {
    const { preferencesModal } = buildConsentTranslation(
      getI18nInstance('cs').t,
      'cs',
    );

    expect(
      preferencesModal.sections.map(({ linkedCategory }) => linkedCategory),
    ).toEqual([undefined, 'necessary', 'analytics', 'marketing', undefined]);
  });
});
