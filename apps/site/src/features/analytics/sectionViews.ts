import { CONTACT_PAGE, STAGE_PAGE_IDS } from 'constants/stage';
import { useStageStore } from 'features/stage';
import { type AnalyticsEvents, track } from 'lib/analytics';

type Section = AnalyticsEvents['section_view']['section'];

export const sectionForPage = (page: number): Section | undefined =>
  page === CONTACT_PAGE ? 'contact' : STAGE_PAGE_IDS[page];

// A section view each time the stage turns to another page. The page a visit lands on is
// counted by its page view. Returns a function that stops tracking.
export function trackSectionViews(): () => void {
  return useStageStore.subscribe(({ page }, previous) => {
    if (page === previous.page) return;
    const section = sectionForPage(page);
    if (section) track('section_view', { section });
  });
}
