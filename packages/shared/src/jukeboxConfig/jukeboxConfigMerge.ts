import type { z } from 'zod';

import { isRecord } from '../utils/isRecord.js';
import {
  glassUiConfigSchema,
  type JukeboxConfig,
  type JukeboxSection,
  pixelUiConfigSchema,
} from './jukeboxConfigSchema.js';

const readChild = (source: unknown, key: string): unknown =>
  isRecord(source) ? source[key] : undefined;

function mergeSection<TSchema extends z.ZodObject>(
  schema: TSchema,
  base: z.infer<TSchema>,
  source: unknown,
): z.infer<TSchema> {
  if (!isRecord(source)) return base;
  const merged: Record<string, unknown> = { ...base };
  Object.entries(schema.shape).forEach(([key, field]) => {
    if (key in source && field.safeParse(source[key]).success) {
      merged[key] = source[key];
    }
  });

  return schema.parse(merged);
}

function mergeDesign<TSchema extends z.ZodObject>(
  schema: TSchema,
  base: Record<JukeboxSection, z.infer<TSchema>>,
  source: unknown,
) {
  return {
    sing: mergeSection(schema, base.sing, readChild(source, 'sing')),
    listen: mergeSection(schema, base.listen, readChild(source, 'listen')),
  };
}

// Takes every valid setting `source` carries over `base` and keeps `base` for anything
// missing, invalid or unknown, so stored or older data can never break the configuration.
export function mergeJukeboxConfig(
  base: JukeboxConfig,
  source: unknown,
): JukeboxConfig {
  return {
    pixel: mergeDesign(
      pixelUiConfigSchema,
      base.pixel,
      readChild(source, 'pixel'),
    ),
    glass: mergeDesign(
      glassUiConfigSchema,
      base.glass,
      readChild(source, 'glass'),
    ),
  };
}
