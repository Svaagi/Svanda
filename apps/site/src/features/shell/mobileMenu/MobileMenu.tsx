import { NAV_ITEMS } from 'constants/nav';
import { LanguageSwitch } from 'features/shell/languageSwitch';
import { NavLink } from 'features/shell/navLink';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'ui';
import { childTestId } from 'utils';

import styles from './mobileMenu.module.css';

export type MobileMenuProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  activePage: number;
  onNavigate: (page: number) => void;
  testId?: string;
};

// The Dialog owns the focus trap, Escape and focus restore. The language switch lives here
// because the mobile header has no room for it next to the menu button.
export function MobileMenu({
  open,
  onOpenChange,
  activePage,
  onNavigate,
  testId = 'mobile-menu',
}: MobileMenuProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('nav.menuLabel')}
      closeLabel={t('nav.close')}
      variant="sheet"
      testId={testId}
    >
      <div className={styles.body}>
        <ul className={styles.items}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavLink
                item={item}
                isActive={item.page === activePage}
                onNavigate={onNavigate}
                className={styles.link}
                testId={childTestId(testId, `link-${item.id}`)}
              />
            </li>
          ))}
        </ul>
        <div className={styles.languageSwitch}>
          <LanguageSwitch testId={childTestId(testId, 'language-switch')} />
        </div>
      </div>
    </Dialog>
  );
}
