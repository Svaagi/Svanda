import type { NavItem } from 'constants/nav';
import { NavLink } from 'features/shell/navLink';
import { childTestId } from 'utils';

import styles from './header.module.css';
import { navRevealStyle } from './navReveal';

export type NavItemListProps = {
  items: readonly NavItem[];
  activePage: number;
  onNavigate: (page: number) => void;
  testId: string;
};

export function NavItemList({
  items,
  activePage,
  onNavigate,
  testId,
}: NavItemListProps) {
  return (
    <ul className={styles.items} data-testid={testId}>
      {items.map((item) => (
        <li
          key={item.id}
          className={styles.reveal}
          style={navRevealStyle(item.revealDelay)}
          data-testid={childTestId(testId, `item-${item.id}`)}
        >
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
  );
}
