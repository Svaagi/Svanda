// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT_PATH = fileURLToPath(new URL('./checkI18n.mjs', import.meta.url));

const REFERENCE = { nav: { contact: 'Kontakt', menu: 'MENU' } };

const fixtureDirs: string[] = [];

function writeCatalogs(catalogs: Record<string, unknown>) {
  const dir = mkdtempSync(join(tmpdir(), 'svanda-i18n-'));
  fixtureDirs.push(dir);
  for (const [locale, catalog] of Object.entries(catalogs)) {
    writeFileSync(join(dir, `${locale}.json`), JSON.stringify(catalog));
  }

  return dir;
}

function runCheck(dir?: string) {
  const { status, stderr } = spawnSync(
    process.execPath,
    dir ? [SCRIPT_PATH, dir] : [SCRIPT_PATH],
    { encoding: 'utf8' },
  );

  return { status, stderr };
}

afterEach(() => {
  fixtureDirs.splice(0).forEach((dir) => rmSync(dir, { recursive: true }));
});

describe('checkI18n', () => {
  it('passes on the real cs, en and sk catalogs', () => {
    expect(runCheck()).toEqual({ status: 0, stderr: '' });
  });

  it('passes when catalogs match and ignores translator notes', () => {
    const dir = writeCatalogs({
      cs: REFERENCE,
      sk: { _meta: { note: 'review' }, ...REFERENCE },
    });

    expect(runCheck(dir).status).toBe(0);
  });

  it('fails when a key is removed from one catalog', () => {
    const dir = writeCatalogs({
      cs: REFERENCE,
      en: { nav: { contact: 'Contact' } },
    });

    const { status, stderr } = runCheck(dir);

    expect(status).toBe(1);
    expect(stderr).toContain('en: missing key "nav.menu"');
  });

  it('fails on a key the reference catalog does not have', () => {
    const dir = writeCatalogs({
      cs: REFERENCE,
      en: { nav: { ...REFERENCE.nav, extra: 'Extra' } },
    });

    const { status, stderr } = runCheck(dir);

    expect(status).toBe(1);
    expect(stderr).toContain('en: orphaned key "nav.extra"');
  });

  it('fails on empty and non-string values', () => {
    const dir = writeCatalogs({
      cs: REFERENCE,
      en: { nav: { contact: ' ', menu: 1 } },
    });

    const { status, stderr } = runCheck(dir);

    expect(status).toBe(1);
    expect(stderr).toContain('"nav.contact"');
    expect(stderr).toContain('"nav.menu"');
  });

  it('fails without a reference catalog', () => {
    const dir = writeCatalogs({ en: REFERENCE });

    expect(runCheck(dir).status).toBe(1);
  });
});
