import 'styles/fonts.css';
import 'styles/theme.css';
import 'styles/global.css';

import { DEFAULT_CURSOR_MODE } from 'constants/cursor';
import { INTRO_INIT_SCRIPT_SRC } from 'constants/intro';
import {
  APPLE_TOUCH_ICON_PATH,
  FAVICON_PATH,
  MANIFEST_PATH,
} from 'constants/seo';
import { THEME_INIT_SCRIPT_SRC } from 'constants/theme';
import { useAnalytics } from 'features/analytics';
import { useConsentManager } from 'features/consent';
import { LocaleProvider, useLocale, useRememberedLocaleRedirect } from 'i18n';
import type { ReactNode } from 'react';
import {
  Links,
  type LinksFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { ToastProvider } from 'ui';

export const links: LinksFunction = () => [
  { rel: 'icon', href: FAVICON_PATH, type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: APPLE_TOUCH_ICON_PATH },
  { rel: 'manifest', href: MANIFEST_PATH },
];

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const locale = useLocale();

  return (
    // The head scripts set `data-theme` and `data-intro` before hydration, so <html>
    // attributes legitimately differ from the prerendered markup.
    <html
      lang={locale}
      data-cursor={DEFAULT_CURSOR_MODE}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src={THEME_INIT_SCRIPT_SRC} />
        <script src={INTRO_INIT_SCRIPT_SRC} />
        <Meta />
        <Links />
      </head>
      <body>
        <LocaleProvider>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useRememberedLocaleRedirect();
  useConsentManager();
  useAnalytics();

  return <Outlet />;
}
