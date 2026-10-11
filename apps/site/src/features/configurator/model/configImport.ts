import {
  isRecord,
  type JukeboxConfig,
  jukeboxConfigPatchSchema,
  mergeJukeboxConfig,
} from '@svanda/shared';

export type ConfigImportError = 'invalidJson' | 'invalidConfig';

export type ConfigImportResult =
  | { isOk: true; config: JukeboxConfig }
  | { isOk: false; error: ConfigImportError };

// The toast that explains each import error.
export const CONFIG_IMPORT_ERROR_KEYS = {
  invalidJson: 'configurator.toasts.invalidJson',
  invalidConfig: 'configurator.toasts.invalidConfig',
} as const satisfies Record<ConfigImportError, string>;

function parseJson(text: string): { data: unknown } | null {
  try {
    return { data: JSON.parse(text) as unknown };
  } catch {
    return null;
  }
}

// The design prototype stored its settings as `{ cfg, ui }`; a paste of that still imports.
const unwrapPrototypeExport = (data: unknown): unknown =>
  isRecord(data) && 'cfg' in data ? data.cfg : data;

// Applies pasted JSON (a full "Copy JSON" export or any part of it) over `base`. Every value
// it carries must be valid, otherwise nothing is applied.
export function importConfigJson(
  text: string,
  base: JukeboxConfig,
): ConfigImportResult {
  const parsed = parseJson(text);
  if (!parsed) return { isOk: false, error: 'invalidJson' };
  const patch = jukeboxConfigPatchSchema.safeParse(
    unwrapPrototypeExport(parsed.data),
  );
  if (!patch.success) return { isOk: false, error: 'invalidConfig' };

  return { isOk: true, config: mergeJukeboxConfig(base, patch.data) };
}
