import type { JukeboxSection, JukeboxUiDesign } from '@svanda/shared';
import type { ContactSubmitErrorCode } from 'constants/contact';
import type { Locale } from 'constants/locales';
import type { StagePageId } from 'constants/stage';
import type { Theme } from 'constants/theme';
import type { VenueId } from 'constants/venues';

type WebVitalName = 'CLS' | 'INP' | 'LCP';
type WebVitalRating = 'good' | 'needs-improvement' | 'poor';
type ClientErrorKind = 'error' | 'rejection';

// Every event the site may send and its properties. Nothing here may identify a visitor:
// no names, addresses, free text or raw error messages.
export type AnalyticsEvents = {
  cta_click: { target: 'hero' };
  language_change: { from: Locale; to: Locale };
  theme_change: { theme: Theme };
  section_view: { section: StagePageId | 'contact' };
  configurator_open: { layout: 'sheet' };
  configurator_change: { design: JukeboxUiDesign; section: JukeboxSection };
  configurator_export: { format: 'css' | 'json' };
  configurator_attach: { source: 'configurator' | 'contact' };
  venue_view: { venue: VenueId };
  lightbox_open: { venue: VenueId };
  contact_submit_success: undefined;
  contact_submit_error: { code: ContactSubmitErrorCode };
  web_vital: { metric: WebVitalName; value: number; rating: WebVitalRating };
  client_error: { kind: ClientErrorKind; hash: string };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

// Events without properties take none; every other event requires its own.
export type AnalyticsEventArgs<Event extends AnalyticsEventName> =
  AnalyticsEvents[Event] extends undefined ? [] : [AnalyticsEvents[Event]];
