import { useTheme } from 'hooks';
import { useTranslation } from 'react-i18next';
import { IconButton, PixelIcon } from 'ui';
import { childTestId } from 'utils';

export type ThemeToggleProps = {
  testId?: string;
};

export function ThemeToggle({ testId = 'theme-toggle' }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? t('nav.themeToLight') : t('nav.themeToDark');

  return (
    <IconButton
      label={label}
      title={label}
      onClick={toggleTheme}
      testId={testId}
    >
      <PixelIcon
        name={isDark ? 'sun' : 'moon'}
        testId={childTestId(testId, 'icon')}
      />
    </IconButton>
  );
}
