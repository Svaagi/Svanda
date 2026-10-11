import { LOGO_CELL_MOBILE_PX, LOGO_CELL_PX } from './pixel';
import {
  CONTACT_PAGE,
  CONTACT_SECTION_ID,
  CUSTOM_PAGE,
  HERO_PAGE,
  JUKEBOX_PAGE,
  KARAOKE_PAGE,
  STAGE_PAGE_IDS,
  type StagePageId,
  VENUES_PAGE,
} from './stage';

export type NavItemId = Exclude<StagePageId, 'top'> | typeof CONTACT_SECTION_ID;

export type NavItem = {
  id: NavItemId;
  page: number;
  revealDelay: number;
};

// The items reveal from the logo outwards: the outermost controls come last.
export const NAV_REVEAL_DELAY_CENTRE = 0;
export const NAV_REVEAL_DELAY_NEAR = 0.075;
export const NAV_REVEAL_DELAY_OUTER = 0.225;

export const NAV_ITEMS_LEFT: readonly NavItem[] = [
  { id: 'karaoke', page: KARAOKE_PAGE, revealDelay: NAV_REVEAL_DELAY_OUTER },
  { id: 'jukebox', page: JUKEBOX_PAGE, revealDelay: NAV_REVEAL_DELAY_NEAR },
  { id: 'custom', page: CUSTOM_PAGE, revealDelay: NAV_REVEAL_DELAY_CENTRE },
];

export const NAV_ITEMS_RIGHT: readonly NavItem[] = [
  { id: 'venues', page: VENUES_PAGE, revealDelay: NAV_REVEAL_DELAY_NEAR },
  { id: 'contact', page: CONTACT_PAGE, revealDelay: NAV_REVEAL_DELAY_OUTER },
];

export const NAV_ITEMS = [...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT];

export const NAV_HOME_ID = STAGE_PAGE_IDS[HERO_PAGE];
export const NAV_HOME_PAGE = HERO_PAGE;

// Nav logo cell size per layout. The layout switches at MOBILE_BREAKPOINT_PX, the same
// constant the stage uses for `isMobile`, so the intro swarm targets the same size.
export const NAV_LOGO_CELL_PX = {
  desktop: LOGO_CELL_PX,
  mobile: LOGO_CELL_MOBILE_PX,
} as const;

export const MAIN_CONTENT_ID = 'main';
