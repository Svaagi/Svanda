// Bump the version when the persisted shape changes and teach the store's `migrate` the step.
export const CONFIGURATOR_STORAGE_KEY = 'svanda-jukebox-config';
export const CONFIGURATOR_STORAGE_VERSION = 1;

// At this width and below the controls move into a bottom sheet under the live screen.
export const CONFIGURATOR_SHEET_QUERY = '(max-width: 900px)';
// Accordion groups open at first, and how many groups the first (left) column holds.
export const CONFIGURATOR_OPEN_GROUP_COUNT = 3;
export const CONFIGURATOR_START_COLUMN_GROUP_COUNT = 2;
// `#rrggbb`.
export const HEX_COLOR_MAX_LENGTH = 7;
// Visible lines of the import (and manual copy) field.
export const IMPORT_FIELD_ROWS = 6;
