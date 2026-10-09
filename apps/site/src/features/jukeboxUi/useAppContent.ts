import type { JukeboxSection } from 'constants/jukeboxUi';
import { useLocale } from 'i18n';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type AppContent, buildAppContent } from './appContent';

export function useAppContent(section: JukeboxSection): AppContent {
  const { t } = useTranslation();
  const locale = useLocale();

  return useMemo(
    () => buildAppContent(section, locale, t),
    [section, locale, t],
  );
}
