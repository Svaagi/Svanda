import { LEGAL_IDENTITY, LEGAL_SEAT_ADDRESS } from 'constants/legalIdentity';
import { DEFAULT_LOCALE, type Locale } from 'constants/locales';
import { APP_ICON_512_PATH, ogImagePath, SITE_ORIGIN } from 'constants/seo';
import { getLocalePath } from 'i18n';
import type { TFunction } from 'i18next';

import { absoluteUrl } from './pageMeta';

const SCHEMA_CONTEXT = 'https://schema.org';
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const PRODUCT_ID = `${SITE_ORIGIN}/#product`;
const ICO_PROPERTY_ID = 'IČO';

// Only details the operator has confirmed: the legal name and DIČ are still pending, and the
// social profile links are placeholders, so none of them is published here.
function organization(t: TFunction) {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: LEGAL_IDENTITY.tradeName,
    url: absoluteUrl(getLocalePath(DEFAULT_LOCALE)),
    logo: absoluteUrl(APP_ICON_512_PATH),
    description: t('seo.organization'),
    email: LEGAL_IDENTITY.email,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: ICO_PROPERTY_ID,
      value: LEGAL_IDENTITY.ico,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: LEGAL_SEAT_ADDRESS.street,
      postalCode: LEGAL_SEAT_ADDRESS.postalCode,
      addressLocality: LEGAL_SEAT_ADDRESS.locality,
      addressCountry: LEGAL_SEAT_ADDRESS.countryCode,
    },
  };
}

// Nested as an offer rather than a top-level Product: a Product node without a price or
// reviews fails Google's rich results test, and the jukebox has no public price to publish.
function jukeboxOffer(locale: Locale, t: TFunction) {
  return {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Product',
      '@id': PRODUCT_ID,
      name: t('seo.product.name'),
      description: t('seo.product.description'),
      url: absoluteUrl(getLocalePath(locale)),
      image: absoluteUrl(ogImagePath(locale)),
      brand: { '@type': 'Brand', name: LEGAL_IDENTITY.tradeName },
    },
  };
}

export function buildStructuredData(locale: Locale, t: TFunction) {
  return {
    '@context': SCHEMA_CONTEXT,
    ...organization(t),
    makesOffer: jukeboxOffer(locale, t),
  };
}
