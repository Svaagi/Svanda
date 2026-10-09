// Section ids double as the snap anchors of the five stage pages, in page order.
export const STAGE_PAGE_IDS = [
  'top',
  'karaoke',
  'jukebox',
  'custom',
  'venues',
] as const;
export const STAGE_PAGE_COUNT = STAGE_PAGE_IDS.length;
export const LAST_STAGE_PAGE = STAGE_PAGE_COUNT - 1;
// The contact section follows the stage and counts as one extra page for paging input.
export const CONTACT_PAGE = STAGE_PAGE_COUNT;
export const CONTACT_SECTION_ID = 'contact';

export type StagePageId = (typeof STAGE_PAGE_IDS)[number];

const stagePageIndex = (pageId: StagePageId) => STAGE_PAGE_IDS.indexOf(pageId);

export const HERO_PAGE = stagePageIndex('top');
export const KARAOKE_PAGE = stagePageIndex('karaoke');
export const JUKEBOX_PAGE = stagePageIndex('jukebox');
export const CUSTOM_PAGE = stagePageIndex('custom');
export const VENUES_PAGE = stagePageIndex('venues');

export const VP_TWEEN_DURATION_MS = 1100;
// One wheel gesture turns one page: it must follow this much wheel silence...
export const WHEEL_SILENCE_MS = 500;
// ...and come at least this long after the previous turn.
export const WHEEL_TURN_INTERVAL_MS = 1500;
// Scrolled this far past the top of the contact section, upward wheel and keys stay native.
export const CONTACT_NATIVE_SCROLL_TOLERANCE_PX = 2;

export const LAYER_FADE_RATE = 2.2;
export const VENUES_LAYER_FADE_RATE = 1.8;
export const LAYER_PARALLAX_PX = 90;

// `--sv-vp` precision: enough for smooth fades without rewriting the style on idle frames.
export const VP_CSS_DECIMALS = 4;
export const VP_CSS_PROPERTY = '--sv-vp';
