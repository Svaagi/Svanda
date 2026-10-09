import { isDoNotTrack, trackPageView } from 'lib/analytics';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { startAnalytics } from './startAnalytics';
import { UMAMI_CONFIG } from './umamiConfig';

// Client only: tracking starts after hydration and counts a page view per route.
export function useAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => startAnalytics(UMAMI_CONFIG, isDoNotTrack(navigator)), []);

  useEffect(() => {
    trackPageView();
  }, [pathname]);
}
