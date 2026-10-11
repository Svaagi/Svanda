import {
  DEFAULT_THEME,
  LIGHT_SCHEME_QUERY,
  type Theme,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  THEMES,
} from 'constants/theme';
import { getMediaQueryList, readStorage, writeStorage } from 'utils';

// The `data-theme` attribute on <html> is the single source of truth: the pre-paint script
// writes it first, this store keeps it current and notifies subscribed hooks.
const listeners = new Set<() => void>();
// One shared system-preference subscription, held while at least one hook is mounted.
let systemQuery: MediaQueryList | null = null;

function isTheme(value: unknown): value is Theme {
  return THEMES.some((theme) => theme === value);
}

function readStoredTheme(): Theme | null {
  const value = readStorage(THEME_STORAGE_KEY);
  return isTheme(value) ? value : null;
}

function readSystemTheme(): Theme {
  return getMediaQueryList(LIGHT_SCHEME_QUERY)?.matches
    ? 'light'
    : DEFAULT_THEME;
}

export function readAppliedTheme(): Theme {
  const value = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return isTheme(value) ? value : DEFAULT_THEME;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  listeners.forEach((listener) => listener());
}

export function chooseTheme(theme: Theme) {
  writeStorage(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

function syncThemeWithPreferences() {
  applyTheme(readStoredTheme() ?? readSystemTheme());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    systemQuery = getMediaQueryList(LIGHT_SCHEME_QUERY);
    systemQuery?.addEventListener('change', syncThemeWithPreferences);
    syncThemeWithPreferences();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    systemQuery?.removeEventListener('change', syncThemeWithPreferences);
    systemQuery = null;
  };
}
