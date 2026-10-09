import { LEGAL_PATHS } from 'constants/legal';
import { LEGAL_EFFECTIVE_DATE } from 'constants/legalIdentity';
import { MAIN_CONTENT_ID } from 'constants/nav';
import { openCookieSettings } from 'features/consent';
import { Footer, SkipLink, SubpageHeader } from 'features/shell';
import { useLocale } from 'i18n';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { childTestId, formatIsoDate, requireLegalPageId } from 'utils';

import { getLegalBlocks } from './legalContent';
import styles from './legalPage.module.css';
import { MarkdownBlocks } from './markdown';

export type LegalPageProps = {
  testId?: string;
};

export function LegalPage({ testId = 'legal-page' }: LegalPageProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { pathname } = useLocation();
  const pageId = requireLegalPageId(pathname);
  const blocks = useMemo(
    () => getLegalBlocks(pageId, locale),
    [pageId, locale],
  );

  return (
    <>
      <SkipLink />
      <SubpageHeader paths={LEGAL_PATHS[pageId]} testId="legal-header" />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={styles.main}
        data-testid={testId}
        data-page={pageId}
        data-locale={locale}
      >
        <article className={styles.article}>
          <MarkdownBlocks
            blocks={blocks}
            testId={childTestId(testId, 'content')}
          />
          <p
            className={styles.effective}
            data-testid={childTestId(testId, 'effective')}
          >
            {t('legal.effective', {
              date: formatIsoDate(LEGAL_EFFECTIVE_DATE, locale),
            })}
          </p>
        </article>
      </main>
      <Footer onOpenCookieSettings={openCookieSettings} />
    </>
  );
}
