import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { getI18nInstance } from './i18nInstance';
import { useLocale } from './useLocale';

type LocaleProviderProps = {
  children: ReactNode;
};

export function LocaleProvider({ children }: LocaleProviderProps) {
  const locale = useLocale();

  return (
    <I18nextProvider i18n={getI18nInstance(locale)}>{children}</I18nextProvider>
  );
}
