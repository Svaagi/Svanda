import { MAIN_CONTENT_ID } from 'constants/nav';
import { NOT_FOUND_CELL_PX, NOT_FOUND_CODE } from 'constants/notFound';
import { NOT_FOUND_PATHS } from 'constants/seo';
import { openCookieSettings } from 'features/consent';
import { Footer, SkipLink, SubpageHeader } from 'features/shell';
import { getLocalePath, useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button, PixelText } from 'ui';
import { childTestId } from 'utils';

import styles from './notFoundPage.module.css';

export type NotFoundPageProps = {
  testId?: string;
};

export function NotFoundPage({ testId = 'not-found-page' }: NotFoundPageProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <SkipLink />
      <SubpageHeader paths={NOT_FOUND_PATHS} />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={styles.main}
        data-testid={testId}
        data-locale={locale}
      >
        <div className={styles.content}>
          <PixelText
            text={NOT_FOUND_CODE}
            cellSize={NOT_FOUND_CELL_PX}
            testId={childTestId(testId, 'code')}
          />
          <h1
            className={styles.title}
            data-testid={childTestId(testId, 'title')}
          >
            {t('notFound.title')}
          </h1>
          <p className={styles.body}>{t('notFound.body')}</p>
          <Button asChild variant="pixel" testId={childTestId(testId, 'home')}>
            <Link to={getLocalePath(locale)}>{t('notFound.home')}</Link>
          </Button>
        </div>
      </main>
      <Footer onOpenCookieSettings={openCookieSettings} />
    </>
  );
}
