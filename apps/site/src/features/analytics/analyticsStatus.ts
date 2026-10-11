import type { ConsentCategory } from 'constants/consent';
import type { AnalyticsStatus } from 'lib/analytics';

// No category at all means the consent manager has not read the choice yet: once it has,
// `necessary` is always among them.
export function analyticsStatusFor(
  categories: readonly ConsentCategory[],
): AnalyticsStatus {
  if (categories.length === 0) return 'pending';

  return categories.includes('analytics') ? 'on' : 'off';
}
