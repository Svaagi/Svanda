import type { ContactErrorCode } from '@svanda/shared';

// `network_error` is the site's own: the request never got an answer.
export type ContactSubmitErrorCode = ContactErrorCode | 'contact.network_error';

const SAME_ORIGIN_API_URL = '/api';
const TRAILING_SLASHES = /\/+$/;

const configuredApiUrl: string | undefined = import.meta.env
  .VITE_CONTACT_API_URL;

// Production serves the API on the same origin; the dev server proxies `/api` to it.
export const CONTACT_API_URL = (
  configuredApiUrl || SAME_ORIGIN_API_URL
).replace(TRAILING_SLASHES, '');
export const CONTACT_ENDPOINT = `${CONTACT_API_URL}/contact`;
export const CONTACT_CHALLENGE_ENDPOINT = `${CONTACT_ENDPOINT}/challenge`;

export const HTTP_TOO_MANY_REQUESTS = 429;

// The proof of work is spread over this many workers at most (fewer on smaller devices).
export const ALTCHA_MAX_WORKERS = 4;
// A challenge this close to expiring is replaced before it is solved.
export const ALTCHA_EXPIRY_MARGIN_MS = 60_000;
// Headroom over the API's minimum fill time, for the request to arrive after it.
export const CONTACT_FILL_TIME_MARGIN_MS = 250;
