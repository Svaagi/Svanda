import { UMAMI_DEFAULT_SRC } from 'constants/analytics';
import { resolveUmamiConfig } from 'lib/analytics';

const websiteId: string | undefined = import.meta.env.VITE_UMAMI_WEBSITE_ID;
const src: string | undefined = import.meta.env.VITE_UMAMI_SRC;

export const UMAMI_CONFIG = resolveUmamiConfig(
  { isProduction: import.meta.env.PROD, websiteId, src },
  UMAMI_DEFAULT_SRC,
);
