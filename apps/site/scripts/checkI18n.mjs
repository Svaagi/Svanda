// Usage: node scripts/checkI18n.mjs [catalogDir]

import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_CATALOG_DIR = fileURLToPath(
  new URL('../src/i18n/locales', import.meta.url),
);
const REFERENCE_LOCALE = 'cs';
const CATALOG_EXTENSION = '.json';
// Translator notes, not copy.
const META_KEY = '_meta';

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenCatalog(node, prefix, entries) {
  for (const [key, value] of Object.entries(node)) {
    if (!prefix && key === META_KEY) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) flattenCatalog(value, path, entries);
    else entries.set(path, value);
  }

  return entries;
}

function readCatalogs(catalogDir) {
  return readdirSync(catalogDir)
    .filter((file) => file.endsWith(CATALOG_EXTENSION))
    .map((file) => ({
      locale: basename(file, CATALOG_EXTENSION),
      entries: flattenCatalog(
        JSON.parse(readFileSync(join(catalogDir, file), 'utf8')),
        '',
        new Map(),
      ),
    }));
}

function findEmptyKeys({ locale, entries }) {
  return [...entries]
    .filter(([, value]) => typeof value !== 'string' || !value.trim())
    .map(([key]) => `${locale}: empty or non-string value at "${key}"`);
}

function findParityProblems(reference, { locale, entries }) {
  const missing = [...reference.entries.keys()]
    .filter((key) => !entries.has(key))
    .map((key) => `${locale}: missing key "${key}"`);
  const orphaned = [...entries.keys()]
    .filter((key) => !reference.entries.has(key))
    .map(
      (key) => `${locale}: orphaned key "${key}" (not in ${reference.locale})`,
    );

  return [...missing, ...orphaned];
}

function checkCatalogs(catalogDir) {
  const catalogs = readCatalogs(catalogDir);
  const reference = catalogs.find(({ locale }) => locale === REFERENCE_LOCALE);
  if (!reference)
    return [`reference catalog ${REFERENCE_LOCALE}.json not found`];

  return catalogs.flatMap((catalog) => [
    ...findEmptyKeys(catalog),
    ...(catalog === reference ? [] : findParityProblems(reference, catalog)),
  ]);
}

const catalogDir = process.argv[2] ?? DEFAULT_CATALOG_DIR;
const problems = checkCatalogs(catalogDir);

if (problems.length > 0) {
  process.stderr.write(`i18n check failed:\n${problems.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('i18n check passed\n');
}
