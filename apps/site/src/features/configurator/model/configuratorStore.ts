import {
  type GlassUiConfig,
  type JukeboxConfig,
  jukeboxConfigPatchSchema,
  jukeboxConfigToCss,
  type JukeboxCssLabels,
  type JukeboxSection,
  type JukeboxUiDesign,
  mergeJukeboxConfig,
  type PixelUiConfig,
} from '@svanda/shared';
import {
  CONFIGURATOR_STORAGE_KEY,
  CONFIGURATOR_STORAGE_VERSION,
} from 'constants/configurator';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type ConfigImportResult, importConfigJson } from './configImport';
import {
  configuratorStorage,
  DEFAULT_PERSISTED_CONFIGURATOR,
  migratePersistedConfigurator,
  type PersistedConfigurator,
  restorePersistedConfigurator,
} from './configPersistence';

export type ConfigKey = keyof PixelUiConfig | keyof GlassUiConfig;
export type ConfigValue = string | number | boolean;

const JSON_INDENT = 2;

type ConfiguratorValues = PersistedConfigurator & {
  isPaymentModalShown: boolean;
};

type ConfiguratorActions = {
  setDesign: (design: JukeboxUiDesign) => void;
  setSection: (section: JukeboxSection) => void;
  setPaymentModalShown: (isPaymentModalShown: boolean) => void;
  // Sets one setting of the design and section being edited; false (and no change) when
  // the design has no such setting or the value is invalid for it.
  setValue: (key: ConfigKey, value: ConfigValue) => boolean;
  resetCurrent: () => void;
  importJson: (text: string) => ConfigImportResult;
  exportJson: () => string;
  // Both sections of the design being edited, as the jukebox app's CSS variables.
  exportCss: (labels: JukeboxCssLabels) => string;
  setAttached: (isAttached: boolean) => void;
  // The configuration to send with the contact request, or null when it is not attached.
  toAttachment: () => JukeboxConfig | null;
};

export type ConfiguratorState = ConfiguratorValues & ConfiguratorActions;

export function createInitialConfiguratorValues(): ConfiguratorValues {
  return { ...DEFAULT_PERSISTED_CONFIGURATOR, isPaymentModalShown: false };
}

// A patch touching only the design and section being edited.
const currentPatch = (
  { design, section }: ConfiguratorValues,
  settings: Record<string, unknown>,
) => ({ [design]: { [section]: settings } });

const persistedFields = ({
  config,
  design,
  section,
  isAttached,
}: ConfiguratorState): PersistedConfigurator => ({
  config,
  design,
  section,
  isAttached,
});

// Rehydrated from storage by `useConfiguratorHydration` after mount, so the prerendered
// HTML and the first client render both show the defaults.
export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      ...createInitialConfiguratorValues(),
      setDesign: (design) => set({ design }),
      setSection: (section) => set({ section }),
      setPaymentModalShown: (isPaymentModalShown) =>
        set({ isPaymentModalShown }),
      setValue: (key, value) => {
        const state = get();
        const patch = currentPatch(state, { [key]: value });
        if (!jukeboxConfigPatchSchema.safeParse(patch).success) return false;
        set({ config: mergeJukeboxConfig(state.config, patch) });
        return true;
      },
      resetCurrent: () => {
        const state = get();
        const defaults =
          DEFAULT_PERSISTED_CONFIGURATOR.config[state.design][state.section];
        set({
          config: mergeJukeboxConfig(
            state.config,
            currentPatch(state, defaults),
          ),
        });
      },
      importJson: (text) => {
        const result = importConfigJson(text, get().config);
        if (result.isOk) set({ config: result.config });
        return result;
      },
      exportJson: () => JSON.stringify(get().config, null, JSON_INDENT),
      exportCss: (labels) => {
        const { config, design } = get();
        return jukeboxConfigToCss(config, design, labels);
      },
      setAttached: (isAttached) => set({ isAttached }),
      toAttachment: () => {
        const { config, isAttached } = get();
        return isAttached ? config : null;
      },
    }),
    {
      name: CONFIGURATOR_STORAGE_KEY,
      version: CONFIGURATOR_STORAGE_VERSION,
      storage: createJSONStorage(() => configuratorStorage),
      skipHydration: true,
      partialize: persistedFields,
      migrate: migratePersistedConfigurator,
      // Nothing stored (or storage blocked) leaves the live state as it is.
      merge: (persisted, current) =>
        persisted === undefined
          ? current
          : { ...current, ...restorePersistedConfigurator(persisted) },
    },
  ),
);
