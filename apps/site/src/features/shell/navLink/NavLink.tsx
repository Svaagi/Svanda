import type { NavItem } from 'constants/nav';
import { usePageLinkClick } from 'features/stage';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export type NavLinkProps = {
  item: NavItem;
  isActive: boolean;
  onNavigate: (page: number) => void;
  className?: string;
  testId: string;
};

// A real in-page anchor, so it works before hydration and in a new tab.
export const NavLink = memo(
  ({ item, isActive, onNavigate, className, testId }: NavLinkProps) => {
    const { t } = useTranslation();

    const handleClick = usePageLinkClick(item.page, onNavigate);

    return (
      <a
        href={`#${item.id}`}
        className={className}
        aria-current={isActive ? 'true' : undefined}
        onClick={handleClick}
        data-testid={testId}
      >
        {t(`nav.${item.id}`)}
      </a>
    );
  },
);

NavLink.displayName = 'NavLink';
