import { SONGS } from 'constants/songs';
import { getI18nInstance } from 'i18n/i18nInstance';
import { describe, expect, it } from 'vitest';

import { buildAppContent } from './appContent';

const normalizeSpaces = (text: string) => text.replace(/\s/g, ' ');

describe('buildAppContent', () => {
  const english = getI18nInstance('en').t;
  const czech = getI18nInstance('cs').t;

  it('labels karaoke songs as karaoke versions', () => {
    const { songs } = buildAppContent('sing', 'en', english);

    expect(songs).toHaveLength(SONGS.sing.length);
    expect(songs[0]).toEqual({
      id: 'bohemian-rhapsody',
      label: 'Bohemian Rhapsody (Karaoke) - Queen',
      duration: '5:55',
      initials: 'Q',
      isVip: false,
    });
    expect(songs.filter(({ isVip }) => isVip)).toHaveLength(1);
  });

  it('shows plain songs and less credit on the listening screen', () => {
    const content = buildAppContent('listen', 'en', english);

    expect(content.songs[1]?.label).toBe("Don't Stop Believin' - Journey");
    expect(content.credit).toBe(40);
    expect(content.nowPlaying).toMatchObject({
      label: 'Take Me Home, Country Roads - John Denver',
      time: '0:42 / 3:10',
      initials: 'JD',
    });
  });

  it('prices the payment window in CZK for the locale', () => {
    const { payment, currencySymbol } = buildAppContent('sing', 'cs', czech);

    expect(currencySymbol).toBe('Kč');
    expect(payment.title).toBe('Bohemian Rhapsody (Karaoke) - Queen');
    expect(normalizeSpaces(payment.balance)).toBe('120 Kč');
    expect(normalizeSpaces(payment.add)).toBe('Přidat za 10 Kč');
    expect(normalizeSpaces(payment.vip)).toBe('VIP za 20 Kč');
  });
});
