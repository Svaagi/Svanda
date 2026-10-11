import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT_PATH = fileURLToPath(
  new URL('./checkEnvFiles.mjs', import.meta.url),
);
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

const fixtureRepos: string[] = [];

function createRepo(trackedFiles: string[]) {
  const dir = mkdtempSync(join(tmpdir(), 'svanda-env-'));
  fixtureRepos.push(dir);
  execFileSync('git', ['init', '--quiet'], { cwd: dir });
  for (const file of trackedFiles) {
    mkdirSync(join(dir, dirname(file)), { recursive: true });
    writeFileSync(join(dir, file), 'KEY=value\n');
  }
  if (trackedFiles.length > 0) {
    execFileSync('git', ['add', '--force', ...trackedFiles], { cwd: dir });
  }

  return dir;
}

function runCheck(repoDir: string) {
  const { status, stderr } = spawnSync(
    process.execPath,
    [SCRIPT_PATH, repoDir],
    { encoding: 'utf8' },
  );

  return { status, stderr };
}

afterEach(() => {
  fixtureRepos
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true }));
});

describe('checkEnvFiles', () => {
  it('passes on this repository', () => {
    expect(runCheck(REPO_ROOT)).toEqual({ status: 0, stderr: '' });
  });

  it('passes when only .env.example templates are tracked', () => {
    const repo = createRepo(['.env.example', 'apps/site/.env.example']);

    expect(runCheck(repo).status).toBe(0);
  });

  it('ignores an untracked .env file', () => {
    const repo = createRepo(['README']);
    writeFileSync(join(repo, '.env'), 'SECRET=1\n');

    expect(runCheck(repo).status).toBe(0);
  });

  it.each(['.env', 'apps/contact-api/.env', 'infra/.env.production'])(
    'fails when %s is tracked',
    (file) => {
      const repo = createRepo(['.env.example', file]);

      const { status, stderr } = runCheck(repo);

      expect(status).toBe(1);
      expect(stderr).toContain(file);
    },
  );

  it('does not flag files that only contain "env" in their name', () => {
    const repo = createRepo(['src/env.ts', 'config/.environment', 'a.env.md']);

    expect(runCheck(repo).status).toBe(0);
  });
});
