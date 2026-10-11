export const CONSENT_CATEGORIES = [
  'necessary',
  'analytics',
  'marketing',
] as const;

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

// The cookie that stores the visitor's choices. The cookie policy names it and states its
// lifetime (6 months) in every locale; change those texts together with these values.
export const CONSENT_COOKIE_NAME = 'cc_cookie';
export const CONSENT_COOKIE_DAYS = 182;

// Raising the revision invalidates every stored choice, so the banner asks again. Raise it
// when a category or its purpose changes.
export const CONSENT_REVISION = 1;
