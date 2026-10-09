import type { JukeboxSection } from '@svanda/shared';
import {
  JUKEBOX_UI_CREDIT_CZK,
  JUKEBOX_UI_SONG_PRICE_CZK,
  JUKEBOX_UI_VIP_PRICE_CZK,
} from 'constants/jukeboxUi';
import type { Locale } from 'constants/locales';
import {
  NOW_PLAYING,
  NOW_PLAYING_ELAPSED_S,
  type Song,
  SONGS,
} from 'constants/songs';
import type { TFunction } from 'i18next';

import {
  czkSymbol,
  formatCzk,
  formatDuration,
  songInitials,
} from './appFormat';

export type AppSong = {
  id: string;
  label: string;
  duration: string;
  initials: string;
  isVip: boolean;
};

export type AppPayment = {
  title: string;
  balance: string;
  add: string;
  vip: string;
};

export type AppContent = {
  songs: AppSong[];
  nowPlaying: AppSong & { time: string };
  credit: number;
  currencySymbol: string;
  payment: AppPayment;
};

function songRow(song: Song, section: JukeboxSection, t: TFunction): AppSong {
  return {
    id: song.id,
    label: t(`jukeboxUi.song.${section}`, {
      title: song.title,
      artist: song.artist,
    }),
    duration: formatDuration(song.durationS),
    initials: songInitials(song.artist),
    isVip: Boolean(song.isVip),
  };
}

function buildPayment(
  title: string,
  credit: number,
  locale: Locale,
  t: TFunction,
): AppPayment {
  return {
    title,
    balance: formatCzk(credit, locale),
    add: t('jukeboxUi.payment.add', {
      price: formatCzk(JUKEBOX_UI_SONG_PRICE_CZK, locale),
    }),
    vip: t('jukeboxUi.payment.vip', {
      price: formatCzk(JUKEBOX_UI_VIP_PRICE_CZK, locale),
    }),
  };
}

// Everything both app designs show for a section, in the visitor's language. The payment
// window offers the first song of the list.
export function buildAppContent(
  section: JukeboxSection,
  locale: Locale,
  t: TFunction,
): AppContent {
  const songs = SONGS[section].map((song) => songRow(song, section, t));
  const nowPlaying = songRow(NOW_PLAYING, 'listen', t);
  const credit = JUKEBOX_UI_CREDIT_CZK[section];

  return {
    songs,
    nowPlaying: {
      ...nowPlaying,
      time: t('jukeboxUi.nowPlayingTime', {
        elapsed: formatDuration(NOW_PLAYING_ELAPSED_S),
        duration: nowPlaying.duration,
      }),
    },
    credit,
    currencySymbol: czkSymbol(locale),
    payment: buildPayment(songs[0]?.label ?? '', credit, locale, t),
  };
}
