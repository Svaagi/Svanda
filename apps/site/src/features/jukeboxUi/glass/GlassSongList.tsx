import { childTestId, classNames } from 'utils';

import type { AppSong } from '../appContent';
import { AppSongRow, type AppSongRowClassNames } from '../appSongRow';
import styles from './glassJukeboxUi.module.css';

const ROW_CLASS_NAMES: AppSongRowClassNames = {
  row: styles.row,
  title: styles.songTitle,
  duration: styles.duration,
  vip: styles.vip,
};

export type GlassSongListProps = {
  songs: AppSong[];
  testId: string;
};

// Cover thumbnails in their own glass column beside the song rows.
export function GlassSongList({ songs, testId }: GlassSongListProps) {
  return (
    <div className={styles.main} data-testid={testId}>
      <div
        className={classNames(styles.panel, styles.thumbs)}
        aria-hidden="true"
      >
        {songs.map(({ id, initials }) => (
          <span key={id} className={styles.thumb}>
            {initials}
          </span>
        ))}
      </div>
      <ul className={classNames(styles.panel, styles.songs)}>
        {songs.map((song) => (
          <AppSongRow
            key={song.id}
            song={song}
            classNames={ROW_CLASS_NAMES}
            testId={childTestId(testId, song.id)}
          />
        ))}
      </ul>
    </div>
  );
}
