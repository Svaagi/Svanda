import { CONTACT_PAGE, KARAOKE_PAGE, VENUES_PAGE } from 'constants/stage';
import { useStageStore } from 'features/stage';
import { track } from 'lib/analytics';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { sectionForPage, trackSectionViews } from './sectionViews';

vi.mock('lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lib/analytics')>()),
  track: vi.fn(),
}));

describe('sectionForPage', () => {
  it('names the stage pages and the contact section', () => {
    expect(sectionForPage(0)).toBe('top');
    expect(sectionForPage(VENUES_PAGE)).toBe('venues');
    expect(sectionForPage(CONTACT_PAGE)).toBe('contact');
    expect(sectionForPage(CONTACT_PAGE + 1)).toBeUndefined();
  });
});

describe('trackSectionViews', () => {
  afterEach(() => {
    useStageStore.setState({ page: 0 });
    vi.clearAllMocks();
  });

  it('tracks each page change once and nothing else', () => {
    const stop = trackSectionViews();

    useStageStore.setState({ page: KARAOKE_PAGE });
    useStageStore.setState({ vp: 1.5 });
    useStageStore.setState({ page: KARAOKE_PAGE });
    useStageStore.setState({ page: CONTACT_PAGE });
    stop();
    useStageStore.setState({ page: 0 });

    expect(vi.mocked(track).mock.calls).toEqual([
      ['section_view', { section: 'karaoke' }],
      ['section_view', { section: 'contact' }],
    ]);
  });
});
