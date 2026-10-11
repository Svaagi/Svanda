import { DEFAULT_THEME, type Theme } from 'constants/theme';
import { useCallback, useSyncExternalStore } from 'react';

import { chooseTheme, readAppliedTheme, subscribeTheme } from './themeStore';

const getServerTheme = (): Theme => DEFAULT_THEME;

export function useTheme() {
  // The server snapshot keeps prerendered markup and the hydration render identical; the real
  // theme (already painted by the head script) is picked up right after hydration.
  const theme = useSyncExternalStore(
    subscribeTheme,
    readAppliedTheme,
    getServerTheme,
  );

  const toggleTheme = useCallback(() => {
    chooseTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  return { theme, setTheme: chooseTheme, toggleTheme };
}
