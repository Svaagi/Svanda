import 'styles/fonts.css';
import 'styles/theme.css';
import 'styles/global.css';

import { DEFAULT_CURSOR_MODE } from 'constants/cursor';
import { THEME_INIT_SCRIPT_SRC } from 'constants/theme';
import { LocaleProvider, useLocale, useRememberedLocaleRedirect } from 'i18n';
import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const locale = useLocale();

  return (
    // The head script sets `data-theme` before hydration, so <html> attributes legitimately
    // differ from the prerendered markup.
    <html
      lang={locale}
      data-cursor={DEFAULT_CURSOR_MODE}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src={THEME_INIT_SCRIPT_SRC} />
        <Meta />
        <Links />
      </head>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useRememberedLocaleRedirect();

  return <Outlet />;
}
