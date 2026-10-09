// Loaded only in the browser, on demand: the library and its styles stay out of the
// prerendered pages and the initial bundle.
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import './consent.css';

import * as CookieConsent from 'vanilla-cookieconsent';

export type CookieConsentApi = typeof CookieConsent;

export { CookieConsent };
