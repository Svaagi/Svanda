import { childTestId } from 'utils';

import type { AppSong } from '../appContent';
import { AppSongRow, type AppSongRowClassNames } from '../appSongRow';
import styles from './pixelJukeboxUi.module.css';

const ROW_CLASS_NAMES: AppSongRowClassNames = {
  row: styles.row,
  title: styles.songTitle,
  duration: styles.duration,
  vip: styles.vip,
};

export type PixelSongListProps = {
  songs: AppSong[];
  testId: string;
};

export function PixelSongList({ songs, testId }: PixelSongListProps) {
  return (
    <ul className={styles.list} data-testid={testId}>
      {songs.map((song) => (
        <AppSongRow
          key={song.id}
          song={song}
          classNames={ROW_CLASS_NAMES}
          testId={childTestId(testId, song.id)}
        />
      ))}
    </ul>
  );
}
