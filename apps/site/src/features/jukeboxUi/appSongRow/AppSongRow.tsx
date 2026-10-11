import { useTranslation } from 'react-i18next';
import { childTestId } from 'utils';

import type { AppSong } from '../appContent';

export type AppSongRowClassNames = {
  row?: string;
  title?: string;
  duration?: string;
  vip?: string;
};

export type AppSongRowProps = {
  song: AppSong;
  classNames: AppSongRowClassNames;
  testId: string;
};

export function AppSongRow({ song, classNames, testId }: AppSongRowProps) {
  const { t } = useTranslation();
  const { label, duration, isVip } = song;

  return (
    <li className={classNames.row} data-testid={testId}>
      <span className={classNames.title}>{label}</span>
      <span className={classNames.duration}>{duration}</span>
      {isVip && (
        <span
          className={classNames.vip}
          data-testid={childTestId(testId, 'vip')}
        >
          {t('jukeboxUi.vip')}
        </span>
      )}
    </li>
  );
}
