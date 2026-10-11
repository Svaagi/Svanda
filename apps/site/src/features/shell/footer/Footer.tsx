import { COPYRIGHT_YEAR, LEGAL_LINKS } from 'constants/legal';
import { SOCIAL_LINKS } from 'constants/social';
import { useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from 'ui';
import { childTestId } from 'utils';

import styles from './footer.module.css';

export type FooterProps = {
  // The consent manager plugs in here; without it the button is not rendered.
  onOpenCookieSettings?: () => void;
  testId?: string;
};

export function Footer({
  onOpenCookieSettings,
  testId = 'footer',
}: FooterProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <footer className={styles.footer} data-testid={testId}>
      <p data-testid={childTestId(testId, 'copyright')}>
        {t('footer.copyright', { year: COPYRIGHT_YEAR })}
      </p>
      <ul className={styles.links}>
        {SOCIAL_LINKS.map(({ id, href }) => (
          <li key={id}>
            <a
              href={href}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={childTestId(testId, id)}
            >
              {t(`footer.${id}`)}
            </a>
          </li>
        ))}
        {LEGAL_LINKS.map(({ id, paths }) => (
          <li key={id}>
            <Link
              to={paths[locale]}
              className={styles.link}
              data-testid={childTestId(testId, id)}
            >
              {t(`footer.${id}`)}
            </Link>
          </li>
        ))}
        {onOpenCookieSettings && (
          <li>
            <Button
              variant="ghost"
              onClick={onOpenCookieSettings}
              testId={childTestId(testId, 'cookie-settings')}
            >
              {t('footer.cookieSettings')}
            </Button>
          </li>
        )}
      </ul>
    </footer>
  );
}
