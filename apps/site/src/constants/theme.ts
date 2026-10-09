export const THEMES = ['dark', 'light'] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'dark';

export const THEME_STORAGE_KEY = 'svanda-theme';

export const THEME_ATTRIBUTE = 'data-theme';

export const LIGHT_SCHEME_QUERY = '(prefers-color-scheme: light)';

// Served from `public/`; it must stay an external file so the CSP needs no `unsafe-inline`.
export const THEME_INIT_SCRIPT_SRC = '/theme-init.js';
