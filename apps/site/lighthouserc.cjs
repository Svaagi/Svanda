// Lighthouse CI: mobile lab runs (Lighthouse's default Moto G Power profile, simulated slow
// 4G and 4x CPU) against the production build served precompressed, as the host serves it.
// Run after `pnpm build` with `pnpm --filter @svanda/site lighthouse`. Every assertion uses
// the median of the runs.

const PREVIEW_URL = 'http://localhost:4173';
const RUNS_PER_URL = 3;

// Budgets from the performance ticket: LCP under 2.5 s and CLS under 0.1 on mobile, plus a
// total blocking time budget. CLS (0 everywhere) and the legal page's TBT are enforced; the
// LCP and home TBT budgets are not met yet and stay visible as warnings.
const LCP_BUDGET_MS = 2500;
const CLS_BUDGET = 0.1;
const TBT_BUDGET_MS = 300;

// Regression ceilings, about 15% above the worst local medians, until the budgets are met:
// - home: LCP 3.97 to 4.08 s, TBT 0.8 to 1.15 s. On a first visit the intro covers the page
//   until the app starts it, so the first contentful paint waits for hydration (stretched by
//   the 4x CPU slowdown); the blocking time is hydration plus the 3D scene.
// - legal: LCP 2.27 s, or 2.69 s in runs where Chrome holds the first frame until the module
//   scripts have run (not seen when the modulepreload links are removed).
const HOME_LCP_CEILING_MS = 4700;
const HOME_TBT_CEILING_MS = 1320;
const LEGAL_LCP_CEILING_MS = 3100;

const HOME_URL_PATTERN = '^http://localhost:4173/(en|sk)?$';
// Every other page: anything that is not a home page.
const OTHER_URL_PATTERN = '^http://localhost:4173/(?!(en|sk)?$).+';
const ALL_URL_PATTERN = '.*';

const maxValue = (level, value) => [
  level,
  { maxNumericValue: value, aggregationMethod: 'median-run' },
];

module.exports = {
  ci: {
    collect: {
      // The preview server, without --quiet so its ready line tells Lighthouse CI to start.
      startServerCommand: 'pnpm exec sirv build/client --port 4173',
      // The landing page and a content page, which every legal page shares the layout of.
      url: [`${PREVIEW_URL}/`, `${PREVIEW_URL}/en/legal`],
      numberOfRuns: RUNS_PER_URL,
      settings: {
        chromeFlags: '--headless=new --no-sandbox',
      },
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: ALL_URL_PATTERN,
          assertions: {
            'cumulative-layout-shift': maxValue('error', CLS_BUDGET),
            'largest-contentful-paint': maxValue('warn', LCP_BUDGET_MS),
            'total-blocking-time': maxValue('warn', TBT_BUDGET_MS),
          },
        },
        {
          matchingUrlPattern: HOME_URL_PATTERN,
          assertions: {
            'largest-contentful-paint': maxValue('error', HOME_LCP_CEILING_MS),
            'total-blocking-time': maxValue('error', HOME_TBT_CEILING_MS),
          },
        },
        {
          matchingUrlPattern: OTHER_URL_PATTERN,
          assertions: {
            'largest-contentful-paint': maxValue('error', LEGAL_LCP_CEILING_MS),
            'total-blocking-time': maxValue('error', TBT_BUDGET_MS),
          },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
