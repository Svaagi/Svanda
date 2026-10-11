import { JUKEBOX_SECTIONS, type JukeboxSection } from '@svanda/shared';
import { useTranslation } from 'react-i18next';
import { childTestId } from 'utils';

export type AppSectionToggleProps = {
  section: JukeboxSection;
  className?: string;
  optionClassName?: string;
  testId: string;
};

// KARAOKE / NORMAL with the shown section marked active.
export function AppSectionToggle({
  section,
  className,
  optionClassName,
  testId,
}: AppSectionToggleProps) {
  const { t } = useTranslation();

  return (
    <div className={className} data-testid={testId}>
      {JUKEBOX_SECTIONS.map((option) => (
        <span
          key={option}
          className={optionClassName}
          data-active={option === section}
          data-testid={childTestId(testId, option)}
        >
          {t(`jukeboxUi.toggle.${option}`)}
        </span>
      ))}
    </div>
  );
}
