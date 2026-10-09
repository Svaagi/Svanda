import type { JukeboxSection } from './jukeboxUi';

// Sample library shown in the jukebox app previews. Titles and artists are names and stay as
// they are; how a row reads (the karaoke suffix, the separator) comes from the catalogs.
export type Song = {
  id: string;
  title: string;
  artist: string;
  durationS: number;
  isVip?: boolean;
};

const BOHEMIAN_RHAPSODY: Song = {
  id: 'bohemian-rhapsody',
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  durationS: 355,
};
const LIVIN_ON_A_PRAYER: Song = {
  id: 'livin-on-a-prayer',
  title: "Livin' on a Prayer",
  artist: 'Bon Jovi',
  durationS: 249,
};
const I_WILL_SURVIVE: Song = {
  id: 'i-will-survive',
  title: 'I Will Survive',
  artist: 'Gloria Gaynor',
  durationS: 198,
  isVip: true,
};
const SWEET_CAROLINE: Song = {
  id: 'sweet-caroline',
  title: 'Sweet Caroline',
  artist: 'Neil Diamond',
  durationS: 206,
};

export const SONGS: Record<JukeboxSection, readonly Song[]> = {
  sing: [
    BOHEMIAN_RHAPSODY,
    {
      id: 'dont-stop-me-now',
      title: "Don't Stop Me Now",
      artist: 'Queen',
      durationS: 209,
    },
    {
      id: 'dancing-queen',
      title: 'Dancing Queen',
      artist: 'ABBA',
      durationS: 232,
    },
    LIVIN_ON_A_PRAYER,
    { id: 'my-way', title: 'My Way', artist: 'Frank Sinatra', durationS: 275 },
    I_WILL_SURVIVE,
    SWEET_CAROLINE,
  ],
  listen: [
    BOHEMIAN_RHAPSODY,
    {
      id: 'dont-stop-believin',
      title: "Don't Stop Believin'",
      artist: 'Journey',
      durationS: 251,
    },
    I_WILL_SURVIVE,
    SWEET_CAROLINE,
    {
      id: 'i-wanna-dance-with-somebody',
      title: 'I Wanna Dance with Somebody',
      artist: 'Whitney Houston',
      durationS: 292,
    },
    LIVIN_ON_A_PRAYER,
    {
      id: 'blinding-lights',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      durationS: 263,
    },
  ],
};

export const NOW_PLAYING: Song = {
  id: 'take-me-home-country-roads',
  title: 'Take Me Home, Country Roads',
  artist: 'John Denver',
  durationS: 190,
};
export const NOW_PLAYING_ELAPSED_S = 42;
