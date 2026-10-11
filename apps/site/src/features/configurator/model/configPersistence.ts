import {
  isRecord,
  JUKEBOX_CONFIG_DEFAULTS,
  JUKEBOX_SECTIONS,
  JUKEBOX_UI_DESIGNS,
  type JukeboxConfig,
  type JukeboxSection,
  type JukeboxUiDesign,
  mergeJukeboxConfig,
} from '@svanda/shared';
import { readStorage, removeStorage, writeStorage } from 'utils';
import type { StateStorage } from 'zustand/middleware';

// What survives a reload: the configuration, where the visitor was editing and whether it
// goes with the contact request. The payment preview is a momentary toggle.
export type PersistedConfigurator = {
  config: JukeboxConfig;
  design: JukeboxUiDesign;
  section: JukeboxSection;
  isAttached: boolean;
};

export const DEFAULT_PERSISTED_CONFIGURATOR: PersistedConfigurator = {
  config: JUKEBOX_CONFIG_DEFAULTS,
  design: 'pixel',
  section: 'sing',
  isAttached: false,
};

// localStorage behind the try/catch helpers: blocked storage reads as empty and drops writes.
export const configuratorStorage: StateStorage = {
  getItem: readStorage,
  setItem: writeStorage,
  removeItem: removeStorage,
};

const isOneOf = <TValue extends string>(
  options: readonly TValue[],
  value: unknown,
): value is TValue => options.some((option) => option === value);

const readField = (source: unknown, key: string): unknown =>
  isRecord(source) ? source[key] : undefined;

// Stored data is untrusted (edited by hand, written by an older version): every valid field
// is kept and anything else falls back to the default.
export function restorePersistedConfigurator(
  persisted: unknown,
): PersistedConfigurator {
  const defaults = DEFAULT_PERSISTED_CONFIGURATOR;
  const design = readField(persisted, 'design');
  const section = readField(persisted, 'section');
  const isAttached = readField(persisted, 'isAttached');

  return {
    config: mergeJukeboxConfig(defaults.config, readField(persisted, 'config')),
    design: isOneOf(JUKEBOX_UI_DESIGNS, design) ? design : defaults.design,
    section: isOneOf(JUKEBOX_SECTIONS, section) ? section : defaults.section,
    isAttached:
      typeof isAttached === 'boolean' ? isAttached : defaults.isAttached,
  };
}

// Converts state stored by an older version to the current shape. Version 1 is the first
// shape, so there is no step yet; validation happens once, in the store's `merge`.
export const migratePersistedConfigurator = (persisted: unknown): unknown =>
  persisted;
