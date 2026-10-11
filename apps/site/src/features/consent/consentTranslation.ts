import type { ConsentCategory } from 'constants/consent';
import { LEGAL_PATHS } from 'constants/legal';
import type { Locale } from 'constants/locales';
import type { TFunction } from 'i18next';
import type { Translation } from 'vanilla-cookieconsent';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// The consent manager renders its texts as HTML.
export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (character) => HTML_ESCAPES[character] ?? character,
  );
}

function cookiePolicyLink(t: TFunction, locale: Locale): string {
  return `<a href="${LEGAL_PATHS.cookies[locale]}">${escapeHtml(t('consent.policyLink'))}</a>`;
}

function categorySection(t: TFunction, category: ConsentCategory) {
  return {
    title: escapeHtml(t(`consent.categories.${category}.title`)),
    description: escapeHtml(t(`consent.categories.${category}.description`)),
    linkedCategory: category,
  };
}

export function buildConsentTranslation(
  t: TFunction,
  locale: Locale,
): Translation {
  return {
    consentModal: {
      label: escapeHtml(t('consent.banner.title')),
      title: escapeHtml(t('consent.banner.title')),
      description: escapeHtml(t('consent.banner.description')),
      acceptAllBtn: escapeHtml(t('consent.acceptAll')),
      acceptNecessaryBtn: escapeHtml(t('consent.rejectAll')),
      showPreferencesBtn: escapeHtml(t('consent.banner.settings')),
      footer: cookiePolicyLink(t, locale),
    },
    preferencesModal: {
      title: escapeHtml(t('consent.preferences.title')),
      acceptAllBtn: escapeHtml(t('consent.acceptAll')),
      acceptNecessaryBtn: escapeHtml(t('consent.rejectAll')),
      savePreferencesBtn: escapeHtml(t('consent.preferences.save')),
      closeIconLabel: escapeHtml(t('consent.preferences.close')),
      sections: [
        { description: escapeHtml(t('consent.preferences.description')) },
        categorySection(t, 'necessary'),
        categorySection(t, 'analytics'),
        categorySection(t, 'marketing'),
        {
          title: escapeHtml(t('consent.preferences.moreTitle')),
          description: cookiePolicyLink(t, locale),
        },
      ],
    },
  };
}
