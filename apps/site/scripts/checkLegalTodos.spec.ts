// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT_PATH = fileURLToPath(
  new URL('./checkLegalTodos.mjs', import.meta.url),
);

const fixtureDirs: string[] = [];

function writeFixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'svanda-legal-'));
  fixtureDirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    const path = join(dir, name);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content);
  }

  return dir;
}

function runCheck(...targets: string[]) {
  const { status, stderr } = spawnSync(
    process.execPath,
    [SCRIPT_PATH, ...targets],
    { encoding: 'utf8' },
  );

  return { status, stderr };
}

afterEach(() => {
  fixtureDirs.splice(0).forEach((dir) => rmSync(dir, { recursive: true }));
});

describe('checkLegalTodos', () => {
  it('stays silent when no TODO remains', () => {
    const dir = writeFixture({
      'identity.ts': "export const NAME = 'Jana Novakova';",
      'cs/privacy.md': '# Ochrana osobních údajů',
    });

    expect(runCheck(dir)).toEqual({ status: 0, stderr: '' });
  });

  it('warns with the file and line of every TODO, without failing', () => {
    const dir = writeFixture({
      'identity.ts': "const A = 1;\nconst NAME = 'TODO: legal name';",
      'en/privacy.md': '<!-- TODO legal review -->\n# Privacy',
    });

    const { status, stderr } = runCheck(dir);

    expect(status).toBe(0);
    expect(stderr).toContain('2 legal TODO(s) remain');
    expect(stderr).toMatch(/identity\.ts:2: const NAME = 'TODO: legal name';/);
    expect(stderr).toMatch(/privacy\.md:1: <!-- TODO legal review -->/);
  });

  it('ignores words that only contain TODO', () => {
    const dir = writeFixture({ 'notes.md': 'TODOS and MASTODON' });

    expect(runCheck(dir).stderr).toBe('');
  });

  it('checks the real legal identity and texts by default', () => {
    const { status, stderr } = runCheck();

    expect(status).toBe(0);
    expect(stderr).toContain('legal TODO(s) remain');
    expect(stderr).toMatch(/legalIdentity\.ts:\d+:/);
  });
});
